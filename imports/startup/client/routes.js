import { IronRouter } from 'meteor/iron:router';

// // Import to load these templates
import '../../ui/layouts/mainTemplate.js';

Router.configure({
	layoutTemplate: 'mainTemplate',
	yieldTemplates: {
		myNav: {to: 'nav'},
		myFooter: {to: 'footer'},
	},
	// subscribe to our animals publication
	// with a waitOn function in Iron Router
	// ... now our application will wait to load 
	// until we've successfully subscribed to the
	// publication
	waitOn: function () {
		Meteor.subscribe('restaurants');
		Meteor.subscribe('tables');
		Meteor.subscribe('locations');
		// Meteor.subscribe('userinfo');
		Meteor.subscribe('reviews');
	}

});

Router.route('/', {
	name: 'home',
	template: 'home',
	// waitOn: function () {
	// 	return [ Meteor.subscribe('restaurants'), Meteor.subscribe('reviews')];
	// }
});

Router.route('/user', {
	name: 'user',
	template: 'user',
	// waitOn: function () {
	// 	return [ Meteor.subscribe('restaurants'), Meteor.subscribe('tables'), Meteor.subscribe('reviews') ];
	// }
});

Router.route('/search', {
	name: 'search',
	template: 'search',
	// waitOn: function () {
	// 	return [ Meteor.subscribe('restaurants'), Meteor.subscribe('tables'), Meteor.subscribe('reviews') ];
	// }
});

Router.route('/restaurant', {
	name: 'restaurant',
	template: 'restaurant',
	// waitOn: function () {
	// 	return [ Meteor.subscribe('restaurants'), Meteor.subscribe('tables'), Meteor.subscribe('reviews') ];
	// }
});

Router.route('/userProfile', {
	name: 'userProfile',
	template: 'userProfile',
	onBeforeAction: function(){
        var currentUser = Meteor.userId();
        if(currentUser){
            this.next();
        } else {
            this.render("user");
        }
    },
	waitOn: function () {
		return Meteor.subscribe('userinfo');
	}
});

Router.route('/myReservations', {
	name: 'myReservations',
	template: 'myReservations',
	onBeforeAction: function(){
        var currentUser = Meteor.userId();
        if(currentUser){
            this.next();
        } else {
            this.render("user");
        }
    },
	// waitOn: function () {
	// 	return Meteor.subscribe('tables');
	// }
});
