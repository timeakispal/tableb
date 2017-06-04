import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Template } from 'meteor/templating';

import '../components/home.js';
import '../components/restaurantProfile.js';
import '../components/myRestaurant.js';
import '../components/restaurantReviews.js';
import '../components/restaurantTables.js';
import '../components/restaurantReservations.js';

import './adminTemplate.html';

Template.adminTemplate.events({
	'click .logout': function(event){
        event.preventDefault();
        Session.set('theRestaurant', '');
        Meteor.logout();
        Router.go('home');
    },
});