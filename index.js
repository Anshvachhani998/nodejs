import { savefrom } from '@bochilteam/scraper-savefrom'

// Function to fetch and show video formats and quality
async function getVideoFormats(url) {
  try {
    // Fetching data from the savefrom API
    const data = await savefrom(url)
    
    // Check if the formats or video_quality are available in the response
    if (data && Array.isArray(data)) {
      // Loop through the response array and filter the formats
      data.forEach(item => {
        // Extracting formats and their qualities (mp4, mp3, webm, etc.)
        if (item.video_quality && Array.isArray(item.video_quality)) {
          const formatsAndQuality = item.video_quality.map(quality => ({
            quality
          }))
          
          console.log('Video Quality:', formatsAndQuality) // Show formats and qualities
        }
        
        // Checking and displaying specific formats like mp4, mp3, webm
        if (item.sd) {
          console.log('SD Quality:', item.sd.format, item.sd.quality)
        }
        if (item.hd) {
          console.log('HD Quality:', item.hd.format, item.hd.quality)
        }
      })
    } else {
      console.log('No formats or video quality found.')
    }
  } catch (error) {
    console.log('Error fetching video data:', error)
  }
}

// Example usage
getVideoFormats('https://youtu.be/iik25wqIuFo')
