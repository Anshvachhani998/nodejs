// import module
import { savefrom } from '@bochilteam/scraper-savefrom'

// Fetch data
const data = await savefrom('https://youtu.be/iik25wqIuFo')

// Pretty print JSON response
console.log(JSON.stringify(data, null, 2))
