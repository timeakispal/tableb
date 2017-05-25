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
	checkPassword: function(digest) {
		check(digest, String);

		if (this.userId) {
			var user = Meteor.user();
			var password = {digest: digest, algorithm: 'sha-256'};
			var result = Accounts._checkPassword(user, password);
			return result.error == null;
		} else {
			return false;
		}
	}
});