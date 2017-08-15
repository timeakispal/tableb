import './myReservations.html';

Template.myReservations.onRendered(function() {
	Session.set("showSearchBar", 0);
});

Template.myReservations.helpers({
	Reservations: function() {
		var today = moment();
		var day_before = moment(today).subtract(1, 'day');
		moment(day_before).format('YYYY-MM-DD');
		var email = Meteor.user().emails[0].address
		var tables = Tables.find({'reservations.email': email}).fetch();
		var list = [];
		for (var i = 0; i < tables.length; i++) {
			for (var j = 0; j < tables[i].reservations.length; j++) {
				if (tables[i].reservations[j].email == email) {
					tables[i].reservations[j].restaurant_name = tables[i].restaurant_name;
					tables[i].reservations[j].id = tables[i]._id;
					list.push(tables[i].reservations[j]);
				}
			}
		}
		return list;
	},
});

Template.myReservations.events({
	'click .reservation': function(e){
		var table_id = this.id;//e.currentTarget.id;
		var res_date = this.res_date;
		var persons = this.persons;
		var start_time = this.start_time;
		var end_time = this.end_time;
		var res_nb = this.res_number;
		console.log(this.res_number);

		var email = Meteor.user().emails[0].address;
		var userid = Meteor.userId();
		var userinfo = userInfo.findOne({user_id: userid});
		var phonenb = "";
		if (userinfo !== undefined) {
			phonenb = userinfo.phonenb;
		}

		Meteor.call('removeReservation', table_id, res_date, persons, email, phonenb, start_time, end_time, res_nb);
	},
});
