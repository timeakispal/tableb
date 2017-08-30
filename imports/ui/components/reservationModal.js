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
			if (Session.get("timeOfLeave") == undefined || Session.get("timeOfLeave") == "") {
				var leave = Number(Session.get('reservationHour').replace(":", "")) + 200;
				return Math.floor(leave/100) + ":" + ('0' + leave%100).slice(-2);;
			}
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
		phonenb: function() {
			var userid = Meteor.userId();
			var userinfo = userInfo.findOne();
			if (userinfo !== undefined) {
				return userinfo.phonenb;
			}
			return "";
		}
});

Template.reservationModal.events({
	'change #input-email': function(evt, t) {
		var email = $(evt.target).val();
		Session.set("inputEmail", email);
	},
	'change #input-phone': function(evt, t) {
		var phone = $(evt.target).val();
		Session.set("inputPhone", phone);
	},
	'submit #reserve-form' : function (e,t)
	{
		e.preventDefault();

		var userid = Meteor.userId();
		if (userid == undefined || userid == null) {
			userid == 'none';
		}

		var email = Session.get("inputEmail");
		if (email == undefined || email == "") {
			email = $('#input-email').val();
		}
		var phonenb = Session.get("inputPhone");
		if (phonenb == undefined || phonenb == "") {
			phonenb = $('#input-phone').val();
		}
		var tableid = Session.get("reservationTable");
		var date = Session.get("reservationDate");
		var arrival_hour = Session.get("reservationHour");
		var leaving_hour = Session.get("timeOfLeave");
		if (leaving_hour == undefined || leaving_hour == "") {
			leaving_hour = Number(arrival_hour.replace(":", "")) + 200;
		} else {
			leaving_hour = Number(leaving_hour.replace(":", ""));
		}
		var persons = Session.get("persons");
		var restId = Session.get('resRestaurant');
		var restaurant = Restaurants.findOne({_id: restId});
		var res_text = "Your reservation was made for " + persons + " people at " + restaurant.name + "!\n\nThe reservation starts from: " + arrival_hour + " on " + moment(date).format('MMMM Do YYYY') + ".\nYou should arrive 30 minutes earlier!\n\n";
		res_text = res_text + "Your contact details: " + email + ", " + phonenb + "\n\nThank you! Have a wonderful time!";

		resDate = moment(date).format('YYYY-MM-DD');
    	Meteor.call('insertReservation', tableid, persons, userid, email, phonenb, date, arrival_hour, leaving_hour, function(error, result){
		  console.log(result);
		  Session.set('showResAlert', true);
		  if (result == "ok") {
		  	Session.set('resMessage', 'The reservation was successful!');
			Session.set('alertTypeRes', 'alert-success');

		  } else {
			Session.set('resMessage', 'Something went wrong! The table must have been taken :(');
			Session.set('alertTypeRes', 'alert-warning');
		  }

		});
		Meteor.call('sendEmail', email, "Your reservation at " + restaurant.name, res_text);
    	$('#insertReservationModal').modal('hide'); //or  $('#IDModal').modal('toggle');
    	Modal.hide('insertReservationModal');
	},
});
