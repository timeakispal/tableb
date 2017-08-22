import './contactModal.html';

Template.contactModal.helpers({

		name: function() {
            var restId = Session.get('resRestaurant');
            var restaurant = Restaurants.findOne({_id: restId});
            return restaurant.name;
		},

        type: function() {
            var restId = Session.get('resRestaurant');
            var restaurant = Restaurants.findOne({_id: restId});
            return restaurant.type;
		},
});
