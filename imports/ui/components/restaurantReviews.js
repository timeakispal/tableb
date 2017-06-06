import './restaurantReviews.html'


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

	Template.restaurantReviews.rendered = function () {
		if (AmplifiedSession.get('myRestaurant') == undefined || Session.get('theRestaurant') !== undefined) {
			var restId = Session.get('theRestaurant');
			AmplifiedSession.set('myRestaurant', restId);
		}

		Session.set('showAlert', false);

		var container = this.find("#review-chart");

		// Turn Meteor Collection to simple array of objects.
		var restId = AmplifiedSession.get('myRestaurant');
		var reviews = myReviews.find({rest_id: restId}).fetch().reverse();
		var list = [];

		var star_nb = 0;
		var rev_nb = 0;
		for (var i = 0; i < reviews.length; i++) {
			for (var j = 0; j < reviews[i].stars.length; j++) {
				if (reviews[i].stars[j] == 1) {
					star_nb++;
				}
			}

			list.push({x: reviews[i].date_inserted, value: star_nb});
			star_nb = 0;

		}

		var data = anychart.data.set(list);

		// create a chart
	    chart = anychart.column();

	    // create a column series and set the data
	    var series = chart.column(data);

	    // set the titles of the axes
	    var xAxis = chart.xAxis();
	    xAxis.title("Date of review");
	    var yAxis = chart.yAxis();
	    yAxis.title("Stars");

	    var container = this.find("#review-chart");
	    // set the container id
	    chart.container(container);

	    // initiate drawing the chart
	    chart.draw();
	};

	Template.restaurantReviews.helpers({
		'admin': function() {
			var userid = Meteor.userId();
			return restaurantAdmins.findOne({admin_id: userid});
		},
		'restaurantName': function() {
			var restId = AmplifiedSession.get('myRestaurant');
			var restaurants = Restaurants.findOne({_id: restId});
			return restaurants.name;
		},
		'reviewsList': function() {
			var restId = AmplifiedSession.get('myRestaurant');
			return myReviews.find({rest_id: restId}).fetch().reverse();
		},
		'ratings': function() {
			var restId = AmplifiedSession.get('myRestaurant');
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
			var restId = AmplifiedSession.get('myRestaurant');
			var reviews = myReviews.find({rest_id: restId}).fetch();
			return reviews.length;
		},

		'ratings_total': function() {
			var restId = AmplifiedSession.get('Restaurant');
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
			if (star_nb == 0) {
				return "";
			}
			return parseFloat(Math.round(result * 100) / 100).toFixed(2) + " stars";
		},
	});

	Template.restaurantReviews.events({
		'click #review': function(){
			var review_id = this._id;
			var rest_id = this.rest_id;
			Meteor.call('removePlayer', review_id, rest_id);
		},
	});
}