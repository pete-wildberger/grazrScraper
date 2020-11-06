import { App } from './App.class';

(function (): void {
	const grazerConfig = {
		url: 'http://grazr-web.herokuapp.com',
		parent: {
			selector: '.user-card',
			details: {
				name: '.name',
				title: '.title',
				link: 'a'
			}
		},
		children: {
			selector: '.user-content',
			details: {
				email: '.email',
				dob: '.birthday'
			}
		}
	};
	console.log('Scrapper Running');
	new App(grazerConfig);
})();
