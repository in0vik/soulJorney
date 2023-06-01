import config from 'config';
import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import replicate from 'node-replicate';
import { ogg } from './ogg.js';
import { openai } from './openai.js';
import { code } from 'telegraf/format';
import { translator } from './translate.js';

const bot = new Telegraf(config.get('BOT_TOKEN'));

const models =
  {
    stablediff: "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
    vintedois: "22-hours/vintedois-diffusion:28cea91bdfced0e2dc7fda466cc0a46501c0edc84905b2120ea02e0707b967fd",
    kandinsky: "ai-forever/kandinsky-2:601eea49d49003e6ea75a11527209c4f510a93e2112c969d548fbb45b9c4f19f",
    // edgeofreal: "mcai/edge-of-realism-v2.0:b218c128d5762c7a27c7e5e5942b9a51827133cdf1e6623e76d643039c106858",
    // babes: "mcai/babes-v2.0:e94d3df2fa57aeb76079369d57d5e8e2f2b087d4cec07b035125c0875304b4ad",
    // lora: "zhouzhengjun/lora_openjourney_v4:f8e5074f993f6852679bdac9f604590827f11698fdbfc3f68a1f0c3395b46db6",
    // anythyng: "cjwbw/anything-v3-better-vae:09a5805203f4c12da649ec1923bb7729517ca25fcac790e640eaa9ed66573b65",
    // analogdiff: "cjwbw/analog-diffusion:1f7f51e8b2e43ade14fb7d6d62385854477e078ac870778aafecf70c0a6de006",
    // rpg: "mcai/rpg-v4:a2d69f99475d76956b73235fc3d1f1491807f55613ed05118539ec1277fe60fc",
    // urpm: "mcai/urpm-v1.3:60fb3a14ddf6462c016c304fe8b9f121dfcf61d144b39c99af794c091f75c7ea",
    // cyberleal: "mcai/cyberrealistic-v3.0:8ab9d9da557f1ea07d82d2ca604e4bf54ae8ef8cf1441055cb4b08afe80748b8",
    // deliberate: "mcai/deliberate-v2:8e6663822bbbc982648e3c34214cf42d29fe421b2620cc33d8bda767fc57fe5a",
    // realvision: "mcai/realistic-vision-v2.0:bed7774ff9503c3e7971627eb523d7ab2ea12f7b649c9887556747d946d11a73",
    // lyrel: "mcai/lyriel-v1.5:41207c4c2dceb37285d29faf106198c8fde3141a52b3e49b70506bb62f833f8d",
    // delib: "benjielysium/delib_realv:c581bb078c9f74e580960262a493d9ea186b2e76e2a71713b4daa4a900ccc9a5"
  };

let currentModel = models.kandinsky;

bot.start(async (ctx) => {
  await ctx.reply('Say or text me what can I draw you?');
});

bot.command('kandinsky', (ctx) => {
  currentModel = models.kandinsky;
  ctx.reply('Model set to Kandinsky');
})

bot.command('stablediff', (ctx) => {
  currentModel = models.stablediff;
  ctx.reply('Model set to Stable Diffusion');
})

bot.command('vintedois', (ctx) => {
  currentModel = models.vintedois;
  ctx.reply('Model set to Vintedois Diffusion');
})

bot.on(message('text'), async (ctx) => {
  try {
    await ctx.persistentChatAction(
      'upload_photo',
      async () => {
        // REPLICATE
        const translatedText = await translator.translateToEnglish(ctx.message.text);
        const response = await replicate.run(currentModel, {
            prompt: translatedText.text
          }
        );
        const imageUrl = response[0];
        await ctx.replyWithPhoto({ url: imageUrl });

        // DALLE-1 
        // const imageUrl = await openai.image(ctx.message.text);

      },
      { intervalDuration: 10000 }
    ); // Typing interval duration set to 10 seconds
  } catch (err) {
    console.log(`error while voice message: ${err}`);
  }
});

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
    console.log(`error while voice message: ${err}`);
  }
});

bot.launch();
