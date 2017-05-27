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
		var reservation = {"res_date": date, "start" : start, "end" : end, "start_time" : arrival_hour, "end_time" : leaving_hour};
		var table = Tables.findOne({_id: tableid});
		Tables.update({ '_id': table._id },{ $push: { reservations: reservation }});
    }
});