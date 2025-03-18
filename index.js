// import module
import { savefrom } from '@bochilteam/scraper-savefrom'

const data = await savefrom('https://youtu.be/iik25wqIuFo')

// Extracting formats and quality
const formatsAndQuality = data.formats.map(format => ({
  format: format.format,
  quality: format.quality
}));

console.log(formatsAndQuality); // Display formats and quality
