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
				Session.set('reservationDate', resDate);
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

Template.reservationModal.events({
	'submit #reserve-form' : function (e,t)
	{
		e.preventDefault();
		var email = t.$('#input-email').val();
		var phonenb = t.$('#input-phone').val();

		var tableid = Session.get("reservationTable");
		var date = Session.get("reservationDate");
		// var location = Session.get("reservedRestaurant");
		// var people = Session.get("reservedPersons");
		var arrival_hour = Session.get("reservationHour");
		var leaving_hour = Session.get("timeOfLeave");
		if (leaving_hour == undefined || leaving_hour == "") {
			var hour = Number(arrival_hour.split(":")[0]);
			var min = String(arrival_hour.split(":")[1]);
			hour += 3;
			leaving_hour = hour + ":" + min;
		}
		
		resDate = moment(date).format('YYYY-MM-DD');
    	Meteor.call('insertReservation', tableid, email, phonenb, date, arrival_hour, leaving_hour);
	},
});