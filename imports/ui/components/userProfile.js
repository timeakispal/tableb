import './userProfile.html';


Template.userProfile.rendered = function(){
	Session.set('showAlert', null);
};

Template.userProfile.helpers({
	avatar: function () {
		var image_addr = Meteor.user().profile.image;
		var image_id = image_addr.split("/")[4];
		// console.log(image_id);
    	var image = Images.findOne({_id: image_id}); // Where Images is an FS.Collection instance
    	return image;
  	},


	userName: function() {
		if (Meteor.user() !== undefined) {
			return Meteor.user().username;
		}
		
		return "";
	},
	email: function() {
		if (Meteor.user() !== undefined) {
			return Meteor.user().emails[0].address;
		}
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
	firstName: function() {
		var userid = Meteor.userId();
		var userinfo = userInfo.findOne({user_id: userid});
		if (userinfo !== undefined) {
			return userinfo.firstname;
		}
		return "";
	},
	lastName: function() {
		var userid = Meteor.userId();
		var userinfo = userInfo.findOne({user_id: userid});
		if (userinfo !== undefined) {
			return userinfo.lastname;
		}
		return "";
	},
	phonenb: function() {
		var userid = Meteor.userId();
		var userinfo = userInfo.findOne({user_id: userid});
		if (userinfo !== undefined) {
			return userinfo.phonenb;
		}
		return "";
	}
});

Template.userProfile.events({
	'change #firstname': function(evt, t) {
		var val = $(evt.target).val();
		Session.set("firstName", val);
	},
	'change #lastname': function(evt, t) {
		var val = $(evt.target).val();
		Session.set("lastName", val);
	},
	'change #email': function(evt, t) {
		var val = $(evt.target).val();
		Session.set("email", val);
	},
	'change #phonenb': function(evt, t) {
		var val = $(evt.target).val();
		Session.set("phoneNb", val);
	},
	'change #username': function(evt, t) {
		var val = $(evt.target).val();
		Session.set("userName", val);
	},

	// 'change #avatar-image' : function(evt,t){ 
	//     var file = evt.target.files[0]; //assuming 1 file only
	//     console.log(file);
	//     if (!file) return;

	//     var reader = new FileReader(); //create a reader according to HTML5 File API

	//     // reader.onload = function(evt){          
	// 		var buffer = new Uint8Array(reader.result) // convert to binary
	// 		// Meteor.call('saveFile', buffer);
	// 		Session.set('saveFile', buffer);
	// 		console.log("buffer" + buffer);
	//     // }

	//     // reader.readAsArrayBuffer(file); //read the file as arraybuffer
	// },

	'change .myFileInput': function(event, template) {
		FS.Utility.eachFile(event, function(file) {
			Images.insert(file, function (err, fileObj) {
				if (err){
				// handle error
				} else {
				// handle success depending what you need to do
					var userId = Meteor.userId();
					var imagesURL = {
					  "profile.image": "/cfs/files/images/" + fileObj._id
					};
					Meteor.users.update(userId, {$set: imagesURL});
				}
			});
		});
	},

	'click #save-changes': function() {
		var userid = Meteor.userId();
		var firstname = Session.get("firstName");
		if (firstname == undefined || firstname == "") {
			firstname = $('#firstname').val();
		}
		var lastname = Session.get("lastName");
		if (lastname == undefined || lastname == "") {
			lastname = $('#lastname').val();
		}
		var email = Session.get("email");
		if (email == undefined || email == "") {
			email = $('#email').val();
		}
		var phonenb = Session.get("phoneNb");
		if (phonenb == undefined || phonenb == "") {
			phonenb = $('#phonenb').val();
		}

		var digest = Package.sha.SHA256($('#password').val());
		Session.set('showAlert', true);
		Meteor.call('checkPassword', digest, function(err, result) {
		if (result) {
			Meteor.call('insertUserInfo', userid, firstname, lastname, email, phonenb)
			Session.set('alertMessage', 'The changes were saved!');
			Session.set('alertType', 'alert-success');
		} else {
			Session.set('alertMessage', 'The password is missing or it is incorrect!');
			Session.set('alertType', 'alert-warning');
		}
		});
	}
});