// import { Dalle } from "node-dalle2";
// import fetch from "node-fetch";
// globalThis.fetch = fetch;

// // Add Session key
// const dalle = new Dalle({ apiKey: "***REMOVED***" });

// // Create an async function 
// const getDalle2Images = async (caption) => {
//   // Call the Dall-e 2 API
//   const response = await dalle.generate(caption);

//   // If Dall-e 2 couldn't generate images from the given caption
//   if (!response) {
//     console.error(
//       "Dall-e 2 couldn't generate images based upon the given caption."
//     );
//     return null;
//   }

//   // Get the image array from the response object
//   const { data } = response;
//   console.log(data);
//   // Return the image array
//   return data;
// };

// getDalle2Images("cat");


// //  // DALLE-2
// //  const response = await openai.getImageDalle2(ctx.message.text);
// //  const imagesForGroupSend = exportImageUrls(response);
// //  console.log(imagesForGroupSend);
// //  await ctx.telegram.sendMediaGroup(ctx.chat.id, imagesForGroupSend);


// export function exportImageUrls(data) {
//   return data.map(image => ({
//     type: 'photo',
//     media: image.generation.image_path
//   }));