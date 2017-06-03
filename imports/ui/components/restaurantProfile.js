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
		Session.set('showAlert', false);
	};
	Template.restaurantProfile.helpers({
		restaurantName: function() {
			var restId = AmplifiedSession.get('myRestaurant');
			var restaurants = Restaurants.findOne({_id: restId});
			return restaurants.name;
		},
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

		alertMessage: function() {
			return Session.get('alertMessage');
		},
		showAlert: function() {
			return Session.get('showAlert');
		},
		alertType: function() {
			return Session.get('alertType');
		},
	});

	Template.restaurantProfile.events({
		'change #email': function(evt, t) {
			var val = $(evt.target).val();
			Session.set("email", val);
		},
		'change #phonenb': function(evt, t) {
			var val = $(evt.target).val();
			Session.set("phoneNb", val);
		},
		'change #location': function(evt) {
			var location = $(evt.target).val();
		},
		'change #address': function(evt, t) {
			var val = $(evt.target).val();
			Session.set("address", val);
		},
		'change #about': function(evt, t) {
			var val = $(evt.target).val();
			Session.set("about", val);
		},

		'click #submit-restaurant': function (e,t) {
			e.preventDefault();
			var userid = Meteor.userId();
			var restInfo = restaurantAdmins.findOne({admin_id: userid});
			var rest_id = restInfo.rest_id;
			var email = Session.get("email");
			if (email == undefined || email == "") {
				email = $('#email').val();
			}
			var phonenb = Session.get("phoneNb");
			if (phonenb == undefined || phonenb == "") {
				phonenb = $('#phonenb').val();
			}
			var location = t.find('#location').value;
			var address = Session.get("address");
			if (address == undefined || address == "") {
				address = $('#address').val();
			}
			var about = Session.get("about");
			if (about == undefined || about == "") {
				about = $('#about').val();
			}

			var digest = Package.sha.SHA256($('#password').val());
			Session.set('showAlert', true);
			Meteor.call('checkPassword', digest, function(err, result) {
			if (result) {
				Meteor.call('updateRestInfo', rest_id, email, phonenb, location, address, about);
				Session.set('alertMessage', 'The changes were saved!');
				Session.set('alertType', 'alert-success');
			} else {
				Session.set('alertMessage', 'The password is missing or it is incorrect!');
				Session.set('alertType', 'alert-warning');
			}
			});
		}
	});
}