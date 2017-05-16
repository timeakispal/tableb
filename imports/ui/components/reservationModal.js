import './reservationModal.html';

Template.reservationModal.helpers({

		reservedHour: function() {
			var resHour = Session.get('reservationHour');
			return resHour;
		},

		reservedDate: function() {
			var resDate = Session.get('reservationDate');
			if (resDate == undefined || resDate == "") {
				var today = new Date();
				resDate = moment(today).format('MMMM Do YYYY');
			}

			return moment(resDate).format('MMMM Do YYYY');
		},

		reservedRestaurant : function() {
			var restId = Session.get('resRestaurant');
			var restaurant = Restaurants.findOne({_id: restId});
			return restaurant.name + ", " + restaurant.location;
		},

		reservedPersons : function() {
			return Session.get("persons");
		},

		LeaveSet : function() {
			var leave = Session.get("timeOfLeave");
			if (leave == undefined || leave == "") {
				return 0;
			}

			return 1;
		},

		reservedLeave : function() {
			return Session.get("timeOfLeave");
		},

		userName: function() {
			var user = Meteor.user();
			if (user == undefined || user == "") {
				return "";
			}
	 		return user.username;
		},
		email: function() {
			var user = Meteor.user();
			if (user == undefined || user == "") {
				return "";
			}

			return Meteor.user().emails[0].address;
		},
});