import './restaurant.html';

Tables = new Mongo.Collection('myTables');

Template.restaurant.helpers({
	RestaurantView: function() {
		var restId = Session.get('selectedRestaurant');
		return Restaurants.find({_id: restId});
	},
	freeTables: function() {
		var restId = Session.get('selectedRestaurant');
		return Tables.findOne({table_id: restId});
		// for (var i = 0; i < table.reservations.length; i++) {
		    // console.log(table);
		// return table;
		// }
	},
});