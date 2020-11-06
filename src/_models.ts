export interface ScraperConfig {
	url: string;
	parent: {
		selector: string;
		details: { [key: string]: string; link: string };
	};
	children: {
		selector: string;
		details: { [key: string]: string };
	};
}
