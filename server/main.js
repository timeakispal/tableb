import '/imports/startup/server';
// import '/imports/startup/both';

// Locations = new Mongo.Collection('myLocations');
// Restaurants = new Mongo.Collection('myRestaurants');
// Tables = new Mongo.Collection('myTables');

Meteor.publish('restaurants', function() {
  return Restaurants.find();
});
Meteor.publish('tables', function() {
  return Tables.find();
});
Meteor.publish('locations', function() {
  return Locations.find();
});
Meteor.publish('userinfo', function() {
  return userInfo.find();
});
Meteor.publish('reviews', function() {
  return myReviews.find();
});
Meteor.publish('restAdmins', function() {
  return restaurantAdmins.find();
});
Meteor.publish('transactions', function() {
  return myTransactions.find();
});

Meteor.publish('places', function(param1, param2, param3, param4, param5, param6, param7, param8, param9, param10, param11, param12) {
    var wifi = param1;
    var food = param2;
    var terrace = param3;
    var pets = param4;
    var card = param5;
    var parking = param6;

    // {food: 1, terrace: 1}
    var conditions = {};
    if (wifi) {conditions["wifi"] = 1;}
    if (food) {conditions["food"] = 1;}
    if (terrace) {conditions["terrace"] = 1;}
    if (pets) {conditions["pet_friendly"] = 1;}
    if (card) {conditions["creditcard_accepted"] = 1;}
    if (parking) {conditions["parking"] = 1;}

    var type_restaurant = param7;
    var type_bar = param8;
    var type_bistro = param9;
    var type_pub = param10;
    var type_cafeteria = param11;
    var type_coffeehouse = param12;

    // "type" : ["pub", "restaurant"]
    var types = {};
    types["$in"] = [];
    if (type_restaurant) { types["$in"].push("restaurant"); }
    if (type_bar) { types["$in"].push("bar"); }
    if (type_bistro) { types["$in"].push("bistro"); }
    if (type_pub) { types["$in"].push("pub"); }
    if (type_cafeteria) { types["$in"].push("cafeteria"); }
    if (type_coffeehouse) { types["$in"].push("coffeehouse"); }

    conditions["type"] = types;

    return Restaurants.find(conditions);
});


Meteor.publish("images", function(){ return Images.find(); });

// DELETE ALL RESERVATIONS FROM THE PAST
var d = new Date();
var time = moment().format("HH:mm");
var minutes = time.split(":")[1];

Meteor.setInterval(function() {
    var d = new Date();
    var today = moment(d).format('YYYY-MM-DD');
    console.log("time:" + time + " - minutes:" + minutes);
    if (time == "00:" + minutes) {
        console.log("Delete reservations from earlier than " + moment(d).format('llll'));
        Tables.update({}, { $pull: { 'reservations': { 'res_date': {$lt: today}} } }, { multi: true });
    }
}, 43200000);

Meteor.startup(function () {
    Tables._ensureIndex({ "restaurant_id": 1});
    Tables._ensureIndex({ "number": 1});
    Tables._ensureIndex({ "seats": 1});
    myReviews._ensureIndex({ "rest_id": 1});
    myReviews._ensureIndex({ "user_id": 1});

    var d = new Date();
    var today = moment(d).format('YYYY-MM-DD');
    console.log("Delete reservations from earlier than " + moment(d).format('llll'));
    Tables.update({}, { $pull: { 'reservations': { 'res_date': {$lt: today}} } }, { multi: true });

    var dateThreshold = new Date();

    var t = myTransactions.findOne( { state: "pending", lastModified: { $lt: dateThreshold } } );
    if (t !== undefined && t !== "") {

        myTransactions.update(
           { _id: t._id, state: "pending" },
           {
             $set: { state: "canceling" },
             $currentDate: { lastModified: true }
           }
        );
        cancelTransaction();
    }

    t = myTransactions.findOne( { state: "applied", lastModified: { $lt: dateThreshold } } );
    if (t !== undefined && t !== "") {
        myTransactions.update(
           { _id: t._id, state: "applied" },
           {
             $set: { state: "canceling" },
             $currentDate: { lastModified: true }
           }
        );
        cancelTransaction();
    }

    console.log("Canceled any transaction that was pending " + moment(d).format('llll'));
});

