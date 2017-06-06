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
		'admin': function() {
			var userid = Meteor.userId();
			return restaurantAdmins.findOne({admin_id: userid});
		},

		'nb_reviews': function() {
			var restId = Session.get('theRestaurant');
			var reviews = myReviews.find({rest_id: restId}).fetch();
			return reviews.length;
		},

		'nb_tables': function() {
			var restId = Session.get('theRestaurant');
			var tables = Tables.find({restaurant_id: restId}).fetch();
			return tables.length;
		},

		'nb_res': function() {
			var restId = Session.get('theRestaurant');
			var tables = Tables.find({restaurant_id : restId}).fetch();

			var nb = 0;
			
			for (var i = 0; i < tables.length; i++) {
				nb += tables[i].reservations.length;
			}

			return nb;
		},
	});
}