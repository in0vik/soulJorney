import { Configuration, OpenAIApi } from 'openai';
import { createReadStream } from 'fs';
import fetch from "node-fetch";
globalThis.fetch = fetch

const { OPENAI_KEY } = process.env;

class OpenAI {
  constructor(apiKey) {
    const configuration = new Configuration({
      apiKey: apiKey,
    });
    this.openai = new OpenAIApi(configuration);
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
  
}

export const openai = new OpenAI(OPENAI_KEY);
