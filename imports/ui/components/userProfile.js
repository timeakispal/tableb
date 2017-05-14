import './userProfile.html';


Template.userProfile.rendered = function(){
	Session.set('showAlert', null);
};

Template.userProfile.helpers({
	userName: function() {
		 return Meteor.user().username;
	},
	email: function() {
		return Meteor.user().emails[0].address;
	},
	alertMessage: function() {
		return Session.get('alertMessage');
	},
	showAlert: function() {
		return Session.get('showAlert');
	},
	alertType: function() {
		return Session.get('alertType');
	},
});

Template.userProfile.events({
	'click #save-changes': function() {
		var digest = Package.sha.SHA256($('#password').val());
		Session.set('showAlert', true);
		Meteor.call('checkPassword', digest, function(err, result) {
		if (result) {
			Session.set('alertMessage', 'The changes were saved!');
			Session.set('alertType', 'alert-success');
		} else {
			Session.set('alertMessage', 'The password is incorrect!');
			Session.set('alertType', 'alert-warning');
		}
		});
	}
});