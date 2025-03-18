import { savefrom } from '@bochilteam/scraper-savefrom';

// iTag to Quality Mapping
const qualityMap = {
  // Video + Audio
  18: '360p Both',
  22: '720p Both',

  // Video Only (MP4 and WebM)
  137: '1080p Video',
  136: '720p Video',
  135: '480p Video',
  134: '360p Video',
  133: '240p Video',
  160: '144p Video',
  399: '1080p Video',
  398: '720p Video',
  397: '480p Video',
  243: '360p Video',
  242: '240p Video',

  // Audio Only
  140: '128kbps Audio',
  251: '160kbps Audio',
  250: '128kbps Audio',
  249: '96kbps Audio'
};

// Function to calculate bitrate
function calculateBitrate(clen, dur) {
  if (!clen || !dur) return 'Unknown';
  const bitrate = (parseInt(clen) * 8) / (parseFloat(dur) * 1000);
  return `${Math.round(bitrate)} kbps`;
}

// Fetch and logically organize video and audio formats
async function getVideoAndAudioFormats(url) {
  try {
    const data = await savefrom(url);
    
    if (data && Array.isArray(data)) {
      data.forEach(item => {
        const title = item.meta?.title || 'No title available';
        const duration = item.meta?.duration || 'No duration available';
        
        console.log('Title:', title);
        console.log('Duration:', duration);

        // Video resolutions from 'video_quality'
        const resolutions = item.video_quality?.map(res => res.quality) || [];
        console.log('Resolutions:', resolutions.join(', '));

        // Video formats (only mp4 and webm)
        console.log('\nVideo Formats (mp4 or webm only):');
        const videoFormats = item.url?.filter(format => format.ext === 'mp4' || format.ext === 'webm');
        videoFormats?.forEach((format, index) => {
          const quality = qualityMap[format.itag] || resolutions[index] || 'Unknown Quality';
          console.log(`- ${format.ext.toUpperCase()} (Quality: ${quality}, URL: ${format.url})`);
        });

        // Audio formats (auto-detect quality)
        console.log('\nAudio Formats (Auto Quality Detection):');
        const audioFormats = item.url?.filter(format =>
          ['mp3', 'opus', 'm4a', 'aac', 'flac', 'ogg'].includes(format.ext)
        );
        audioFormats?.forEach(format => {
          const clenMatch = format.url.match(/clen=(\d+)/);
          const durMatch = format.url.match(/dur=([\d.]+)/);
          const clen = clenMatch ? clenMatch[1] : null;
          const dur = durMatch ? durMatch[1] : null;
          const audioQuality = calculateBitrate(clen, dur);

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
