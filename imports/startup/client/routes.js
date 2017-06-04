import { IronRouter } from 'meteor/iron:router';

// // Import to load these templates
import '../../ui/layouts/mainTemplate.js';
import '../../ui/layouts/adminTemplate.js';

Router.configure({
	layoutTemplate: 'mainTemplate',
	yieldTemplates: {
		myNav: {to: 'nav'},
		myFooter: {to: 'footer'},
	},
	//the application will wait to load 
	// until we've successfully subscribed to the
	// publications
	waitOn: function () {
		Meteor.subscribe('restaurants');
		Meteor.subscribe('tables');
		Meteor.subscribe('locations');
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
});

Router.route('/search', {
	name: 'search',
	template: 'search',
});

Router.route('/restaurant', {
	name: 'restaurant',
	template: 'restaurant',
	waitOn: function () {
		return Meteor.subscribe('userinfo');
	}
});

Router.route('/myRestaurant', {
	name: 'myRestaurant',
	template: 'myRestaurant',
	layoutTemplate: 'adminTemplate',
	onBeforeAction: function(){
        var currentUser = Meteor.userId();
        // if currentUser benne van a RestaurantAdmins-ban akkor this.next
        if(currentUser){
            this.next();
        } else {
            this.render("user");
        }
    },
    //subscribe restaurantAdmins
	waitOn: function () {
		return Meteor.subscribe('restAdmins');
	}
});

Router.route('/restaurantProfile', {
	name: 'restaurantProfile',
	template: 'restaurantProfile',
	layoutTemplate: 'adminTemplate',
	onBeforeAction: function(){
        var currentUser = Meteor.userId();
        // if currentUser benne van a RestaurantAdmins-ban akkor this.next
        if(currentUser){
            this.next();
        } else {
            this.render("user");
        }
    },
	waitOn: function () {
		return Meteor.subscribe('restAdmins');
	}
});

Router.route('/restaurantReviews', {
	name: 'restaurantReviews',
	template: 'restaurantReviews',
	layoutTemplate: 'adminTemplate',
	onBeforeAction: function(){
        var currentUser = Meteor.userId();
        // if currentUser benne van a RestaurantAdmins-ban akkor this.next
        if(currentUser){
            this.next();
        } else {
            this.render("user");
        }
    },
	waitOn: function () {
		return Meteor.subscribe('reviews');
	}
});

Router.route('/restaurantTables', {
	name: 'restaurantTables',
	template: 'restaurantTables',
	layoutTemplate: 'adminTemplate',
	onBeforeAction: function(){
        var currentUser = Meteor.userId();
        // if currentUser benne van a RestaurantAdmins-ban akkor this.next
        if(currentUser){
            this.next();
        } else {
            this.render("user");
        }
    },
	waitOn: function () {
		return Meteor.subscribe('tables');
	}
});

Router.route('/restaurantReservations', {
	name: 'restaurantReservations',
	template: 'restaurantReservations',
	layoutTemplate: 'adminTemplate',
	onBeforeAction: function(){
        var currentUser = Meteor.userId();
        // if currentUser benne van a RestaurantAdmins-ban akkor this.next
        if(currentUser){
            this.next();
        } else {
            this.render("user");
        }
    },
	waitOn: function () {
		return Meteor.subscribe('tables');
	}
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
    waitOn: function () {
		return Meteor.subscribe('userinfo');
	}
});
