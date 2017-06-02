import './myRestaurant.html';

if (Meteor.isClient) {
	Template.myRestaurant.rendered = function () {
		var userid = Meteor.userId();
		var restInfo = restaurantAdmins.findOne({admin_id: userid});
		if (restInfo !== undefined) {
			Session.set('theRestaurant', restInfo.rest_id);
		}
	};
	Template.myRestaurant.helpers({
		// RestaurantView: function() {
		// 	var restId = AmplifiedSession.get('myRestaurant');
		// 	var restaurants = Restaurants.find({_id: restId});
		// 	var location = restaurants.location;
		// 	Session.set('myLocation', location);
		// 	return restaurants;
		// },
	});
}