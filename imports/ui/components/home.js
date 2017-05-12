import './home.html';
// import './searchEngine.html';

Restaurants = new Mongo.Collection('myRestaurants');

Template.home.rendered = function(){
	Session.set('searchLocation', "");
};

if (Meteor.isClient) {
	
	Template.home.events({
		'click #restaurant-details': function(){
			var restId = this._id;
			var restName = this.name;
	        Session.set('selectedRestaurant', restId);
			Router.go('restaurant', {}, {query: 'name='+restName});
	    }
	});

	Template.home.helpers({

	    'Restaurants': function(){
	        return Restaurants.find({}, {sort: {expensive: -1, name: 1}, limit: 6});
	    },
	});
}