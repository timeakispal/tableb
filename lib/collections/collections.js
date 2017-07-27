Tables = new Mongo.Collection('myTables');
Locations = new Mongo.Collection('myLocations');
Restaurants = new Mongo.Collection('myRestaurants');
userInfo = new Mongo.Collection('userInfo');
myReviews = new Mongo.Collection('myReviews');
restaurantAdmins = new Mongo.Collection('restaurantAdmins');
myTransactions = new Mongo.Collection('myTransactions');
Markers = new Mongo.Collection('Markers');

var imageStore = new FS.Store.GridFS("images");

Images = new FS.Collection("images", {
 stores: [imageStore]
});

Images.deny({
	insert: function(){
	return false;
	},
	update: function(){
	return false;
	},
	remove: function(){
	return false;
	},
	download: function(){
	return false;
	}
	});

	Images.allow({
	insert: function(){
	return true;
	},
	update: function(){
	return true;
	},
	remove: function(){
	return true;
	},
	download: function(){
	return true;
	}
});
