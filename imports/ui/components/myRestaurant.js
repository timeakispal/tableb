import './myRestaurant.html';

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

	Template.myRestaurant.rendered = function () {
		var userid = Meteor.userId();
		var restInfo = restaurantAdmins.findOne({admin_id: userid});
		if (restInfo !== undefined) {
			Session.set('theRestaurant', restInfo.rest_id);
		}

		var self = this;
		
		if (AmplifiedSession.get('myRestaurant') !== Session.get('theRestaurant') && Session.get('theRestaurant') !== undefined) {
			var restId = Session.get('theRestaurant');
			AmplifiedSession.set('myRestaurant', restId);
		}

		self.autorun(function() {
			var reviewsList = self.subscribe('reviewsRestaurant', AmplifiedSession.get('myRestaurant'));
			var tablesList = self.subscribe('tablesRestaurant', AmplifiedSession.get('myRestaurant'));
		});

	};
	Template.myRestaurant.helpers({
		'admin': function() {
			var userid = Meteor.userId();
			return restaurantAdmins.findOne({admin_id: userid});
		},

		'nb_reviews': function() {
			var restId = Session.get('theRestaurant');
			var reviews = myReviews.find().fetch();
			return reviews.length;
		},

		'nb_tables': function() {
			var restId = Session.get('theRestaurant');
			var tables = Tables.find().fetch();
			return tables.length;
		},

		'nb_res': function() {
			var restId = Session.get('theRestaurant');
			var tables = Tables.find().fetch();

			var nb = 0;
			
			for (var i = 0; i < tables.length; i++) {
				nb += tables[i].reservations.length;
			}

			return nb;
		},
	});
}