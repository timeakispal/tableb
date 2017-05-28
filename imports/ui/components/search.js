import './search.html';

if (Meteor.isClient) {

	Template.search.events({
		'click #restaurant-details': function(){
			var restId = this._id;
			var restName = this.name;
			Session.set('selectedRestaurant', restId);
			Router.go('restaurant', {}, {query: 'name='+restName});
		},
		'click #reserve': function(e, t) {
		    e.preventDefault();
		    
		    var restId = $(e.currentTarget).attr("restId");
		 	// var res_hour = this;
			// Session.set("reservationHour", String(res_hour));
			var res_hour = this.hour;
		    var tableid = this.tableid;
			Session.set("reservationHour", String(res_hour));
			Session.set("reservationTable", tableid);
			Session.set("resRestaurant", restId);
		    Modal.show('reservationModal');
		},
	});

	Template.search.helpers({
		'Restaurants': function() {
			var location = Session.get("searchLocation");
			if (location == "" || undefined == location) {
				return Restaurants.find();
			} else {
				var query = { location: location };
				return Restaurants.find(query);
			}
			
		},
		'searchLocation': function() {
			var location = Session.get("searchLocation");
			if (location !== "" && undefined != location) {
				return " for " + location;
			} else {
				return "";
			}
		},
		'ratings': function() {
			var restId = this._id;
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
				list.push(1);
			}
			for (var i = ++result; i <= 5; i++) {
				list.push(0);
			}

			return list;
		},

		'nb_reviews': function() {
			var restId = this._id;
			var reviews = myReviews.find({rest_id: restId}).fetch();
			return reviews.length;
		},
		'Tables' : function() {
			var list = [];
			var restId = this._id;
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
		var inputhour = 0;
		for (var i = 0; i < reservations.length; i++) {
			if (reservations[i].res_date == res_date) {
				console.log("date equals");
				if (maxtime <= reservations[i].start && maxtime >= leavehour) {
					if (leavehour >= time && leavehour <= maxtime) {
						time = leavehour;
					}
					while (time <=  leave_time && leave_time <= reservations[i].start && time <= maxtime) {
						if (time % 100 == 0) {
							// list.push(Math.floor(time/100) + ":00");
							inputhour = Math.floor(time/100) + ":00";
							list.push({tableid:tableid, hour:inputhour});
							time += 30;
						} else {
							// list.push(Math.floor(time/100) + ":30");
							inputhour = Math.floor(time/100) + ":30";
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
						inputhour = Math.floor(time/100) + ":00";
						list.push({tableid:tableid, hour:inputhour});
						time += 30;
					} else {
						// list.push(Math.floor(time/100) + ":30");
						inputhour = Math.floor(time/100) + ":30";
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