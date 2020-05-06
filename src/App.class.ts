import axios from 'axios';
import * as cheerio from 'cheerio';

interface configModel {
  name: string;
  title: string;
  link: string;
  details?: { [key: string]: any };
}

export class App {
  config: configModel = {
    name: '.name',
    title: '.title',
    link: 'a',
  };
  details = {
    email: '.email',
    dob: '.birthday',
  };
  constructor() {
    console.log('App started');
    this.run(); // run app
  }
  // main app method
  run = async (): Promise<void> => {
    console.log('App.run() called');
    try {
      const { data } = await axios.get('http://grazr-web.herokuapp.com/');
      const $ = cheerio.load(data);
      const elements = this.selectElements($, '.user-card');
      const employees = this.parseElements($, elements, this.config);
      const detail_html = await this.resolveAllDetailHTTPRequests(employees); // html detail array for each employee

      console.log(detail_html);
    } catch (e) {
      console.log(e);
    }
  };

  async resolveAllDetailHTTPRequests(employees: configModel[]): Promise<configModel[]> {
    const promises = employees.map(async (employ) => {
      const html = await this.getHTMLDetails(employ);
      const $ = cheerio.load(html);
      const elements = this.selectElements($, '.user-content');
      const [details] = this.parseElements($, elements, this.details, true);
      employ.details = details;
      return employ;
    });

    const result = await Promise.all(promises);
    return result;
  }

  async getHTMLDetails(config): Promise<string> {
    const { data } = await axios.get(config.link);
    return data;
  }

  selectElements($, selector: string): CheerioElement[] {
    const elements: CheerioElement[] = [];
    $(selector).each(function (i, elem) {
      elements[i] = elem;
    });
    return elements;
  }

  parseElements($, elements: CheerioElement[], config: { [key: string]: any }, details = false): configModel[] {
    return elements.map((el) => {
      let result;
      if (details) {
        result = {
          email: null,
          dob: null,
        };
      } else {
        result = {
          name: null,
          title: null,
          link: null,
        };
      }

      Object.entries(config).forEach(([key, value]) => {
        if (key === 'link') {
          result[key] = 'http://grazr-web.herokuapp.com' + $(el).find(value).attr('href');
        } else {
          result[key] = $(el).find(value).first().text().trim();
        }
      });

      return result;
    });
  }
}
