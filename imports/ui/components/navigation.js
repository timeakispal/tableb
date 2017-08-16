import './navigation.html';

Template.myNav.events({
	'click .logout': function(event){
        event.preventDefault();
        Meteor.logout();
        Router.go('home');
    },

    'click .hide-elements' : function(event){
    	var x = document.getElementById("navDemo");
	    if (x.className.indexOf("w3-show") == -1) {
	        x.className += " w3-show";
	    } else {
	        x.className = x.className.replace(" w3-show", "");
	    }
    },

	'change #when': function(evt, t) {
		var when = $(evt.target).val();
		Session.set("setDate", when);
		t.find('#arrival_hour').value = "";
		t.find('#leaving_hour').value = "";
	},

	'change #arrival_hour': function(evt, t) {
		var arrival_hour = $(evt.target).val();
		Session.set("setHour", arrival_hour);
		t.find('#leaving_hour').value = "";
	},

	'submit #search-form' : function (e,t)
	{
		e.preventDefault();
		var location = "";
		if (t.find('#location') !== null) {
			location = t.find('#location').value;
		}
		var when = t.find('#when').value;
		var people = t.find('#people').value;
		var arrival_hour = t.find('#arrival_hour').value;
		var leaving_hour = t.find('#leaving_hour').value;
		Session.set("searchLocation", location);
		Session.set("reservationDate", when);
		Session.set("persons", people);
		Session.set("reservationTime", arrival_hour);
		Session.set("timeOfLeave", leaving_hour);
	},
});

Template.myNav.helpers({

	'showSearchBar': function() {
		return Session.get("showSearchBar");
	},

	'showLocation': function() {
		return Session.get("showLocationSelect");
	},

	'firstName': function() {
	  var usernm = Meteor.user().username;
	  return usernm[0].toUpperCase() + usernm.slice(1);
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
});
