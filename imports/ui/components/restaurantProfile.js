import './restaurantProfile.html';

if (Meteor.isClient) {
	// A version of Session that also store the key/value pair to local storage
	// using Amplify
	var AmplifiedSession = _.extend({}, Session, {
		keys: _.object(_.map(amplify.store(), function (value, key) {
			return [key, JSON.stringify(value)];
		})),
		set: function (key, value) {
			Session.set.apply(this, arguments);
			amplify.store(key, value);
		}
	});

	Template.restaurantProfile.rendered = function () {
		if (AmplifiedSession.get('myRestaurant') == undefined || Session.get('theRestaurant') !== undefined) {
			var restId = Session.get('theRestaurant');
			AmplifiedSession.set('myRestaurant', restId);
		}
	};
	Template.restaurantProfile.helpers({
		RestaurantView: function() {
			var restId = AmplifiedSession.get('myRestaurant');
			var restaurants = Restaurants.find({_id: restId});
			var location = restaurants.location;
			Session.set('myLocation', location);
			return restaurants;
		},
		'selectedClass': function() {
			var locName = this.name;
			var theLocation = Session.get('myLocation');
			if (locName == theLocation) {
				return "selected";
			} else {
				return "";
			}
		},

		'locations': function() {
			return Locations.find({}, {sort: {name: 1}});
		},
	});
}