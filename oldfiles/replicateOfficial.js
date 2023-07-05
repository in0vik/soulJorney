// replicate.js

// import ReplicateOfficial from "replicate";
// const replicateOffical = new ReplicateOfficial({
//   auth: process.env.REPLICATE_API_TOKEN,
// });

// async function generateImageOfficial(currentModel, prompt) {
//   console.log('INPUT: ' + currentModel, prompt);
//    let input = { prompt: prompt } 
//    let output = await replicateOffical.run(currentModel, { input })
//   console.log('OUTPUT: ' + output);
//   return output;
// }
// export {
//   generateImageOfficial,
//   replicateOffical
// }



// telegram-hook.js

// bot.on(message('text'), async (ctx) => {
//   try {
//     const currentModel = await getUserCurrentModel(ctx.message.from.id);

//     await ctx.persistentChatAction(
//       'upload_photo',
//       async () => {
//         const translatedText = await translator.translateToEnglish(ctx.message.text);
//         const response = await replicate.generateImageOfficial(currentModel, translatedText.text);
//         const imageUrl = response[0];
//         await ctx.replyWithPhoto({ url: imageUrl });
//       },
//       { intervalDuration: 10000 }
//     );
//   } catch (err) {
//     console.log(`Error while processing text message: ${err}`);
//       if (err.message.includes(`Cannot read property 'model' of undefined`)) {
// const webhookUrl = `${BASE_PATH}/api/telegram-hook/?chatId=${ctx.message.chat.id}`;
// const currentModel = await getUserCurrentModel(ctx.message.from.id);
// const translatedText = await translator.translateToEnglish(ctx.message.text);
// let prediction = await replicateOffical.predictions.create({
//   version: currentModel.split(':')[1],
//   input: { prompt: translatedText.text },
//   webhook: webhookUrl,
//   webhook_events_filter: ['completed'], // optional
// });
// } else {
//   await ctx.reply(code('Model currently unavailable, please try again later'));
// }
//   }
// });