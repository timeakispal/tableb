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

    'click .hide-home' : function(event){
    	var x = document.getElementById("navDemo");
	    if (x.className.indexOf("w3-show") != -1) {
	        x.className = x.className.replace(" w3-show", "");
	    }
    },
});

Template.myNav.helpers({
  firstName: function() {
    return Meteor.user().username.toUpperCase();
  },
});