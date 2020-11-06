import axios from 'axios';
import * as cheerio from 'cheerio';
import { promisify } from 'util';
import { writeFile as wf } from 'fs';
const writeFile = promisify(wf);

import type { ScraperConfig } from './_models';

export class App {
	private config: ScraperConfig;

	constructor(config: ScraperConfig) {
		console.log('App started');
		this.config = config;
		this.run(); // run app
	}
	// main app method
	run = async (): Promise<void> => {
		console.log('App.run() called');
		try {
			const { url, parent } = this.config;
			const { data } = await axios.get(url);
			const $ = cheerio.load(data);
			const elements = this.selectElements($, parent.selector);
			const employees = this.parseElements($, elements, parent.details);
			const detail_html = await this.resolveAllDetailHTTPRequests(employees); // html detail array for each employee

			await this.writeJSONFile('results.json', detail_html);

			console.log(detail_html); // print result
		} catch (e) {
			console.log(e);
		}
	};

	async resolveAllDetailHTTPRequests(employees: any[]): Promise<any[]> {
		const promises = employees.map(async (employ) => {
			const { children } = this.config;
			const { data } = await axios.get(employ.link);
			const $ = cheerio.load(data);
			const elements = this.selectElements($, children.selector);

			const [details] = this.parseElements($, elements, children.details);
			return { ...employ, details };
		});

		const result = await Promise.all(promises);
		return result;
	}

	selectElements($, selector: string): cheerio.Element[] {
		const elements: cheerio.Element[] = [];
		$(selector).each(function (i, elem) {
			elements[i] = elem;
		});
		return elements;
	}

	parseElements($, elements: cheerio.Element[], config: { [key: string]: any }): any[] {
		return elements.map((el) => {
			return Object.entries(config).reduce((acc, [key, value]) => {
				if (key === 'link') {
					acc[key] = this.config.url + $(el).find(value).attr('href');
				} else {
					acc[key] = $(el).find(value).first().text().trim();
				}
				return acc;
			}, {});
		});
	}

	async writeJSONFile(name: string, obj: { [key: string]: any }): Promise<void> {
		const data = JSON.stringify(obj);
		try {
			await writeFile(name, data);
		} catch (err) {
			throw err;
		}
	}
}
