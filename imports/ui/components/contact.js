import './contact.html';

if(Meteor.isClient) {
    Template.contact.onRendered(function() {
    	Session.set("showSearchBar", 0);
    });

    Template.contact.events({
        'submit #contact-form' : function (e,t) {
			e.preventDefault();
            Meteor.call('sendEmail', $('#email').val(), $('#subject').val(), $('#message').val() + "\n\n" + $('#name').val());
        }
    });

    Template.contact.helpers({

    });

}
