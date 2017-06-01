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

	'insertReservation': function(tableid, email, phonenb, date, arrival_hour, leaving_hour) {
		var start = Number(arrival_hour.replace(":", ""));
		var end = Number(leaving_hour.replace(":", ""));
		var reservation = {"res_date": date, "email" : email, "phonenb" : phonenb, "start" : start, "end" : end, "start_time" : arrival_hour, "end_time" : leaving_hour};
		var table = Tables.findOne({_id: tableid});
		Tables.update({ '_id': table._id },{ $push: { reservations: reservation }});
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
    }
});