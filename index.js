import { savefrom } from '@bochilteam/scraper-savefrom'

const data = await savefrom('https://youtu.be/iik25wqIuFo')

// Pehle item ko access kar rahe hain
const videoData = data[0];

// Title aur Thumbnail print karte hain
console.log("Title:", videoData.meta.title);
console.log("Thumbnail:", videoData.thumb);

// Video aur Audio ko alag karte hain
const audioUrls = [];
const videoUrls = [];
const dashFormats = [];

// URLs ko alag karte hain (audio, video, dash)
videoData.url.forEach((item) => {
  if (item.type === "video") {
    videoUrls.push(item);  // Video type URLs ko store kar rahe hain
  } else if (item.type === "audio") {
    audioUrls.push(item);  // Audio type URLs ko store kar rahe hain
  } else if (item.type === "dash") {
    dashFormats.push(item);  // Dash formats (like webm, opus, etc.)
  }
});

// Video Quality aur URLs print karte hain
console.log("\nVideo Quality and URLs:");
videoUrls.forEach((videoItem) => {
  console.log(`  Quality ${videoItem.ext}:`);
  console.log(`    URL: ${videoItem.url}`);
});

// Audio URLs print karte hain
console.log("\nAudio URLs:");
audioUrls.forEach((audioItem, index) => {
  console.log(`  Audio ${index + 1}:`);
  console.log(`    URL: ${audioItem.url}`);
});

// DASH formats URLs print karte hain
console.log("\nDASH Formats (WEBM, OPUS, etc.):");
dashFormats.forEach((dashItem, index) => {
  console.log(`  DASH Format ${index + 1} (${dashItem.ext}):`);
  console.log(`    URL: ${dashItem.url}`);
});
