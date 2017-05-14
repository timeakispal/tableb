import './restaurant.html';

Tables = new Mongo.Collection('myTables');

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

	Template.restaurant.rendered = function () {
		if (AmplifiedSession.get('Restaurant') == undefined || Session.get('selectedRestaurant') !== undefined) {
			var restId = Session.get('selectedRestaurant');
			AmplifiedSession.set('Restaurant', restId);
		}
	};

	Template.restaurant.helpers({
		RestaurantView: function() {
			var restId = AmplifiedSession.get('Restaurant');
			return Restaurants.find({_id: restId});
		},
		freeTables: function() {
			var restId = AmplifiedSession.get('Restaurant');
			var res_date = Session.get("reservationDate")
			var time = Session.get("reservationTime");
			var leave_time = 2400;

			var d = new Date();
			today = moment(d).format('YYYY-MM-DD');
			if (res_date == today) {
				if (time == undefined || time == "") {
					var d = new Date();
					var hour = d.getHours();
					var min = d.getMinutes();
					if (0 < min && min <= 30) {
						leave_time = hour * 100 + 30;
					} else {
						if (30 < min) {
							hour++;
						}
						leave_time = hour * 100;
					}
					leave_time += 100;
					return allHours(restId, res_date, hour, min, leave_time);

				} else {
					var clock = time.split(":");
					var timeLeave = Session.get("timeOfLeave");

					if (0 < clock[1] && clock[1] <= 30) {
						leave_time = clock[0] * 100 + 30;
					} else {
						if (30 < clock[1]) {
							clock[0]++;
						}
						leave_time = clock[0] * 100;
					}
					leave_time += 100;
					
					if (timeLeave !== undefined && timeLeave !== "") {
						var clock2 = timeLeave.split(":");
						leave_time = Number(clock2[0]) * 100 + Number(clock2[1]);
					}
					
					return allHours(restId, res_date, clock[0], clock[1], leave_time);
				}
			} else {
				if (time == undefined || time == "") {
					return allHours(restId, res_date, 9, 0, leave_time);

				} else {
					var clock = time.split(":");
					var timeLeave = Session.get("timeOfLeave");
					
					if (timeLeave !== undefined && timeLeave !== "") {
						var clock2 = timeLeave.split(":");
						leave_time = Number(clock2[0]) * 100 + Number(clock2[1]);
					}
					
					return allHours(restId, res_date, clock[0], clock[1], leave_time);
				}
			}
		},
	});

	function allHours(restId, res_date, hour, min, leave_time) {
		var list = [];
		if (0 < min && min <= 30) {
			time = hour * 100 + 30;
		} else {
			if (30 < min) {
				hour++;
			}
			time = hour * 100;
		}

		var table = Tables.findOne({restaurant_id: restId});
		if (table == undefined) {
			// no tables that match the description
			return list;
		};

		var reservations = table.reservations;
		reservations.sort(compare);
		var maxtime = time + 100;
		if (time >= 2300) {
			maxtime = 2330;
		}

		var leavehour = 0;
		for (var i = 0; i < reservations.length; i++) {
			if (reservations[i].res_date == res_date) {

				if (maxtime <= reservations[i].start && maxtime >= leavehour) {
					if (leavehour >= time && leavehour <= maxtime) {
						time = leavehour;
					}
					while (time <=  leave_time && leave_time <= reservations[i].start && time <= maxtime) {
						if (time % 100 == 0) {
							list.push(Math.floor(time/100) + ":00");
							time += 30;
						} else {
							list.push(Math.floor(time/100) + ":30");
							time += 70;
						}
					}
				}
			
				leavehour = reservations[i].end;

			} else {
				leavehour = 0;
			}
		
		}

		if (time <= leavehour || leavehour <= maxtime) {
			if (time <= leavehour) {
				time = leavehour;
			}
			
			if (time <= maxtime) {
				while (time <= 2400 && time <= maxtime) {
					if (time % 100 == 0) {
						list.push(Math.floor(time/100) + ":00");
						time += 30;
					} else {
						list.push(Math.floor(time/100) + ":30");
						time += 70;
					}
				}
			}
		}
		
		return list;
	}

	function compare(a, b) {
		if (a.start < b.start)
			return -1;
		if (a.start > b.start)
			return 1;

		return 0;
	}
}