Meteor.methods({
	'checkPassword': function(digest) {
		check(digest, String);

		if (this.userId) {
			var user = Meteor.user();
			var password = {digest: digest, algorithm: 'sha-256'};
			var result = Accounts._checkPassword(user, password);
			return result.error == null;
		} else {
			return false;
		}
	},

	'insertReservation': function(tableid, persons, email, phonenb, date, arrival_hour, leaving_hour) {
		var start = Number(arrival_hour.replace(":", ""));
		var end = Number(leaving_hour.replace(":", ""));
        var reservation = {"res_date": date, "persons": persons, "email" : email, "phonenb" : phonenb, "start" : start, "end" : end, "start_time" : arrival_hour, "end_time" : leaving_hour};
		var reservation_table = {"table_id" : tableid, "res_date": date, "email" : email, "phonenb" : phonenb, "start_time" : arrival_hour};
		var table = Tables.findOne({_id: tableid});

        myTransactions.insert(
            { 'table_id': tableid, 'restaurant_id': table.restaurant_id, 'res_date': date, 'arrival_time': arrival_hour, 'persons': persons, 'email': email, 'state': "initial", 'lastModified': new Date() }
        );

        var t = myTransactions.findOne( { 'state': "initial", 'table_id': tableid, 'res_date': date, 'arrival_time': arrival_hour, 'persons': persons } );

        myTransactions.update(
            { '_id': t._id, state: "initial" },
            {
              $set: { 'state': "pending" },
              $currentDate: { 'lastModified': true }
            }
        );

        Tables.update(
           { '_id': t.table_id, 'pendingTransactions': { $ne: t._id } },
           { $push: { 'pendingTransactions': t._id, 'reservations': reservation } }
        );

        Restaurants.update(
           { _id: t.restaurant_id, 'pendingTransactions': { $ne: t._id } },
           { $push: { 'pendingTransactions': t._id, 'reservations': reservation_table } }
        );

        myTransactions.update(
           { '_id': t._id, state: "pending" },
           {
             $set: { 'state': "applied" },
             $currentDate: { 'lastModified': true }
           }
        );

        Tables.update(
           { '_id': t.table_id, 'pendingTransactions': t._id },
           { $pull: { 'pendingTransactions': t._id } }
        );

        Restaurants.update(
           { '_id': t.restaurant_id, 'pendingTransactions': t._id },
           { $pull: { 'pendingTransactions': t._id } }
        );

        myTransactions.update(
           { '_id': t._id, 'state': "applied" },
           {
             $set: { 'state': "done" },
             $currentDate: { 'lastModified': true }
           }
        );

        // Tables.update({ '_id': tableid },{ $push: { reservations: reservation }});
    },

    'insertUserInfo' : function(userid, firstname, lastname, email, phonenb) {
    	var user_info = userInfo.findOne({user_id: userid});
    	if (user_info == undefined || user_info == "") {
    		userInfo.insert({
	            user_id: userid,
	            firstname: firstname,
	            lastname: lastname,
	            phonenb: phonenb
	        });
    	} else {
    		userInfo.update({ 'user_id': userid },{ $set: {firstname: firstname, lastname: lastname, phonenb: phonenb}});
    	}
    },

    'insertReview' : function(userid, rest_id, review, stars, date_inserted, stars_nb) {
    	var user = Meteor.user();
    	var username = user.username;
    	var user_info = userInfo.findOne({user_id: userid});
    	if (user_info !== undefined) {
    		if (user_info.firstname !== "") {
    			username = user_info.firstname;
    		}
    	}

    	myReviews.insert({
            user_id: userid,
            rest_id: rest_id,
            name: username,
            review: review,
            stars: stars,
            date_inserted: date_inserted
        });

        var restaurant = Restaurants.findOne({_id: rest_id});
        Restaurants.update({ '_id': restaurant._id }, { $inc: { stars_total: stars_nb} });
    },

    'updateRestInfo' : function(rest_id, email, phonenb, location, address, about) {
        var restaurant = Restaurants.findOne({_id: rest_id});
        Restaurants.update({ '_id': restaurant._id },{ $set: {email: email, phone_nb: phonenb, location: location, address: address, about: about}});
    },

    'removePlayer' : function(review_id, rest_id) {
        var currentUserId = Meteor.userId();
        if(currentUserId){
            myReviews.remove({ _id: review_id, rest_id: rest_id });
        }
    },

    'insertTable' : function(rest_id, rest_name, number, seats) {
        Tables.insert({
            restaurant_id: rest_id,
            restaurant_name: rest_name,
            number: number,
            seats: seats,
            reservations : []
        });
    },

    'removeTable' : function(table_id) {
        var currentUserId = Meteor.userId();
        if(currentUserId){
            Tables.remove({ _id: table_id});
        }
    },

    'updateTable' : function(table_id, seats) {
        var currentUserId = Meteor.userId();
        if(currentUserId){
            Tables.update({ '_id': table_id },{ $set: {seats: seats}});
        }
    },

    'removeReservation' : function(table_id, res_date, persons, email, phonenb, start_time, end_time) {
        var currentUserId = Meteor.userId();
        if(currentUserId){
            var table = Tables.findOne({_id: table_id});
            Tables.update({ _id: table._id },{ $pull: { 'reservations': { 'res_date': res_date, 'email': email, 'phonenb': phonenb, 'start_time': start_time } } });
        }
    },

    'updateHeaderImage' : function(rest_id, imagesURL) {
        var currentUserId = Meteor.userId();
        if(currentUserId){
            Restaurants.update({ '_id': rest_id },{ $set: imagesURL});
        }
    },
});

function cancelTransaction() {
    var t = myTransactions.findOne( { state: "canceling" } );
    Tables.update({ _id: t.table_id },{ $pull: { 'reservations': { 'res_date': t.res_date, 'email': t.email, 'persons': t.persons, 'start_time': t.arrival_time } } });

    Restaurants.update({ _id: t.restaurant_id },{ $pull: { 'reservations': { 'table_id' : t.table_id, 'res_date': t.res_date, 'email': t.email, 'start_time': t.arrival_time } } });
    myTransactions.update(
       { _id: t._id, state: "canceling" },
       {
         $set: { state: "cancelled" },
         $currentDate: { lastModified: true }
       }
    );
}
