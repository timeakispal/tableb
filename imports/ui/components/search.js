import './search.html';

if (Meteor.isClient) {
	Template.search.events({
		'click #restaurant-details': function(){
			var restId = this._id;
			var restName = this.name;
	        Session.set('selectedRestaurant', restId);
			Router.go('restaurant', {}, {query: 'name='+restName});
	    }
	});

	Template.search.helpers({
	    'Restaurants': function() {
	    	var location = Session.get("searchLocation");
	    	if (location == "" || undefined == location) {
	    		return Restaurants.find();
	    	} else {
	    		var query = { location: location };
	        	return Restaurants.find(query);
	    	}
	    	
	    },
	    'searchLocation': function() {
	    	var location = Session.get("searchLocation");
	    	if (location !== "" && undefined != location) {
		    	return " for " + location;
		    } else {
		    	return "";
		    }
		},
		'Tables' : function() {
	    	var list = [];
			var restId = this._id;
	    	var time = Session.get("reservationTime");
	  		if (time == undefined) {
	  			return list;
	  		}

	    	time = time.replace(/:/g, "");
	    	console.log(time);

	    	var table = Tables.findOne({table_id: restId});
	    	if (table == undefined) {
	  			return list;
	  		};

			var reservations = table.reservations
			for (var i = 0; i < reservations.length; i++) {
				if (reservations[i].start > time || time > reservations[i].end) {
					console.log(reservations[i].start_time+":"+reservations[i].end_time)
					list.push(reservations[i].start_time+":"+reservations[i].end_time)
				}
			}

			return list;
		},
	});
}