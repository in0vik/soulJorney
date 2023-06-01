import config from 'config';
import * as deepl from 'deepl-node';

class Translator {
  constructor(apiKey) {
    this.translator = new deepl.Translator(apiKey);
  }
  async translateToEnglish(text) {
    return await this.translator.translateText(text, null, 'en-US');
  }
}

export const translator = new Translator(config.get('DEEPL_KEY'));
