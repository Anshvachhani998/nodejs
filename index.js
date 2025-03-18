import { savefrom } from '@bochilteam/scraper-savefrom'

const data = await savefrom('https://youtu.be/iik25wqIuFo')

// URLs ko log karte waqt unke andar ke values ko properly access karna
data[0].url.forEach((item, index) => {
  console.log(`URL ${index + 1}:`, item.url); // item.url ko access karte hain
});
