import { savefrom } from '@bochilteam/scraper-savefrom'

// Map itag to audio quality
const itagAudioQualityMap = {
  '139': '48kbps',
  '140': '128kbps',
  '141': '256kbps',
  '249': '50kbps',
  '250': '70kbps',
  '251': '160kbps',
};

// Function to fetch and logically organize video and audio formats
async function getVideoAndAudioFormats(url) {
  try {
    // Fetching data from the savefrom API
    const data = await savefrom(url);
    
    if (data && Array.isArray(data)) {
      data.forEach(item => {
        // Extracting title and duration from meta information
        const title = item.meta?.title || 'No title available';
        const duration = item.meta?.duration || 'No duration available';
        
        console.log('Title:', title);
        console.log('Duration:', duration);
        
        // Extracting resolution/quality (like 1080p, 720p, etc.)
        const resolutions = item.video_quality || [];
        console.log('Resolutions:', resolutions.map(res => res.quality).join(', '));

        // Video formats (only mp4 and webm)
        console.log('\nVideo Formats (mp4 or webm only):');
        const videoFormats = item.url?.filter(format => format.ext === 'mp4' || format.ext === 'webm');
        videoFormats?.forEach(format => {
          console.log(`- ${format.ext.toUpperCase()} (Quality: ${format.type || 'N/A'}, URL: ${format.url})`);
        });

        // Audio formats (mp3, opus, m4a, and any other audio format)
        console.log('\nAudio Formats (mp3, opus, m4a, and others):');
        const audioFormats = item.url?.filter(format => 
          ['mp3', 'opus', 'm4a', 'aac', 'flac', 'ogg'].includes(format.ext)
        );
        audioFormats?.forEach(format => {
          // Extract itag from URL
          const itagMatch = format.url.match(/itag=(\d+)/);
          const itag = itagMatch ? itagMatch[1] : null;
          const audioQuality = itag ? itagAudioQualityMap[itag] || 'Unknown' : 'Unknown';
          
          console.log(`- ${format.ext.toUpperCase()} (Quality: ${audioQuality}, URL: ${format.url})`);
        });
      });
    } else {
      console.log('No video data available.');
    }
  } catch (error) {
    console.log('Error fetching video data:', error);
  }
}

// Example usage
getVideoAndAudioFormats('https://youtu.be/iik25wqIuFo');
