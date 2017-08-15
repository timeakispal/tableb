import './restaurantTables.html';


if (Meteor.isClient) {
	// A version of Session that also store the key/value pair to local storage
	// using Amplify
	var AmplifiedSession = _.extend({}, Session, {
		keys: _.object(_.map(amplify.store(), function (value, key) {
			return [key, JSON.stringify(value)];
		})),
		set: function (key, value) {
			Session.set.apply(this, arguments);
			amplify.store(key, value);
		}
	});

	Template.restaurantTables.rendered = function () {
		var self = this;
		
		if (AmplifiedSession.get('myRestaurant') !== Session.get('theRestaurant') && Session.get('theRestaurant') !== undefined) {
			var restId = Session.get('theRestaurant');
			AmplifiedSession.set('myRestaurant', restId);
		}

		self.autorun(function() {
			var tablesList = self.subscribe('tablesRestaurant', AmplifiedSession.get('myRestaurant'));
		});
	};

	Template.restaurantTables.helpers({
		'admin': function() {
			var userid = Meteor.userId();
			return restaurantAdmins.findOne({admin_id: userid});
		},
		'restaurantName': function() {
			var restId = AmplifiedSession.get('myRestaurant');
			var restaurants = Restaurants.findOne({_id: restId});
			return restaurants.name;
		},
		'tables': function() {
			var restId = AmplifiedSession.get('myRestaurant');
			return Tables.find().fetch();
		},
		'persons': function() {
			var list = [];
			for (var i = 2; i <= 8; i++) {
				list.push(i);
			}
			return list;
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
		showTable: function() {
			return Session.get('showTable');
		},
		tablenumber: function() {
			return Session.get('tableNumber');
		},
		tableseats: function() {
			return Session.get('tableSeats');
		}
 	});

	Template.restaurantTables.events({

		'click #submit-table': function (e,t) {
			e.preventDefault();
			var rest_id = AmplifiedSession.get('myRestaurant');
			var restaurants = Restaurants.findOne({_id: rest_id});
			var rest_name = restaurants.name;
			var people = t.find('#people').value;
			people = people.replace(" person", "");

			var tables = Tables.find().fetch();
			var max = 0;
			for (var i = 0; i < tables.length; i++) {
				if (tables[i].number > max) {
					max = tables[i].number;
				}
			}

			var number = max + 1;

			Session.set('showAlert', true);
			Meteor.call('insertTable', rest_id, rest_name, number, people);
			Session.set('alertMessage', 'The changes were saved!');
			Session.set('alertType', 'alert-success');
		},

		'click #close-edit': function(e, t){
			Session.set('showTable', false);
		},

		'click #table-remove': function(){
			var table_id = this._id;
			Meteor.call('removeTable', table_id);
		},

		'click #table-edit': function(){
			var table_id = this._id;
			Session.set('showTable', true);
			Session.set('tableId', table_id);
			var table = Tables.findOne({_id: table_id});
			console.log(table.seats);
			Session.set('tableNumber', table.number);
			Session.set('tableSeats', table.seats);

		},

		'click #update-table': function(e, t){
			e.preventDefault();
			var table_id = Session.get('tableId');
			var seats = t.find('#seats').value;
			Meteor.call('updateTable', table_id, seats);
			Session.set('showTable', false);
			Session.set('tableId', '');
			Session.set('tableNumber', '');
			Session.set('tableSeats', '');
		},
	});
}