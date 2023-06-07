import config from 'config';
import * as deepl from 'deepl-node';
import { DEEPL_KEY } from '../config/config.js';

class Translator {
  constructor(apiKey) {
    this.translator = new deepl.Translator(apiKey);
  }
  async translateToEnglish(text) {
    return await this.translator.translateText(text, null, 'en-US');
  }
}

export const translator = new Translator(DEEPL_KEY);
