import './home.html';
// import './searchEngine.html';

// Restaurants = new Mongo.Collection('myRestaurants');

Template.home.rendered = function(){
	Session.set('searchLocation', "");
	Session.set('reservationDate', "");
	Session.set('persons', "");
	Session.set('reservationTime', "");
	Session.set('timeOfLeave', "");
};

if (Meteor.isClient) {
	// Meteor.subscribe('restaurants');

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
	});
}