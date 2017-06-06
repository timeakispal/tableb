import './restaurantReservations.html';

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

	Template.restaurantReservations.rendered = function () {
		if (AmplifiedSession.get('myRestaurant') == undefined || Session.get('theRestaurant') !== undefined) {
			var restId = Session.get('theRestaurant');
			AmplifiedSession.set('myRestaurant', restId);
		}

	};

	Template.restaurantReservations.helpers({
		'admin': function() {
			var userid = Meteor.userId();
			return restaurantAdmins.findOne({admin_id: userid});
		},
		'restaurantName': function() {
			var restId = AmplifiedSession.get('myRestaurant');
			var restaurants = Restaurants.findOne({_id: restId});
			return restaurants.name;
		},

		'Reservations': function() {
			var restId = AmplifiedSession.get('myRestaurant');
			var tables = Tables.find({restaurant_id : restId}).fetch();
			return tables;
		},
		
	});

	Template.restaurantReservations.events({
		'click .reservation': function(e){
			var table_id = e.currentTarget.id;
			var res_date = this.res_date;
			var persons = this.persons;
			var email = this.email;
			var phonenb = this.phonenb;
			var start_time = this.start_time;
			var end_time = this.end_time;

			Meteor.call('removeReservation', table_id, res_date, persons, email, phonenb, start_time, end_time);
		},
	});
}