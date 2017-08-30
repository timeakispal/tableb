import './user.html';

Template.user.onRendered(function() {
	Session.set("showSearchBar", 0);
});