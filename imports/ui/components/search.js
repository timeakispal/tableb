import './search.html';

if (Meteor.isClient) {
	var markers = [];

	Meteor.startup(function() {
        GoogleMaps.load({ key: 'AIzaSyD14UXM1wEKOzqGvFMjQfp2eYxL6t2cJEQ'});
    });

    Template.map.onRendered(function() {
        var self = this;
        var lookup = [];
		var markers_ = [];

        GoogleMaps.ready('map', function(map) {
            self.autorun(function() {
                getBox();
                var handle = Meteor.subscribe('places', Session.get('box'));
                
                if (handle.ready()) {
                    var places = Restaurants.find().fetch();
                    var infowindow = null;
                    var i = 0;
                    _.each(places, function(place) {
                        var lat = place.location.coordinates[0];
                        var lng = place.location.coordinates[1];
                        var contentString = '<div id="content">'+
							'<h3>'+ place.name +'</h3>'+
							'<div id="bodyContent">'+
							'<p>Short about text</p>'+
							'<a id="rest-details" class="btn btn-default" name="'+i+'">Reserve >></a>'+
							'</div>'+
							'</div>';
						i++;
                        if (!_.contains(lookup, lat+','+lng)) {
                            var marker = new google.maps.Marker({
                                position: new google.maps.LatLng(lat, lng),
                                map: GoogleMaps.maps.map.instance,
                                title: place.name,
                                id: 1234
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
							markers_.push(place);
                            lookup.push(lat+','+lng);
                        }
                    });

                    markers = markers_;
                }
            });

            google.maps.event.addListener(map.instance, 'dragend', function(e){
                getBox();
            });

            google.maps.event.addListener(map.instance, 'zoom_changed', function(e){
                getBox();
            });
        });
    });


    Template.map.helpers({
        mapOptions: function() {
            // Initialize the map
            if (GoogleMaps.loaded()) {
                return {
                    // Amsterdam city center coordinates
                    // 46.7834818,23.5464724
                    center: new google.maps.LatLng(46.7644904,23.5855855),
                    zoom: 12
                };
            }
        },
        places: function() {
            return Restaurants.find();
        }
    });

	Template.search.events({
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
		    
		    var restId = $(e.currentTarget).attr("restId");
			var res_hour = this.hour;
		    var tableid = this.tableid;
			Session.set("reservationHour", String(res_hour));
			Session.set("reservationTable", tableid);
			Session.set("resRestaurant", restId);
		    Modal.show('reservationModal');
		},
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
		'change #map-view': function(evt, t) {
			var x = evt.target.checked;
			Session.set('Mapview', x);
		},
	});

	Template.search.helpers({
		'MapView': function() {
			return Session.get("Mapview");
		},
		'Restaurants': function() {
			var location_str = Session.get("searchLocation");
			var name_asc = Session.get("Name-asc");
			var name_desc = Session.get("Name-desc");
			var ratings_desc = Session.get("Ratings-desc");
			var expensiveness = Session.get("Expensiveness");

			if (location_str == "" || undefined == location_str) {
				if (name_asc) { return Restaurants.find({}, {sort: {name: 1}});}
				if (name_desc) { return Restaurants.find({}, {sort: {name: -1}});}
				if (ratings_desc) { 
					return Restaurants.find({}, {sort: {stars_total: -1}});
					// return Restaurants.find({}, {sort: {name: -1}});
					// var dist_rest = myReviews.distinct("rest_id");
					// var dist_rest = [];
					// myReviews.find({}, {fields: {rest_id: 1} }).map(function(doc) {
					// 	dist_rest.push(doc.rest_id);
					// });
					// dist_rest = _.uniq(dist_rest);
					
					// var list_reviews = [];
					// dist_rest.map(function(doc) {
					// 	list_reviews.push({id: doc, ratings: 0});
					// });

					// for (var i = 0; i < dist_rest.length; i++) {
					// 	var total = 0;

					// 	myReviews.find({"rest_id": dist_rest[i]}).map(function(doc) {
					// 		for (var j = 0; j < 5; j++) {
					// 			total += doc.stars[j];
					// 		}

					// 		list_reviews.map(function(elem) {
					// 			if (elem.hasOwnProperty('id') && elem.id == dist_rest[i]) {
					// 		        elem.ratings = total;
					// 		    }
					// 		});
					// 	});
					// }

					// console.log(list_reviews);
				}
				if (expensiveness) { return Restaurants.find({}, {sort: {expensive: 1}});}
				return Restaurants.find();
			} else {
				if (name_asc) { return Restaurants.find({location: location_str}, {sort: {name: 1}});}
				if (name_desc) { return Restaurants.find({location: location_str}, {sort: {name: -1}});}
				if (ratings_desc) { return Restaurants.find({}, {sort: {stars_total: -1}});}
				if (expensiveness) { return Restaurants.find({location: location_str}, {sort: {expensive: 1}});}
				return Restaurants.find({location: location_str});
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

		avatar: function () {
			var restId = this._id;
			var restaurant = Restaurants.findOne({_id: restId});
			var image_addr = restaurant.header_image;
			var image_id = image_addr.split("/")[4];
	    	var image = Images.findOne({_id: image_id}); // Where Images is an FS.Collection instance
	    	return image;
	  	},
		
		'Tables' : function() {
			var list = [];
			var restId = this._id;
			var res_date = Session.get("reservationDate");
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
					return allHours(restId, res_date, people, 9, 0, 11);

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
					leave_time += 200;
					
					if (timeLeave !== undefined && timeLeave !== "") {
						var clock2 = timeLeave.split(":");
						leave_time = Number(clock2[0]) * 100 + Number(clock2[1]);
					}
					
					return allHours(restId, res_date, people, clock[0], clock[1], leave_time);
				}
			}
			
		},
	});

	function getBox() {
        var bounds = GoogleMaps.maps.map.instance.getBounds();
        var ne = bounds.getNorthEast();
        var sw = bounds.getSouthWest();
        Session.set('box', [[sw.lat(),sw.lng()], [ne.lat(),ne.lng()]]);
    }

	function allHours(restId, res_date, people, hour, min, leave_time) {
		var list = [];
		var time;

		if (leave_time % 100 == 0) {
			Session.set("leavingHour", Math.floor(leave_time/100) + ":00");
		} else {
			Session.set("leavingHour", Math.floor(leave_time/100) + ":30");
		}

		if (0 < min && min <= 30) {
			time = hour * 100 + 30;
		} else {
			if (30 < min) {
				hour++;
			}
			time = hour * 100;
		}

		var time_bckup = time;
		var nbpeople = Number(people);
		var nbpeople_max = String(nbpeople + 2);
		nbpeople = String(nbpeople);
		var table = Tables.find({'restaurant_id': restId, 'seats': {$gte: nbpeople, $lte: nbpeople_max}, 'reservations.res_date': {$nin: [res_date]}}, {sort: {seats: 1}}).fetch();
		
		if (table !== undefined && table.length > 0) {
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
		}


		table = Tables.find({'restaurant_id': restId, 'seats': {$gte: nbpeople, $lte: nbpeople_max}, 'reservations.res_date': {$in: [res_date]}}, {sort: {seats: 1}}).fetch();
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
}
