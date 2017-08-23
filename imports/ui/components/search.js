import './search.html';
// Markers = new Mongo.Collection('markers');

if (Meteor.isClient) {
	var markers = [];
	var marker_pins = {};

	Meteor.startup(function() {
        GoogleMaps.load({ key: 'AIzaSyD14UXM1wEKOzqGvFMjQfp2eYxL6t2cJEQ'});
    });

    Template.map.onRendered(function() {
        var self = this;
        var lookup = [];
		var markers_ = [];

        GoogleMaps.ready('map', function(map) {
            self.autorun(function() {
                var handle = Meteor.subscribe('places', Session.get("Wifi"),Session.get("Food"),Session.get("Terrace"),Session.get("Pets"),Session.get("Card"),Session.get("Parking"),Session.get("Type-restaurant"),Session.get("Type-bar"),Session.get("Type-bistro"),Session.get("Type-pub"),Session.get("Type-pizzeria"),Session.get("Type-coffeehouse"));

                var handle2 = Meteor.subscribe('freeTables', Session.get("persons"), Session.get("reservationDate"), Session.get("reservationTime"));

                if (handle.ready() && handle2.ready()) {
                	var deferred = deletePins();
					$.when(deferred).done(function() {
	                    var places = matchingRestaurants();
	                    var infowindow = null;
	                    var i = 0;
	                    _.each(places, function(place) {
							var id = place._id;
							var tables = freeTables(id);
							if (tables.length > 0) {
		                        var lat = place.map_location.coordinates[0];
		                        var lng = place.map_location.coordinates[1];
		                        var contentString = '<div id="content">'+
									'<h3>'+ place.name +'</h3>'+
									'<div id="bodyContent">'+
									'<p>Short about text</p>'+
									'<a id="rest-details" class="btn btn-default" name="'+i+'">Reserve >></a>'+
									'</div>'+
									'</div>';

		                        var marker = new google.maps.Marker({
		                            position: new google.maps.LatLng(lat, lng),
		                            map: GoogleMaps.maps.map.instance,
		                            title: place.name,
		                            id: i
		                        });
		                        marker.addListener('mouseover', function() {
		                        	if (infowindow) {
								        infowindow.close();
								    }
								    infowindow = new google.maps.InfoWindow({
										content: contentString
									});
								    infowindow.open(map, marker);
								});
								marker_pins[i] = marker;
								markers_.push(place);

		                        i++;
		                    }
	                    });

	                    markers = markers_;
						// console.log(marker_pins);
					});
				}
            });
        });
    });


    Template.map.helpers({
        mapOptions: function() {
            // Initialize the map
            if (GoogleMaps.loaded()) {
                return {
                    center: new google.maps.LatLng(46.76837,23.5887154),
                    zoom: 15
                };
            }
        },
        places: function() {
            return matchingRestaurants();
        }
    });

 //    Template.search.onCreated(function() {
	//   this.subscribe('tablesPersons', Session.get("persons"));
	// });

	Template.search.onRendered(function() {
		// this.subscribe('tablesPersons', Session.get("persons"));
		var self = this;
	    self.autorun(function() {
			var tablesList = self.subscribe('tablesPersons', Session.get("persons"));
			if (tablesList.ready()) {
				Session.set("showLocationSelect", 1);
				Session.set("showSearchBar", 1);
				Session.set('showResAlert', false);

				Session.set("Type-restaurant", 1);
				Session.set("Type-bar", 1);
				Session.set("Type-bistro", 1);
				Session.set("Type-pub", 1);
				Session.set("Type-pizzeria", 1);
				Session.set("Type-coffeehouse", 1);
			}
		});

	});

	Template.search.events({
		'click .demo1' : function(event){
	    	var id = $(event.target).data('id');
			var x = document.getElementById(id);
		    if (x.className.indexOf("w3-show") == -1) {
		        x.className += " w3-show";
		    } else {
		        x.className = x.className.replace(" w3-show", "");
		    }
	    },

		'change #location2': function(evt) {
			var location = $(evt.target).val();
		},
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

		'submit #search-form2' : function (e,t) {
			e.preventDefault();
			var location = t.find('#location2').value;
			var when = t.find('#when2').value;
			var people = t.find('#people2').value;
			var arrival_hour = t.find('#arrival_hour2').value;
			var leaving_hour = t.find('#leaving_hour2').value;
			Session.set("searchLocation", location);
			Session.set("reservationDate", when);
			Session.set("persons", people);
			Session.set("reservationTime", arrival_hour);
			Session.set("timeOfLeave", leaving_hour);
			Session.set('showResAlert', false);
			// this.subscribe('tablesPersons', Session.get("persons"));
		},

		'click #rest-details': function(e, t){
			e.preventDefault();

		    var index = $(e.currentTarget).attr("name");
		    Session.set('selectedRestaurant', markers[index]._id);
			Router.go('restaurant', {}, {query: 'name='+markers[index].name});
		},
		'click #restaurant-details': function(){
			var restId = this._id;
			var restName = this.name;
			Session.set('selectedRestaurant', restId);
			Router.go('restaurant', {}, {query: 'name='+restName});
		},
		'click #reserve': function(e, t) {
		    e.preventDefault();

		    var restId = $(e.currentTarget).attr("restid");
			var res_hour = this.hour;
		    var tableid = this.tableid;
			Session.set("reservationHour", String(res_hour));
			Session.set("reservationTable", tableid);
			Session.set("resRestaurant", restId);
		    Modal.show('reservationModal');
		    Session.set('showResAlert', false);
		},
		//sort-by
		'change #name-asc': function(evt, t) {
			var x = evt.target.checked;
			Session.set('Name-asc', x);
			t.find('#name-desc').checked = false;
			Session.set('Name-desc', false);
			t.find('#ratings-desc').checked = false;
			Session.set('Ratings-desc', false);
			t.find('#expensiveness').checked = false;
			Session.set('Expensiveness', false);

		},
		'change #name-desc': function(evt, t) {
			var x = evt.target.checked;
			Session.set('Name-desc', x);
			t.find('#name-asc').checked = false;
			Session.set('Name-asc', false);
			t.find('#ratings-desc').checked = false;
			Session.set('Ratings-desc', false);
			t.find('#expensiveness').checked = false;
			Session.set('Expensiveness', false);


		},
		'change #ratings-desc': function(evt, t) {
			var x = evt.target.checked;
			Session.set('Ratings-desc', x);
			t.find('#name-desc').checked = false;
			Session.set('Name-desc', false);
			t.find('#name-asc').checked = false;
			Session.set('Name-asc', false);
			t.find('#expensiveness').checked = false;
			Session.set('Expensiveness', false);

		},
		'change #expensiveness': function(evt, t) {
			var x = evt.target.checked;
			Session.set('Expensiveness', x);
			t.find('#name-desc').checked = false;
			Session.set('Name-desc', false);
			t.find('#ratings-desc').checked = false;
			Session.set('Ratings-desc', false);
			t.find('#name-asc').checked = false;
			Session.set('Name-asc', false);

		},
		// types
		'change #restaurant': function(evt, t) {
			var x = evt.target.checked;
			Session.set('Type-restaurant', x);
		},
		'change #bar': function(evt, t) {
			var x = evt.target.checked;
			Session.set('Type-bar', x);
		},
		'change #bistro': function(evt, t) {
			var x = evt.target.checked;
			Session.set('Type-bistro', x);
		},
		'change #pub': function(evt, t) {
			var x = evt.target.checked;
			Session.set('Type-pub', x);
		},
		'change #pizzeria': function(evt, t) {
			var x = evt.target.checked;
			Session.set('Type-pizzeria', x);
		},
		'change #coffeehouse': function(evt, t) {
			var x = evt.target.checked;
			Session.set('Type-coffeehouse', x);
		},

		'change #map-view': function(evt, t) {
			var x = evt.target.checked;
			Session.set('Mapview', x);
		},

		'click .check-all-types': function(e, t) {
			t.find('#restaurant').checked = true;
			Session.set('Type-restaurant', true);
			t.find('#bar').checked = true;
			Session.set('Type-bar', true);
			t.find('#bistro').checked = true;
			Session.set('Type-bistro', true);
			t.find('#pub').checked = true;
			Session.set('Type-pub', true);
			t.find('#pizzeria').checked = true;
			Session.set('Type-pizzeria', true);
			t.find('#coffeehouse').checked = true;
			Session.set('Type-coffeehouse', true);
		},

		'click .uncheck-all-types': function(e, t) {
			t.find('#restaurant').checked = false;
			Session.set('Type-restaurant', false);
			t.find('#bar').checked = false;
			Session.set('Type-bar', false);
			t.find('#bistro').checked = false;
			Session.set('Type-bistro', false);
			t.find('#pub').checked = false;
			Session.set('Type-pub', false);
			t.find('#pizzeria').checked = false;
			Session.set('Type-pizzeria', false);
			t.find('#coffeehouse').checked = false;
			Session.set('Type-coffeehouse', false);
		},

		// facilities
		'click .check-all': function(e, t) {
			t.find('#wifi').checked = true;
			Session.set('Wifi', true);
			t.find('#food').checked = true;
			Session.set('Food', true);
			t.find('#terrace').checked = true;
			Session.set('Terrace', true);
			t.find('#pet-friendly').checked = true;
			Session.set('Pets', true);
			t.find('#creditcard_accepted').checked = true;
			Session.set('Card', true);
			t.find('#parking').checked = true;
			Session.set('Parking', true);
		},

		'click .uncheck-all': function(e, t) {
			t.find('#wifi').checked = false;
			Session.set('Wifi', false);
			t.find('#food').checked = false;
			Session.set('Food', false);
			t.find('#terrace').checked = false;
			Session.set('Terrace', false);
			t.find('#pet-friendly').checked = false;
			Session.set('Pets', false);
			t.find('#creditcard_accepted').checked = false;
			Session.set('Card', false);
			t.find('#parking').checked = false;
			Session.set('Parking', false);
		},

		'change #wifi': function(evt, t) {
			var x = evt.target.checked;
			Session.set('Wifi', x);
		},
		'change #food': function(evt, t) {
			var x = evt.target.checked;
			Session.set('Food', x);
		},
		'change #terrace': function(evt, t) {
			var x = evt.target.checked;
			Session.set('Terrace', x);
		},
		'change #pet-friendly': function(evt, t) {
			var x = evt.target.checked;
			Session.set('Pets', x);
		},
		'change #creditcard_accepted': function(evt, t) {
			var x = evt.target.checked;
			Session.set('Card', x);
		},
		'change #parking': function(evt, t) {
			var x = evt.target.checked;
			Session.set('Parking', x);
		},

	});

	Template.search.helpers({

		'resMessage': function() {
           return Session.get('resMessage');
		},
		'showResAlert': function() {
		   return Session.get('showResAlert');
		},
		'alertTypeRes': function() {
		   return Session.get('alertTypeRes');
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

		'selectedClass': function() {
			var restId = this.name;
			var searchLocation = Session.get('searchLocation');
			if (restId == searchLocation) {
				return "selected";
			} else {
				return "";
			}
		},

		'selectedDate': function() {
			var date_res = Session.get("setDate");

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

		'type': function() {
			var restaurant = this;
			return restaurant.type[0];
		},

		'type_icon': function() {
			var restaurant = this;
			var icon;
			switch(restaurant.type[0]) {
			    case "restaurant":
			        icon = "fa fa-cutlery";
			        break;
			    case "bar":
			        icon = "mdi mdi-martini";
			        break;
				case "pub":
			        icon = "fa fa-beer";
			        break;
				case "bistro":
			        icon = "fa fa-bold";
			        break;
				case "pizzeria":
			        icon = "mdi mdi-pizza";
			        break;
				case "coffeehouse":
					icon = "fa fa-coffee";
					break;
			    default:
			        icon = "";
			}
			return icon;

		},

		'locations': function() {
			return Locations.find({}, {sort: {name: 1}});
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

		'MapView': function() {
			return Session.get("Mapview");
		},

		'totalRestaurants': function() {
			return Session.get("totalRest");
		},

		'Restaurants': function() {

			return matchingRestaurants();

		},
		'searchLocation': function() {
			var location = Session.get("searchLocation");
			if (location !== "" && undefined !== location) {
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
			var deferred = fullStars(result, list);
			$.when(deferred).done(function() {
				for (var i = ++result; i <= 5; i++) {
					list.push(0);
				}
			});


			return list;
		},

		'nb_reviews': function() {
			var restId = this._id;
			var reviews = myReviews.find({rest_id: restId}).fetch();
			return reviews.length;
		},

		avatar: function () {
			var restId = this._id;
			var restaurant = Restaurants.findOne({_id: restId});
			var image_addr = restaurant.header_image;
			if (image_addr !== undefined) {
				var image_id = image_addr.split("/")[4];
		    	var image = Images.findOne({_id: image_id}); // Where Images is an FS.Collection instance
		    	return image;
			} else {
				return "";
			}
	  	},

		'Tables' : function() {
			// var list = [];
			var restId = this._id;
			return freeTables(restId);
		},
	});

    function deletePins() {
    	var max = Object.keys(marker_pins).length;
        for (var j = 0; j < max; j++) {
        	marker_pins[j].setMap(null);
  			google.maps.event.clearInstanceListeners(marker_pins[j]);
  			delete marker_pins[j];
        }
    }

	function matchingRestaurants() {
		var location_str = Session.get("searchLocation");
		var name_asc = Session.get("Name-asc");
		var name_desc = Session.get("Name-desc");
		var ratings_desc = Session.get("Ratings-desc");
		var expensiveness = Session.get("Expensiveness");

		var wifi = Session.get("Wifi");
		var food = Session.get("Food");
		var terrace = Session.get("Terrace");
		var pets = Session.get("Pets");
		var card = Session.get("Card");
		var parking = Session.get("Parking");

		// {food: 1, terrace: 1}
		var conditions = {};
		if (wifi) {conditions["wifi"] = 1;}
		if (food) {conditions["food"] = 1;}
		if (terrace) {conditions["terrace"] = 1;}
		if (pets) {conditions["pet_friendly"] = 1;}
		if (card) {conditions["creditcard_accepted"] = 1;}
		if (parking) {conditions["parking"] = 1;}

		var type_restaurant = Session.get("Type-restaurant");
		var type_bar = Session.get("Type-bar");
		var type_bistro = Session.get("Type-bistro");
		var type_pub = Session.get("Type-pub");
		var type_pizzeria = Session.get("Type-pizzeria");
		var type_coffeehouse = Session.get("Type-coffeehouse");

		// "type" : ["pub", "restaurant"]
		var types = {};
		types["$in"] = [];
		if (type_restaurant) { types["$in"].push("restaurant"); }
		if (type_bar) { types["$in"].push("bar"); }
		if (type_bistro) { types["$in"].push("bistro"); }
		if (type_pub) { types["$in"].push("pub"); }
		if (type_pizzeria) { types["$in"].push("pizzeria"); }
		if (type_coffeehouse) { types["$in"].push("coffeehouse"); }

		conditions["type"] = types;

		// {food: 1, terrace: 1, type: {$in: ["pub"]}}
		if (location_str !== "" && undefined !== location_str) {
			conditions["location"] = location_str;
		}

		if (name_asc) { return Restaurants.find(conditions, {sort: {name: 1}}); }
		if (name_desc) { return Restaurants.find(conditions, {sort: {name: -1}}); }
		if (ratings_desc) { return Restaurants.find(conditions, {sort: {stars_total: -1}}); }
		if (expensiveness) { return Restaurants.find(conditions, {sort: {expensive: 1}}); }

		var restaurants = Restaurants.find(conditions).fetch();
		Session.set("totalRest", restaurants.length);
		return restaurants;
	}

	function freeTables(rest_id) {
		// var list = [];
		var restId = rest_id;
		var res_date = Session.get("reservationDate");
		var time = Session.get("reservationTime");
		// var people = Session.get("persons");
		var leave_time = 2400;

		var d = new Date();
		today = moment(d).format('YYYY-MM-DD');
		if (res_date == today) {
			if (time == undefined || time == "") {
			// 	var d = new Date();
			// 	var hour = d.getHours();
			// 	var min = d.getMinutes();
			// 	if (0 < min && min <= 30) {
			// 		leave_time = hour * 100 + 30;
			// 	} else {
			// 		if (30 < min) {
			// 			hour++;
			// 		}
			// 		leave_time = hour * 100;
			// 	}
			// 	leave_time += 200;
				console.log("time not defined!");
			// 	return allHours(restId, res_date, hour, min, leave_time);
			//
			}
			// else {
				var clock = time.split(":");
				var timeLeave = Session.get("timeOfLeave");

				// if (0 < clock[1] && clock[1] <= 30) {
				// 	leave_time = clock[0] * 100 + 30;
				// } else {
				// 	if (30 < clock[1]) {
				// 		clock[0]++;
				// 	}
				// 	leave_time = clock[0] * 100;
				// }
				// leave_time += 100;

				leave_time = Number(clock[0]) * 100 + 200 + Number(clock[1]);

				if (timeLeave !== undefined && timeLeave !== "") {
					var clock2 = timeLeave.split(":");
					leave_time = Number(clock2[0]) * 100 + Number(clock2[1]);
				}

				console.log("time: " + clock + " leave_time: " + leave_time);
				return allHours(restId, res_date, clock[0], clock[1], leave_time);
			// }
		} else {
			if (time == undefined || time == "") {
				// return allHours(restId, res_date, 9, 0, 11);
				console.log("time not defined!");
			}
			// else {
				var clock = time.split(":");
				var timeLeave = Session.get("timeOfLeave");

				// if (0 < clock[1] && clock[1] <= 30) {
				// 	leave_time = clock[0] * 100 + 30;
				// } else {
				// 	if (30 < clock[1]) {
				// 		clock[0]++;
				// 	}
				// 	leave_time = clock[0] * 100;
				// }
				// leave_time += 200;

				leave_time = Number(clock[0]) * 100 + 200 + Number(clock[1]);

				if (timeLeave !== undefined && timeLeave !== "") {
					// var clock2 = timeLeave.split(":");
					// leave_time = Number(clock2[0]) * 100 + Number(clock2[1]);
					console.log("time: " + Number(time.replace(":", "")) + " leave_time: " + Number(timeLeave.replace(":", "")));
					return allHours(restId, res_date, Number(time.replace(":", "")), Number(timeLeave.replace(":", "")));
				}

				console.log("time: " + Number(time.replace(":", "")) + " leave_time: " + (Number(time.replace(":", "")) + 200));

				return allHours(restId, res_date, Number(time.replace(":", "")), Number(time.replace(":", "")) + 200);
			// }
		}
	}

	function allHours(restId, res_date, hour, min, leave_time) {
		var list = [];
		var time;

		if (leave_time % 100 == 0) {
			Session.set("leavingHour", Math.floor(leave_time/100) + ":00");
		} else {
			Session.set("leavingHour", Math.floor(leave_time/100) + ":30");
		}

		// if (0 < min && min <= 30) {
		// 	time = hour * 100 + 30;
		// } else {
		// 	if (30 < min) {
		// 		hour++;
		// 	}
		// 	time = hour * 100;
		// }

		var time_bckup = time;
		// var nbpeople = Number(people);
		// var nbpeople_max = String(nbpeople + 2);
		// nbpeople = String(nbpeople);
		var table = Tables.find({'restaurant_id': restId, 'reservations.res_date': {$nin: [res_date]}}, {sort: {seats: 1}}).fetch();
		// var table = Restaurants.findOne({'_id': restId, 'tables.seats': {$gte: nbpeople, $lte: nbpeople_max}, 'tables.reservations': { $eq: [] }});
		// console.log(table.tables);
		if (table !== undefined && table.length > 0) {
		// there is min 1 table that has no reservations
			var tableid = table[0]._id;
			// no tables that have reservation on that date
			while (list.length < 3) {
				if (time % 100 == 0) {
					var inputhour = Math.floor(time/100) + ":00";
					list.push({tableid:tableid, hour:inputhour});
					time += 30;
				} else {
					var inputhour = Math.floor(time/100) + ":30";
					list.push({tableid:tableid, hour:inputhour});
					time += 70;
				}
			}

			return list;
		// console.log(table.tables);
		}

		table = Tables.find({'restaurant_id': restId, 'reservations.res_date': {$in: [res_date]}}, {sort: {seats: 1}}).fetch();
		if (table == undefined || table.length < 1) {
			// no tables that match the description
			return list;
		};

		for (var k = 0; k < table.length; k++) {
			var list_temp = [];
			time = time_bckup;
			var tableid = table[k]._id;
			var reservations = table[k].reservations;
			for (var i = 0; i < reservations.length; i++) {
				if (reservations[i].res_date == res_date) {
					list_temp.push({start: reservations[i].start, end: reservations[i].end});
				}
			}

			list_temp.sort(compare);
			var maxtime = time + 100;
			if (time >= 2300) {
				maxtime = 2330;
			}

			var leavehour = 0;
			for (var i = 0; i < list_temp.length; i++) {
				if (maxtime <= list_temp[i].start && maxtime >= leavehour) {
					if (leavehour >= time && leavehour <= maxtime) {
						time = leavehour;
					}
					while (time <=  leave_time && leave_time <= list_temp[i].start && time <= maxtime) {
						if (time % 100 == 0) {
							var inputhour = Math.floor(time/100) + ":00";
							list.push({tableid:tableid, hour:inputhour});
							time += 30;
						} else {
							var inputhour = Math.floor(time/100) + ":30";
							list.push({tableid:tableid, hour:inputhour});
							time += 70;
						}
					}
				}

				leavehour = list_temp[i].end;

			}

			if (time <= leavehour || leavehour <= maxtime) {
				if (time <= leavehour) {
					time = leavehour;
				}

				if (time <= maxtime) {
					while (time <= 2400 && time <= maxtime) {
						if (time % 100 == 0) {
							var inputhour = Math.floor(time/100) + ":00";
							list.push({tableid:tableid, hour:inputhour});
							time += 30;
						} else {
							var inputhour = Math.floor(time/100) + ":30";
							list.push({tableid:tableid, hour:inputhour});
							time += 70;
						}
					}
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
