import { savefrom } from '@bochilteam/scraper-savefrom'

// Function to fetch and show all formats and qualities
async function getAllFormatsAndQuality(url) {
  try {
    // Fetching data from the savefrom API
    const data = await savefrom(url)
    
    // Check if the data is an array
    if (data && Array.isArray(data)) {
      data.forEach(item => {
        // Display available video qualities (1080p, 720p, etc.)
        if (item.video_quality && Array.isArray(item.video_quality)) {
          item.video_quality.forEach(quality => {
            console.log('Video Quality:', quality.quality)
          })
        }

        // Display available formats (mp4, mp3, webm, etc.)
        if (item.url && Array.isArray(item.url)) {
          item.url.forEach(formatItem => {
            console.log('Format:', formatItem.ext, 'Type:', formatItem.type, 'URL:', formatItem.url)
          })
        }

        // Check for SD and HD formats if available
        if (item.sd) {
          console.log('SD Format:', item.sd.format, 'Quality:', item.sd.quality)
        }
        if (item.hd) {
          console.log('HD Format:', item.hd.format, 'Quality:', item.hd.quality)
        }
      })
    } else {
      console.log('No video formats or qualities available.')
    }
  } catch (error) {
    console.log('Error fetching video data:', error)
  }
}

// Example usage
getAllFormatsAndQuality('https://youtu.be/iik25wqIuFo')
