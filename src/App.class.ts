import axios from 'axios';
import * as cheerio from 'cheerio';

export class App {
  constructor() {
    console.log('App started');
    this.run(); // run app
  }
  // main app method
  run = async (): Promise<void> => {
    console.log('App.run() called');
  };
}
