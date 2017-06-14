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
			var tables = Tables.find({restaurant_id : restId}, {sort: {number: 1}}).fetch();
			return tables;
		},

		'currentDate': function() {
			var today = new Date();
			return moment(today).format('YYYY-MM-DD');
		},

		'maximumDate': function() {
			var today = moment();
			var maximumDate = moment(today).add(14, 'day');
			return moment(maximumDate).format('YYYY-MM-DD');
		},

		'arrival_hours': function() {
			var list = [];
			var hour = 8;
			var min = 30;

			if (Session.get("setDate") == undefined) {
				return list;
			}

			var d = new Date();
			today = moment(d).format('YYYY-MM-DD');
			if (Session.get("setDate") == today) {
				hour = d.getHours();
				min = d.getMinutes();
			}
			
			if (15 <= min && min <= 45) {
				hour++;
				for (var i = hour; i < 24; i++) {
					list.push(i + ":00");
					list.push(i + ":30");
				}
			} else {
				if (min >= 45) {
					hour++;
					list.push(hour + ":30");
					hour++;
				} else {
					list.push(hour + ":30");
					hour++;
				}
				for (var i = hour; i < 24; i++) {
					list.push(i + ":00");
					list.push(i + ":30");
				}
			}
			
			return list;
		},

		'leaving_hours': function() {
			var list = [];

			if (Session.get("setHour") == undefined) {
				return list;
			}

			var time = Session.get("setHour");
			var clock = time.split(":");
			var hour = Number(clock[0]) + 1;
			var min = clock[1];

			if (hour == 24) {
				list.push("00:00");
				return list;
			}

			list.push(hour + ":" + min);
			
			if (15 <= min && min <= 45) {
				hour++;
				for (var i = hour; i < 24; i++) {
					list.push(i + ":00");
					list.push(i + ":30");
				}
			} else {
				if (min >= 45) {
					hour++;
					list.push(hour + ":30");
					hour++;
				} else {
					list.push(hour + ":30");
					hour++;
				}
				for (var i = hour; i < 24; i++) {
					list.push(i + ":00");
					list.push(i + ":30");
				}
			}
			
			return list;
		},

		'alertMessageRes': function() {
			return Session.get('alertMessageRes');
		},

		'alertTypeRes': function() {
			return Session.get('alertTypeRes');
		},
		
	});

	Template.restaurantReservations.events({
		'click .remove-reservation': function(e) {
			var table_id = e.currentTarget.id;
			var res_date = this.res_date;
			var persons = this.persons;
			var email = this.email;
			var phonenb = this.phonenb;
			var start_time = this.start_time;
			var end_time = this.end_time;

			Meteor.call('removeReservation', table_id, res_date, persons, email, phonenb, start_time, end_time);
		},

		'submit #submit-new-reservation': function(e, t) {
			e.preventDefault();
			var table_id = this._id;
			var persons = this.seats;
			var number = this.number;
			var when = Session.get('setDate');
			var arrival_hour = Session.get('setHour');
			var leaving_hour = Session.get('leaveHour');

			var clock = arrival_hour.split(":");
			var leave_time;

			if (leaving_hour !== undefined && leaving_hour !== "") {
				var clock2 = leaving_hour.split(":");
				leave_time = Number(clock2[0]) * 100 + Number(clock2[1]);

			} else {
				if (0 < clock[1] && clock[1] <= 30) {
					leave_time = clock[0] * 100 + 30;
					leave_time += 200;
					if (leave_time > 2400) {
						leave_time = 2400;
					}
					leaving_hour = Math.floor(leave_time/100) + ":30"
				} else {
					if (30 < clock[1]) {
						clock[0]++;
					}
					leave_time = clock[0] * 100;
					leave_time += 200;
					if (leave_time > 2400) {
						leave_time = 2400;
					}
					leaving_hour = Math.floor(leave_time/100) + ":00"
				}
			}

			var alert = '.' + table_id;
			t.$(alert).show();
			var result = checkHour(table_id, when, persons, clock[0], clock[1], leave_time);
			if (result == 1) {
				var restId = AmplifiedSession.get('myRestaurant');
				var restaurant = Restaurants.findOne({_id: restId});

				var email = restaurant.email;
				var phonenb = restaurant.phone_nb;
				Meteor.call('insertReservation', table_id, persons, email, phonenb, when, arrival_hour, leaving_hour);
				Session.set('alertMessageRes', 'The changes were saved!');
				Session.set('alertTypeRes', 'alert-success');
			} 
			else {
				Session.set('alertMessageRes', 'Not possible!');
				Session.set('alertTypeRes', 'alert-warning');
			}

		},

		'submit #free-table-form': function(e, t) {
			e.preventDefault();
			var table_id = this._id;
			var persons = this.seats;
			var number = this.number;
			var when = Session.get('setDate');
			var arrival_hour = Session.get('setHour');
			var leaving_hour = Session.get('leaveHour');

			var clock = arrival_hour.split(":");
			var leave_time;

			if (leaving_hour !== undefined && leaving_hour !== "") {
				var clock2 = leaving_hour.split(":");
				leave_time = Number(clock2[0]) * 100 + Number(clock2[1]);

			} else {
				if (0 < clock[1] && clock[1] <= 30) {
					leave_time = clock[0] * 100 + 30;
					leave_time += 200;
					if (leave_time > 2400) {
						leave_time = 2400;
					}
					leaving_hour = Math.floor(leave_time/100) + ":30"
				} else {
					if (30 < clock[1]) {
						clock[0]++;
					}
					leave_time = clock[0] * 100;
					leave_time += 200;
					if (leave_time > 2400) {
						leave_time = 2400;
					}
					leaving_hour = Math.floor(leave_time/100) + ":00"
				}
			}

			var restId = AmplifiedSession.get('myRestaurant');
			var restaurant = Restaurants.findOne({_id: restId});

			var email = restaurant.email;
			var phonenb = restaurant.phone_nb;
			Meteor.call('insertReservation', table_id, persons, email, phonenb, when, arrival_hour, leaving_hour);

		},

		'change #when': function(evt, t) {
			var when = $(evt.target).val();
			Session.set("setDate", when);
			t.find('#arrival_hour').value = "";
			Session.set("setHour", "");
			t.find('#leaving_hour').value = "";
			Session.set("leaveHour", "");
			t.$('.alert').hide();
		},
		'change #arrival_hour': function(evt, t) {
			var arrival_hour = $(evt.target).val();
			Session.set("setHour", arrival_hour);
			t.find('#leaving_hour').value = "";
			Session.set("leaveHour", "");
		},
		'change #leaving_hour': function(evt) {
			var leaving_hour = $(evt.target).val();
			Session.set("leaveHour", leaving_hour);
		},
	});
}

function checkHour(table_id, res_date, people, hour, min, leave_time) {
	var time;
	var list_temp = [];
	var list = [];

	time = hour * 100 + Number(min);

	table = Tables.findOne({'_id': table_id});

	var reservations = table.reservations;
	for (var i = 0; i < reservations.length; i++) {
		if (reservations[i].res_date == res_date) {
			list_temp.push({start: reservations[i].start, end: reservations[i].end});
		}
	}

	list_temp.sort(compare);
	var maxtime = time;

	var leavehour = 0;
	for (var i = 0; i < list_temp.length; i++) {
		if (time <= list_temp[i].start && time >= leavehour) {
			if (time <=  leave_time && leave_time <= list_temp[i].start && time <= maxtime) {
				return 1;
			}
		}
	
		leavehour = list_temp[i].end;
	
	}

	if (time <= leavehour || leavehour <= maxtime) {
		if (time <= leavehour) {
			time = leavehour;
		}
		
		if (time <= 2400 && time <= maxtime) {
			return 1;
		}
	}

	return 0;
}

function compare(a, b) {
	if (a.start < b.start)
		return -1;
	if (a.start > b.start)
		return 1;

	return 0;
}