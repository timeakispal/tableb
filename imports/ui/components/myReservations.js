import './myReservations.html';

Template.myReservations.helpers({
	Reservations: function() {
		var today = moment();
		var day_before = moment(today).subtract(1, 'day');
		moment(day_before).format('YYYY-MM-DD');
		return Tables.find({'reservations.email': 'timeakispal@yahoo.com'});
	},
});
