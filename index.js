import { savefrom } from '@bochilteam/scraper-savefrom'

const data = await savefrom('https://youtu.be/iik25wqIuFo')

// Saare iTags aur unka info dikhane ke liye:
data.links.forEach(link => {
  console.log(`iTag: ${link.itag}, Quality: ${link.quality}, Type: ${link.type}, URL: ${link.url}`)
})
