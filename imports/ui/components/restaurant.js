import './restaurant.html';

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

	Template.restaurant.onRendered(function() {
		var self = this;

		if (AmplifiedSession.get('Restaurant') !== Session.get('selectedRestaurant') && Session.get('selectedRestaurant') !== undefined) {
			var restId = Session.get('selectedRestaurant');
			AmplifiedSession.set('Restaurant', restId);
		}

		self.autorun(function() {
			var reviewsList = self.subscribe('reviewsRestaurant', AmplifiedSession.get('Restaurant'));
			var tablesList = self.subscribe('tablesPersonsRestaurant', Session.get("persons"), AmplifiedSession.get('Restaurant'));
			if (reviewsList.ready() && tablesList.ready()) {

				Session.set("showLocationSelect", 0);
				Session.set("showSearchBar", 1);
				Session.set('showResAlert', false);
			}
		});
	});

	Template.restaurant.events({
		'change #when2': function(evt, t) {
			var when = $(evt.target).val();
			Session.set("setDate", when);
			t.find('#arrival_hour2').value = "";
			t.find('#leaving_hour2').value = "";
		},

		'change #arrival_hour2': function(evt, t) {
			var arrival_hour = $(evt.target).val();
			Session.set("setHour", arrival_hour);
			t.find('#leaving_hour2').value = "";
		},

		'submit #search-form2' : function (e, t) {
			e.preventDefault();
			var when = t.find('#when2').value;
			var people = t.find('#people2').value;
			var arrival_hour = t.find('#arrival_hour2').value;
			var leaving_hour = t.find('#leaving_hour2').value;
			Session.set("reservationDate", when);
			Session.set("persons", people);
			Session.set("reservationTime", arrival_hour);
			Session.set("timeOfLeave", leaving_hour);
			Session.set('showResAlert', false);
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
			Session.set('showResAlert', false);
		},

		'click #contact-restaurant': function(e, t) {
		    e.preventDefault();
			var resti = AmplifiedSession.get('Restaurant');
			Session.set("resRestaurant", resti);
		    Modal.show('contactModal');
		},

		'click #star-1': function(e, t) {
		    e.preventDefault();
		    var list = [];
			list.push(1);
			for (var i = 2; i <= 5; i++) {
				list.push(0);
			}
		    Session.set("stars", list);
		    Session.set("stars_nb", 1);
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
		    Session.set("stars_nb", 2);
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
		    Session.set("stars_nb", 3);
		},
		'click #star-4': function(e, t) {
		    e.preventDefault();
		    var list = [];
			for (var i = 1; i <= 4; i++) {
				list.push(1);
			}
			list.push(0);
		    Session.set("stars", list);
		    Session.set("stars_nb", 4);
		},
		'click #star-5': function(e, t) {
		    e.preventDefault();
		    var list = [];
			for (var i = 1; i <= 5; i++) {
				list.push(1);
			}
		    Session.set("stars", list);
		    Session.set("stars_nb", 5);
		},

		'submit #leave-review' : function (e, t)
		{
			e.preventDefault();
			var review = t.find('#review').value;
			var userid = Meteor.userId();
			var restId = AmplifiedSession.get('Restaurant');
			var stars = Session.get('stars');
			var stars_nb = Session.get('stars_nb');
			var today = new Date();
			var date_inserted = moment(today).format('YYYY-MM-DD');
			Meteor.call('insertReview', userid, restId, review, stars, date_inserted, stars_nb);
		},
	});

	Template.restaurant.helpers({

		'resMessage': function() {
           return Session.get('resMessage');
		},
		'showResAlert': function() {
		   return Session.get('showResAlert');
		},
		'alertTypeRes': function() {
		   return Session.get('alertTypeRes');
		},

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

		'selectedDate': function() {
			var date_res = Session.get("reservationDate");
			if (date_res !== undefined && date_res !== "") {
				return date_res;
			}
			return "";
		},

		'selectedClassPeople': function() {
			var restId = this.value;
			var searchPersons = Session.get('persons');
			if (restId == searchPersons) {
				return "selected";
			} else {
				return "";
			}
		},

		'selectedClassArrival': function() {
			var restId = this;
			var searchArrival = Session.get('reservationTime');
			if (restId == searchArrival) {
				return "selected";
			} else {
				return "";
			}
		},

		'selectedClassLeave': function() {
			var restId = this;
			var searchLeave = Session.get('timeOfLeave');
			if (restId == searchLeave) {
				return "selected";
			} else {
				return "";
			}
		},

		'persons': function() {
			var list = [];
			list.push({value:1, string: "1 person"});
			for (var i = 2; i <= 8; i++) {
				list.push({value: i, string: i + " people"});
			}
			list.push({value:"party", string: "Larger group"});
			return list;
		},

		reviewsList: function() {
			return myReviews.find().fetch().reverse();
		},

		'ratings': function() {
			var reviews = myReviews.find().fetch();

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
			var deferred = fullStars(result, list);
			$.when(deferred).done(function() {
				for (var i = ++result; i <= 5; i++) {
					list.push(0);
				}
			});

			return list;
		},

		'nb_reviews': function() {
			var reviews = myReviews.find().fetch();
			return reviews.length;
		},

		avatar: function () {
			var restId = AmplifiedSession.get('Restaurant');
			var restaurant = Restaurants.findOne();
			var image_addr = restaurant.header_image;
			if (image_addr !== undefined) {
				var image_id = image_addr.split("/")[4];
		    	var image = Images.findOne({_id: image_id}); // Where Images is an FS.Collection instance
		    	return image;
			} else {
				return "";
			}

	  	},

		'ratings_total': function() {
			var reviews = myReviews.find().fetch();

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
			var res_date = Session.get("reservationDate");
			var time = Session.get("reservationTime");
			var timeLeave = Session.get("timeOfLeave");

			time = Number(time.replace(":", ""));
			if (timeLeave == undefined || timeLeave == "") {
				timeLeave = time + 200;
			} else {
				timeLeave = Number(timeLeave.replace(":", ""));
			}

			var restaurant = Restaurants.findOne({_id: restId});
			if (timeLeave > Number(restaurant.closing.replace(":", "")) || time < Number(restaurant.opening.replace(":", ""))) {
				return [];
			}

			var d = new Date();
			today = moment(d).format('YYYY-MM-DD');
			if (res_date == today) {
				if (time == undefined || time == "") {
					console.log("time not defined!");
				}

				return allHours(restId, res_date, time, timeLeave);

			} else {
				if (time == undefined || time == "") {
					console.log("time not defined!");
				}

				return allHours(restId, res_date, time, timeLeave);
			}
		},
	});

	function allHours(restId, res_date, arrival_time, leave_time) {
		var list = [];
		var time_bckup = arrival_time;
		var leave_bckup = leave_time;

		var table = Tables.find({'restaurant_id': restId, 'reservations.res_date': {$nin: [res_date]}}, {sort: {seats: 1}}).fetch();
		if (table !== undefined && table.length > 0) {
		// there is min 1 table that has no reservations
			var tableid = table[0]._id;
			console.log("belep ide" + tableid);
			// no tables that have reservation on that date
			while (list.length < 3) {
				if (arrival_time % 100 == 0) {
					var inputhour = Math.floor(arrival_time/100) + ":00";
					list.push({tableid:tableid, hour:inputhour});
					arrival_time += 30;
				} else {
					var inputhour = Math.floor(arrival_time/100) + ":30";
					list.push({tableid:tableid, hour:inputhour});
					arrival_time += 70;
				}
			}

			return list;
		}

		// csak olyan asztal maradt, ami tartalmazza mar ezt a foglalasi datumot
		table = Tables.find({'restaurant_id': restId}, {sort: {seats: 1}}).fetch();
		if (table == undefined || table.length < 1) {
			// no tables that match the description
			return list;
		};

		for (var k = 0; k < table.length; k++) {
			var list_temp = [];
			arrival_time = time_bckup;
			leave_time = leave_bckup;
			var tableid = table[k]._id;
			var reservations = table[k].reservations;
			for (var i = 0; i < reservations.length; i++) {
				if (reservations[i].res_date == res_date) {
					list_temp.push({start: reservations[i].start, end: reservations[i].end});
				}
			}

			list_temp.sort(compare);
			var maxtime = arrival_time + 100;
			if (arrival_time >= 2300 || arrival_time < 900) {
				maxtime = 2400;
			}

			var leavehour = 0;
			for (var i = 0; i < list_temp.length; i++) {
				if (leavehour > maxtime || arrival_time > maxtime) { break; }

				if (leave_time > list_temp[i].start || maxtime > list_temp[i].start) {
					leavehour = list_temp[i].end;
					continue;
				}

				if (leavehour >= arrival_time) {
					arrival_time = leavehour;
				}
				while (arrival_time <= maxtime && leave_time >= (arrival_time + 100)) {
					console.log(arrival_time + " " + leave_time);
					if (arrival_time % 100 == 0) {
						var inputhour = Math.floor(arrival_time/100) + ":00";
						list.push({tableid:tableid, hour:inputhour});
						arrival_time += 30;
					} else {
						var inputhour = Math.floor(arrival_time/100) + ":30";
						list.push({tableid:tableid, hour:inputhour});
						arrival_time += 70;
					}
				}
			}

			if (arrival_time <= leavehour) {
				arrival_time = leavehour;
			}

			while (arrival_time <= 2400 && arrival_time <= maxtime && leave_time >= (arrival_time + 100)) { //leave_time <= leave_bckup
				if (arrival_time % 100 == 0) {
					var inputhour = Math.floor(arrival_time/100) + ":00";
					list.push({tableid:tableid, hour:inputhour});
					arrival_time += 30;
				} else {
					var inputhour = Math.floor(arrival_time/100) + ":30";
					list.push({tableid:tableid, hour:inputhour});
					arrival_time += 70;
				}
			}

			if (list.length >= 3) { break; }
		}

		list.sort(compare_hour);
		var n = {}, unique_list = [];
		for(var i = 0; i < list.length; i++)
		{
			if (!n[list[i].hour])
			{
				n[list[i].hour] = true;
				unique_list.push(list[i]);
			}
		}
		return unique_list.slice(0,3);
	}

	function compare(a, b) {
		if (a.start < b.start)
			return -1;
		if (a.start > b.start)
			return 1;

		return 0;
	}

	function compare_hour(a, b) {
		if (a.hour < b.hour)
			return -1;
		if (a.hour > b.hour)
			return 1;

		return 0;
	}

	function fullStars(result, list) {
		for (var i = 1; i <= result; i++) {
			list.push(1);
		}
	}
}
