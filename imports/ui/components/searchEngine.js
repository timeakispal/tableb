import './searchEngine.html';

Locations = new Mongo.Collection('myLocations');

if (Meteor.isClient) {
	
	Template.searchEngine.events({
		'submit #search-form' : function (e,t)
		{
			e.preventDefault();
			var location = t.find('#location').value;
			var when = t.find('#when').value;
			var people = t.find('#people').value;
			var hour = t.find('#hour').value;
			Session.set("searchLocation", location);
			Session.set("reservationDate", when);
			Session.set("persons", people);
			Session.set("reservationTime", hour);
			if (location !== "" && undefined != location) {
				Router.go('search', {}, {query: 'location='+location});
			} else {
				Router.go('search');
			}
		},
	});

	Template.searchEngine.helpers({

		'selectedClass': function(){
		    var restId = this.name;
		    var searchLocation = Session.get('searchLocation');
		    if (restId == searchLocation) {
		        return "selected";
		    } else {
		    	return "";
		    }
		},

		'locations': function(){
	        return Locations.find({}, {sort: {name: 1}});
	    },

		'persons': function(){
			var list = [];
			for (var i = 2; i <= 8; i++) {
				list.push(i);
			}
			return list;
		},

		'hours': function(){
			var list = [];
			var d = new Date();
			var now = d.getHours();
			var min = d.getMinutes();
			if (min >= 20 && min < 50) {
				now++;
				for (var i = now; i < 24; i++) {
					list.push(i + ":00");
					list.push(i + ":30");
				}
			} else {
				if (min >= 50) {
					now++;
					list.push(now + ":30");
					now++;
				} else {
					list.push(now + ":30");
					now++;
				}
				for (var i = now; i < 24; i++) {
					list.push(i + ":00");
					list.push(i + ":30");
				}
			}
			
			return list;
		},
	});
}