import { IronRouter } from 'meteor/iron:router';

// // Import to load these templates
import '../../ui/layouts/mainTemplate.js';

Router.configure({
	layoutTemplate: 'mainTemplate',
	yieldTemplates: {
		myNav: {to: 'nav'},
		myFooter: {to: 'footer'},
	}
});

Router.route('/', {
	name: 'home',
	template: 'home',
});

Router.route('/user', {
	name: 'user',
	template: 'user'
});

Router.route('/search', {
	name: 'search',
	template: 'search'
});

Router.route('/restaurant', {
	name: 'restaurant',
	template: 'restaurant'
});

Router.route('/userProfile', {
	name: 'userProfile',
	template: 'userProfile'
});
