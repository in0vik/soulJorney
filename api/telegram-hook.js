import { Telegraf } from 'telegraf';

import { message } from 'telegraf/filters';
import { code } from 'telegraf/format';
import { ogg } from '../src/ogg.js';
import { openai } from '../src/openai.js';
import { translator } from '../src/translate.js';
import { models } from '../src/models.js';
import { generateImage } from '../src/replicate.js';
import { getUserCurrentModel, setCurrentModel } from '../src/database.js';

const { BOT_TOKEN } = process.env;
const { BASE_PATH } = process.env;

const bot = new Telegraf(BOT_TOKEN);

async function handleSetModelCommand(ctx) {
  const modelName = ctx.message.text.slice(1);
  await setCurrentModel(ctx.message.from.id, models[modelName]);
  ctx.reply(`Model set to ${modelName[0]?.toUpperCase()}${modelName.slice(1)}`);
}

// Handler for the /start command
bot.start(async (ctx) => {
  await ctx.reply('Say or text me what can I draw for you?');
  await setCurrentModel(ctx.message.from.id, models.kandinsky);
});

Object.keys(models).forEach((modelName) => {
  bot.command(modelName.toLowerCase(), handleSetModelCommand);
});

// Handler for text messages
bot.on(message('text'), async (ctx) => {
  try {
    const currentModel = await getUserCurrentModel(ctx.message.from.id);
    await ctx.persistentChatAction(
      'upload_photo',
      async () => {
        const translatedText = await translator.translateToEnglish(ctx.message.text);
        let imageUrl = await generateImage(currentModel, translatedText.text);
        await ctx.replyWithPhoto(imageUrl[0]);
      },
      { intervalDuration: 10000 }
    );
  } catch (err) {
    console.log(`Error while processing text message: ${err}`);
    await ctx.reply(code('Model currently unavailable, please try again later'));
  }
});

// Handler for voice messages
// bot.on(message('voice'), async (ctx) => {
//   try {
//     const currentModel = await getUserCurrentModel(ctx.message.from.id);

//     // Show typing status while processing the message
//     await ctx.persistentChatAction(
//       'upload_photo',
//       async () => {
//         // Get the voice file link and user ID
//         const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
//         const userId = String(ctx.message.from.id);
//         // Convert voice file to OGG format
//         const oggPath = await ogg.create(link.href, userId);
//         // Convert OGG file to MP3 format
//         const mp3path = await ogg.toMp3(oggPath, userId);
//         // Transcribe the MP3 file using OpenAI
//         const text = await openai.transcription(mp3path);
//         // Reply with the transcribed text
//         await ctx.reply(code('🗣️ ' + text));
//         const translatedText = await translator.translateToEnglish(text);
//         const webhookUrl = `${BASE_PATH}/api/telegram-hook/?chatId=${ctx.message.chat.id}`;

//         const prediction = await replicateOffical.predictions.create({
//           version: currentModel.split(':')[1],
//           input: { prompt: translatedText.text },
//           webhook: webhookUrl,
//           webhook_events_filter: ['completed'],
//         });
//         console.log(prediction);
//       },
//       { intervalDuration: 10000 }
//     );
//   } catch (err) {
//     console.log(`Error while processing voice message: ${err}`);
//   }
// });

export default async (req, res) => {
  try {
    await bot.telegram.setWebhook(`${BASE_PATH}/api/telegram-hook`);
    await bot.handleUpdate(req.body);
  } catch (error) {
    console.error(`Error sending message: ${error.toString()}`);
  }

  res.status(200).send('OK');
};
