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
		// var table = Tables.findOne({_id: tableid});
		Tables.update({ '_id': tableid },{ $push: { reservations: reservation }});
    },

    'insertUserInfo' : function(userid, firstname, lastname, email, phonenb, avatar) {
    	var user_info = userInfo.findOne({user_id: userid});
    	if (user_info == undefined || user_info == "") {
    		userInfo.insert({
	            user_id: userid,
	            firstname: firstname,
	            lastname: lastname,
	            phonenb: phonenb,
	            image: avatar
	        });
    	} else {
    		userInfo.update({ 'user_id': userid },{ $set: {firstname: firstname, lastname: lastname, phonenb: phonenb, image: avatar}});
    	}
    },

    'insertReview' : function(userid, rest_id, review, stars, date_inserted) {
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

});