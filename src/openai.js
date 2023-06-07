import { Configuration, OpenAIApi } from 'openai';
import { Dalle } from "node-dalle2";
import { createReadStream } from 'fs';
import fetch from "node-fetch";
import { DALLE2_KEY, OPENAI_KEY } from '../config/config.js';
globalThis.fetch = fetch


class OpenAI {
  constructor(apiKey, dalle2key) {
    const configuration = new Configuration({
      apiKey: apiKey,
    });
    this.openai = new OpenAIApi(configuration);
    this.dalle2 = new Dalle({ apiKey: dalle2key });
  }

  // Transcribe an audio file using the OpenAI Whisper ASR API
  async transcription(filepath) {
    try {
      const response = await this.openai.createTranscription(
        createReadStream(filepath),
        'whisper-1'
      );
      return response.data.text; // Return the transcribed text
    } catch (err) {
      console.log(`Error while transcribing: ${err}`);
    }
  }

  async getImageDalle(prompt) {
    const response = await this.openai.createImage({
      prompt: prompt,
      n: 1,
      size: '1024x1024',
    });
    return response.data.data[0].url;
  }

  async getImageDalle2(prompt) {
    const response = await this.dalle2.generate(prompt);
    const { data } = response;
    return data;
  }
  
}

export const openai = new OpenAI(OPENAI_KEY, DALLE2_KEY);
