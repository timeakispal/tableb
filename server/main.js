import '/imports/startup/server';

// process.env.MAIL_URL="smtp://timea.kispal93%40gmail.com:bernike005@smtp.gmail.com:465/";
// process.env.MONGO_URL="mongodb://localhost:27017,localhost:27018,localhost:27019/repset1?replicaSet=myReplSet";
// process.env.MONGO_OPLOG_URL="mongodb://localhost:27017,localhost:27018,localhost:27019/local?replicaSet=myReplSet";

Meteor.publish('restaurants', function() {
  return Restaurants.find();
});

Meteor.publish('tables', function() {
  return Tables.find();
});

Meteor.publish('reservedTables', function(userid) {
  return Tables.find({'reservations.user_id': userid});
});
Meteor.publish('tablesPersons', function(people) {
  var nbpeople = Number(people);
  if (nbpeople % 2) { nbpeople++; }
  var nbpeople_max = String(nbpeople + 2);
  nbpeople = String(nbpeople);
  return Tables.find({'seats': {$gte: nbpeople, $lte: nbpeople_max}});
});

Meteor.publish('tablesRestaurant', function(rest_id) {
  return Tables.find({"restaurant_id" : rest_id});
});

Meteor.publish('tablesPersonsRestaurant', function(people, rest_id) {
    var nbpeople = Number(people);
    if (nbpeople % 2) { nbpeople++; }
    var nbpeople_max = String(nbpeople + 2);
    nbpeople = String(nbpeople);
    return Tables.find({'seats': {$gte: nbpeople, $lte: nbpeople_max}, "restaurant_id" : rest_id});
});

Meteor.publish('locations', function() {
  return Locations.find();
});
Meteor.publish('userinfo', function(userId) {
  return userInfo.find({"user_id" : userId});
});

Meteor.publish('reviews', function() {
  return myReviews.find();
});
Meteor.publish('reviewsRestaurant', function(rest_id) {
  return myReviews.find({"rest_id" : rest_id});
});

Meteor.publish('restAdmins', function(userId) {
  return restaurantAdmins.find({"admin_id" : userId});
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
    var type_pizzeria = param11;
    var type_coffeehouse = param12;

    // "type" : ["pub", "restaurant"]
    var types = {};
    types["$in"] = [];
    if (type_restaurant) { types["$in"].push("restaurant"); }
    if (type_bar) { types["$in"].push("bar"); }
    if (type_bistro) { types["$in"].push("bistro"); }
    if (type_pub) { types["$in"].push("pub"); }
    if (type_pizzeria) { types["$in"].push("pizzeria"); }
    if (type_coffeehouse) { types["$in"].push("coffeehouse"); }

    conditions["type"] = types;

    return Restaurants.find(conditions);
});

Meteor.publish("freeTables", function(people, res_date, time){
  var nbpeople = Number(people);
  var nbpeople_max = String(nbpeople + 2);
  nbpeople = String(nbpeople);
  return Tables.find({'seats': {$gte: nbpeople, $lte: nbpeople_max}, 'reservations.res_date': {$in: [res_date]},'reservations.start_time': {$in: [time]}});
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

	'insertReservation': function(tableid, persons, userid, email, phonenb, date, arrival_hour, leaving_hour) {
		var start = Number(arrival_hour.replace(":", ""));
        var end = Math.floor(leaving_hour/100) + ":" + ('0' + leaving_hour%100).slice(-2);
        var rand_nb = Math.floor((Math.random() * 5000) + 1);
        var reservation = {"res_date": date, "persons": persons, "email" : email, "phonenb" : phonenb, "start" : start, "end" : leaving_hour, "start_time" : arrival_hour, "end_time" : end, "res_number" : rand_nb};
        if (userid !== 'none' && userid !== null) {
          reservation['user_id'] = userid;
        }

        var table = Tables.findOne({_id: tableid});

        var response = "ok";
        myTransactions.insert(
            {
            'table_id': tableid, 'restaurant_id': table.restaurant_id,
            'res_date': date, 'arrival_time': arrival_hour, 'persons': persons,
            'email': email, 'state': "initial", 'lastModified': new Date()
            },
            function(err, insertedId) {
            if (insertedId == "" || insertedId == undefined) {
              return "no";
            }
        });

        var t = myTransactions.findOne(
          {
            'state': "initial", 'table_id': tableid, 'res_date': date,
            'arrival_time': arrival_hour, 'persons': persons
          });
          if (t == "" || t == undefined) {
            return "no";
          }

          myTransactions.update(
              { '_id': t._id, state: "initial" },
              {
                $set: { 'state': "pending" },
                $currentDate: { 'lastModified': true }
              },
              {upsert: false, multi: false},
              function(err, updated) {
              if (updated !== 1) {
                myTransactions.update(
                   { _id: t._id, state: "initial" },
                   {
                     $set: { state: "canceling" },
                     $currentDate: { lastModified: true }
                   }
                );
                cancelTransaction();
                return "no";
              }
          });

        Tables.update(
            { '_id': t.table_id, 'pendingTransactions': { $ne: t._id } },
            { $push: { 'pendingTransactions': t._id, 'reservations': reservation } },
            {upsert: false, multi: false},
            function(err, updated) {
            if (updated !== 1) {
              return "no";
            }
        });

        myTransactions.update(
           { '_id': t._id, state: "pending" },
           {
             $set: { 'state': "applied" },
             $currentDate: { 'lastModified': true }
           },
            function(err, updated) {
            if (updated !== 1) {
              myTransactions.update(
                   { _id: t._id, state: "pending" },
                   {
                     $set: { state: "canceling" },
                     $currentDate: { lastModified: true }
                   }
                );
                cancelTransaction();
              return "no";
            }
        });


        Tables.update(
           { '_id': t.table_id, 'pendingTransactions': t._id },
           { $pull: { 'pendingTransactions': t._id } },
            function(err, updated) {
            if (updated !== 1) {
              return "no";
            }
        });

        myTransactions.update(
           { '_id': t._id, 'state': "applied" },
           {
             $set: { 'state': "done" },
             $currentDate: { 'lastModified': true }
           },
            function(err, updated) {
            if (updated !== 1) {
              myTransactions.update(
                   { _id: t._id, state: "applied" },
                   {
                     $set: { state: "canceling" },
                     $currentDate: { lastModified: true }
                   }
                );
                cancelTransaction();
              return "no";
            }
        });

        console.log("final response: " + response);
        return response;
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

    'removeReservation' : function(table_id, res_date, persons, email, phonenb, start_time, end_time, res_nb) {
        var currentUserId = Meteor.userId();
        if(currentUserId){
            var table = Tables.findOne({_id: table_id});
            Tables.update({ _id: table._id },{ $pull: { 'reservations': { 'res_number' : res_nb, 'res_date': res_date, 'email': email} } });
        }
    },

    'updateHeaderImage' : function(rest_id, imagesURL) {
        var currentUserId = Meteor.userId();
        if(currentUserId){
            Restaurants.update({ '_id': rest_id },{ $set: imagesURL});
        }
    },


  // on the server, we create the sendEmail RPC function
    'sendEmail': function(email, subject_, text_) {
      // send the email!
      Email.send({to:email, from:'acemtp@gmail.com', subject: subject_, text: text_});
      console.log("The email was sent to the address" + email);
    }
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
