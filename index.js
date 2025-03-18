import { savefrom } from '@bochilteam/scraper-savefrom';

// iTag to Quality Mapping
const qualityMap = {
  5: '240p Both', 6: '270p Both', 17: '144p Both', 18: '360p Both', 22: '720p Both',
  34: '360p Both', 35: '480p Both', 36: '180p Both', 37: '1080p Both', 38: '3072p Both',
  43: '360p Both', 44: '480p Both', 45: '720p Both', 46: '1080p Both',
  133: '240p Video', 134: '360p Video', 135: '480p Video', 136: '720p Video',
  137: '1080p Video', 138: '2160p Video', 160: '144p Video', 242: '240p Video',
  243: '360p Video', 244: '480p Video', 247: '720p Video', 248: '1080p Video',
  271: '1440p Video', 313: '2160p Video', 315: '2160p Video', 299: '1080p Video',
  394: '144p Video', 395: '240p Video', 396: '360p Video', 397: '480p Video',
  398: '720p Video', 399: '1080p Video', 400: '1440p Video', 401: '2160p Video',
  139: '48kbps Audio', 140: '128kbps Audio', 141: '256kbps Audio', 171: '128kbps Audio',
  172: '192kbps Audio', 249: '96kbps Audio', 250: '128kbps Audio', 251: '160kbps Audio'
};

// Extract iTag from URL
function extractItag(url) {
  const itagMatch = url.match(/[?&]itag=(\d+)/);
  return itagMatch ? parseInt(itagMatch[1]) : null;
}

// Calculate Bitrate
function calculateBitrate(clen, dur) {
  if (!clen || !dur) return 'Unknown';
  const bitrate = (parseInt(clen) * 8) / (parseFloat(dur) * 1000);
  return Math.round(bitrate);
}

// Fetch Video and Audio Formats
async function getVideoAndAudioFormats(url) {
  try {
    const data = await savefrom(url);

    if (data && Array.isArray(data)) {
      data.forEach(item => {
        const title = item.meta?.title || 'No title available';
        const duration = item.meta?.duration || 'No duration available';
        
        console.log('Title:', title);
        console.log('Duration:', duration);

        

        // Video formats (only mp4 and webm)
        console.log('\nVideo Formats (mp4 or webm only):');
        const videoFormats = item.url?.filter(format => format.ext === 'mp4' || format.ext === 'webm');
        videoFormats?.forEach(format => {
          const itag = extractItag(format.url);
          const quality = qualityMap[itag] || 'Unknown Quality';
          console.log(`- ${format.ext.toUpperCase()} (Quality: ${quality}, URL: ${format.url})`);
        });

        // Audio formats (auto-detect quality)
        console.log('\nAudio Formats (Auto Quality Detection):');
        const audioFormats = item.url?.filter(format =>
          ['mp3', 'opus', 'm4a', 'aac', 'flac', 'ogg'].includes(format.ext)
        );

        let bestAudio = null;
        let highestBitrate = 0;

        audioFormats?.forEach(format => {
          const clenMatch = format.url.match(/clen=(\d+)/);
          const durMatch = format.url.match(/dur=([\d.]+)/);
          const clen = clenMatch ? clenMatch[1] : null;
          const dur = durMatch ? durMatch[1] : null;
          const bitrate = calculateBitrate(clen, dur);
          const itag = extractItag(format.url);
          const audioQuality = bitrate === 'Unknown' ? (qualityMap[itag] || 'Unknown Quality') : `${bitrate} kbps`;

          console.log(`- ${format.ext.toUpperCase()} (Quality: ${audioQuality}, URL: ${format.url})`);

          // Select best audio (highest bitrate)
          if (bitrate !== 'Unknown' && bitrate > highestBitrate) {
            highestBitrate = bitrate;
            bestAudio = format.url;
          }
        });

        // Best Audio
        if (bestAudio) {
          console.log('\nBest Audio:', bestAudio);
        } else {
          console.log('\nNo best audio found.');
        }
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
