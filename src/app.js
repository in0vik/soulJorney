import config from 'config';
import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import replicate from 'node-replicate';
import { ogg } from './ogg.js';
import { openai } from './openai.js';
import { code } from 'telegraf/format';
import { translator } from './translate.js';
import { models } from './models.js';
import { BOT_TOKEN } from '../config/config.js';

const bot = new Telegraf(BOT_TOKEN);

let currentModel = models.kandinsky;

// Handler for the /start command
bot.start(async (ctx) => {
  await ctx.reply('Say or text me what can I draw for you?');
});

// Command to set the current model to Kandinsky
bot.command('kandinsky', (ctx) => {
  currentModel = models.kandinsky;
  ctx.reply('Model set to Kandinsky');
});

// Command to set the current model to Stable Diffusion
bot.command('stablediff', (ctx) => {
  currentModel = models.stablediff;
  ctx.reply('Model set to Stable Diffusion');
});

// Command to set the current model to Vintedois Diffusion
bot.command('vintedois', (ctx) => {
  currentModel = models.vintedois;
  ctx.reply('Model set to Vintedois Diffusion');
});

// Handler for text messages
bot.on(message('text'), async (ctx) => {
  try {
    await ctx.persistentChatAction(
      'upload_photo',
      async () => {
        // REPLICATE
        const translatedText = await translator.translateToEnglish(ctx.message.text);
        const response = await replicate.run(currentModel, {
          prompt: translatedText.text,
        });
        const imageUrl = response[0];
        await ctx.replyWithPhoto({ url: imageUrl });
      },
      { intervalDuration: 10000 }
    ); // Typing interval duration set to 10 seconds
  } catch (err) {
    console.log(`Error while processing text message: ${err}`);
    if (err.message === "Cannot read property 'model' of undefined") {
      await ctx.reply(code('Model currently unavailable, please try again later'));
    }
  }
});

// Handler for voice messages
bot.on(message('voice'), async (ctx) => {
  try {
    // Show typing status while processing the message
    await ctx.persistentChatAction(
      'upload_photo',
      async () => {
        // Get the voice file link and user ID
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
        const userId = String(ctx.message.from.id);

        // Convert voice file to OGG format
        const oggPath = await ogg.create(link.href, userId);

        // Convert OGG file to MP3 format
        const mp3path = await ogg.toMp3(oggPath, userId);

        // Transcribe the MP3 file using OpenAI
        const text = await openai.transcription(mp3path);
        // Reply with the transcribed text
        await ctx.reply(code('🗣️ ' + text));
        const translatedText = await translator.translateToEnglish(text);
        const response = await replicate.run(currentModel, { prompt: translatedText.text });
        const imageUrl = response[0];
        await ctx.replyWithPhoto({ url: imageUrl });
      },
      { intervalDuration: 10000 }
    ); // Typing interval duration set to 10 seconds
  } catch (err) {
    console.log(`Error while processing voice message: ${err}`);
  }
});

bot.launch();
