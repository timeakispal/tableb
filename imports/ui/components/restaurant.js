import './restaurant.html';

// Tables = new Mongo.Collection('myTables');

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

	Template.restaurant.events({
		'change #when': function(evt, t) {
			var when = $(evt.target).val();
			Session.set("setDate", when);
			t.find('#arrival_hour').value = "";
			t.find('#leaving_hour').value = "";
		},
		'change #people': function(evt) {
			var people = $(evt.target).val();
			// Session.set("persons", people);
		},
		'change #arrival_hour': function(evt, t) {
			var arrival_hour = $(evt.target).val();
			Session.set("setHour", arrival_hour);
			t.find('#leaving_hour').value = "";
		},
		'change #leaving_hour': function(evt) {
			var leaving_hour = $(evt.target).val();
		},

		'submit #search-form' : function (e, t)
		{
			e.preventDefault();
			var when = t.find('#when').value;
			var people = t.find('#people').value;
			var arrival_hour = t.find('#arrival_hour').value;
			var leaving_hour = t.find('#leaving_hour').value;
			Session.set("reservationDate", when);
			Session.set("persons", people);
			Session.set("reservationTime", arrival_hour);
			Session.set("timeOfLeave", leaving_hour);
		},
		'click #reserve': function(e, t) {
		    e.preventDefault();
		    
		    var res_hour = this.hour;
		    var tableid = this.tableid;
			Session.set("reservationHour", String(res_hour));
			Session.set("reservationTable", tableid);
			var resti = AmplifiedSession.get('Restaurant');
			Session.set("resRestaurant", resti);
		    Modal.show('reservationModal');
		},
		'click #star-1': function(e, t) {
		    e.preventDefault();
		    var list = [];
			list.push(1);
			for (var i = 2; i <= 5; i++) {
				list.push(0);
			}
		    Session.set("stars", list);
		},
		'click #star-2': function(e, t) {
		    e.preventDefault();
		    var list = [];
			for (var i = 1; i <= 2; i++) {
				list.push(1);
			}
			for (var i = 3; i <= 5; i++) {
				list.push(0);
			}
		    Session.set("stars", list);
		},
		'click #star-3': function(e, t) {
		    e.preventDefault();
		    var list = [];
			for (var i = 1; i <= 3; i++) {
				list.push(1);
			}
			for (var i = 4; i <= 5; i++) {
				list.push(0);
			}
		    Session.set("stars", list);
		},
		'click #star-4': function(e, t) {
		    e.preventDefault();
		    var list = [];
			for (var i = 1; i <= 4; i++) {
				list.push(1);
			}
			list.push(0);
		    Session.set("stars", list);
		},
		'click #star-5': function(e, t) {
		    e.preventDefault();
		    var list = [];
			for (var i = 1; i <= 5; i++) {
				list.push(1);
			}
		    Session.set("stars", list);
		},

		'submit #leave-review' : function (e, t)
		{
			e.preventDefault();
			var review = t.find('#review').value;
			var userid = Meteor.userId();
			var restId = AmplifiedSession.get('Restaurant');
			var stars = Session.get('stars');
			var today = new Date();
			var date_inserted = moment(today).format('YYYY-MM-DD');
			Meteor.call('insertReview', userid, restId, review, stars, date_inserted);
		},
	});

	Template.restaurant.helpers({

		RestaurantView: function() {
			var restId = AmplifiedSession.get('Restaurant');
			return Restaurants.find({_id: restId});
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

		'persons': function() {
			var list = [];
			for (var i = 2; i <= 8; i++) {
				list.push(i);
			}
			return list;
		},

		reviewsList: function() {
			var restId = AmplifiedSession.get('Restaurant');
			return myReviews.find({rest_id: restId}).fetch().reverse();;
		},

		'ratings': function() {
			var restId = AmplifiedSession.get('Restaurant');
			var reviews = myReviews.find({rest_id: restId}).fetch();

			var star_nb = 0;
			var rev_nb = 0;
			for (var i = 0; i < reviews.length; i++) {
				rev_nb++;
				for (var j = 0; j < reviews[i].stars.length; j++) {
					if (reviews[i].stars[j] == 1) {
						star_nb++;
					}
				}
			}

			var result = star_nb/rev_nb;

			result = Math.round(result);
			if (result == 0) {
				return [];
			}
			
			var list = [];
			for (var i = 1; i <= result; i++) {
				console.log(1);
				list.push(1);
			}
			for (var i = ++result; i <= 5; i++) {
				console.log(0);
				list.push(0);
			}

			return list;
		},

		'nb_reviews': function() {
			var restId = AmplifiedSession.get('Restaurant');
			var reviews = myReviews.find({rest_id: restId}).fetch();
			return reviews.length;
		},

		'ratings_total': function() {
			var restId = AmplifiedSession.get('Restaurant');
			var reviews = myReviews.find({rest_id: restId}).fetch();

			var star_nb = 0;
			var rev_nb = 0;
			for (var i = 0; i < reviews.length; i++) {
				rev_nb++;
				for (var j = 0; j < reviews[i].stars.length; j++) {
					if (reviews[i].stars[j] == 1) {
						star_nb++;
					}
				}
			}

			var result = star_nb/rev_nb;
			if (star_nb == 0) {
				return "";
			}
			return parseFloat(Math.round(result * 100) / 100).toFixed(2) + " stars";
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

		freeTables: function() {
			var restId = AmplifiedSession.get('Restaurant');
			var res_date = Session.get("reservationDate")
			var time = Session.get("reservationTime");
			var people = Session.get("persons");
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
					return allHours(restId, res_date, people, hour, min, leave_time);

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
					
					return allHours(restId, res_date, people, clock[0], clock[1], leave_time);
				}
			} else {
				if (time == undefined || time == "") {
					return allHours(restId, res_date, people, 9, 0, leave_time);

				} else {
					var clock = time.split(":");
					var timeLeave = Session.get("timeOfLeave");
					
					if (timeLeave !== undefined && timeLeave !== "") {
						var clock2 = timeLeave.split(":");
						leave_time = Number(clock2[0]) * 100 + Number(clock2[1]);
					}
					
					return allHours(restId, res_date, people, clock[0], clock[1], leave_time);
				}
			}
		},
	});

	function allHours(restId, res_date, people, hour, min, leave_time) {
		var list = [];
		if (0 < min && min <= 30) {
			time = hour * 100 + 30;
		} else {
			if (30 < min) {
				hour++;
			}
			time = hour * 100;
		}
		// kicserelni findall es foreachre
		var nbpeople = Number(people.split(" ")[0]);
		var table = Tables.findOne({restaurant_id: restId, seats: nbpeople});
		if (table == undefined) {
			// no tables that match the description
			return list;
		};

		var tableid = table._id;
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
							// list.push(Math.floor(time/100) + ":00");
							var inputhour = Math.floor(time/100) + ":00";
							list.push({tableid:tableid, hour:inputhour});
							time += 30;
						} else {
							// list.push(Math.floor(time/100) + ":30");
							var inputhour = Math.floor(time/100) + ":30";
							list.push({tableid:tableid, hour:inputhour});
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
						// list.push(Math.floor(time/100) + ":00");
						var inputhour = Math.floor(time/100) + ":00";
						list.push({tableid:tableid, hour:inputhour});
						time += 30;
					} else {
						// list.push(Math.floor(time/100) + ":30");
						var inputhour = Math.floor(time/100) + ":30";
						list.push({tableid:tableid, hour:inputhour});
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