import './myReservations.html';

Template.myReservations.helpers({
	Reservations: function() {
		var today = moment();
		var day_before = moment(today).subtract(1, 'day');
		moment(day_before).format('YYYY-MM-DD');
		var email = Meteor.user().emails[0].address
		return Tables.find({'reservations.email': email});
	},
});

Template.myReservations.events({
	'click .reservation': function(e){
		var table_id = e.currentTarget.id;
		var res_date = this.res_date;
		var persons = this.persons;
		var start_time = this.start_time;
		var end_time = this.end_time;
		
		var email = Meteor.user().emails[0].address;
		var userid = Meteor.userId();
		var userinfo = userInfo.findOne({user_id: userid});
		var phonenb = "";
		if (userinfo !== undefined) {
			phonenb = userinfo.phonenb;
		}

		Meteor.call('removeReservation', table_id, res_date, persons, email, phonenb, start_time, end_time);
	},
});
