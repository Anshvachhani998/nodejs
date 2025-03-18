import { savefrom } from '@bochilteam/scraper-savefrom';

// Function to fetch video and audio formats
async function getVideoAndAudioFormats(url) {
  try {
    const data = await savefrom(url);

    if (!data || !Array.isArray(data)) {
      console.log('No video data available.');
      return;
    }

    data.forEach(item => {
      const title = item.meta?.title || 'No title available';
      const duration = item.meta?.duration || 'No duration available';
      const videoQualities = item.video_quality || [];

      console.log('Title:', title);
      console.log('Duration:', duration);
      console.log('Available Qualities:', videoQualities.join(', ') || 'Unknown');

      // Handle hd/sd fallback to url array
      const videoUrls = [];

      // Check if 'hd' or 'sd' exists, otherwise fallback to 'url' array
      if (item.hd) videoUrls.push({ quality: item.hd.format, url: item.hd.url });
      if (item.sd) videoUrls.push({ quality: item.sd.format, url: item.sd.url });

      if (videoUrls.length === 0) {
        // No hd/sd, fallback to url array
        item.url?.forEach(format => {
          if (format.type === 'video') {
            videoUrls.push({ quality: format.name, url: format.url });
          }
        });
      }

      // Display video formats
      console.log('\nVideo Formats:');
      videoUrls.forEach(v => console.log(`- ${v.quality || 'Unknown'}: ${v.url}`));

      // Extract audio formats
      console.log('\nAudio Formats:');
      item.url?.forEach(format => {
        if (format.type === 'audio') {
          console.log(`- ${format.ext.toUpperCase()} (${format.name}): ${format.url}`);
        }
      });

      console.log('\n-----------------------------\n');
    });
  } catch (error) {
    console.log('Error fetching video data:', error);
  }
}

// Example usage
getVideoAndAudioFormats('https://youtu.be/iik25wqIuFo');
