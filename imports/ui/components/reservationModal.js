import './reservationModal.html';


Template.reservationModal.helpers({

		reservedHour: function() {
			var resHour = Session.get('reservationHour');
			return resHour;
		},

		reservedDate: function() {
			
			if (Session.get('reservationDate') == undefined || Session.get('reservationDate') == "") {
				var today = new Date();
				resDate = moment(today).format('YYYY-MM-DD');
			} else {
				var resDate = Session.get('reservationDate');
			}

			return moment(resDate).format('MMMM Do YYYY');
		},

		reservedRestaurant : function() {
			if (Session.get('resRestaurant') == undefined || Session.get('resRestaurant') == '') {
				return "";
			} else {
				var restId = Session.get('resRestaurant');
				var restaurant = Restaurants.findOne({_id: restId});
				return restaurant.name + ", " + restaurant.location;
			}
			
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