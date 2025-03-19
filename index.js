import express from 'express';
import { savefrom } from '@bochilteam/scraper-savefrom';

const app = express();
const PORT = process.env.PORT || 3000;

// iTag to Quality Mapping
const qualityMap = {
  4320: [138, 272, 571, 402, 702],
  2160: [266, 305, 313, 315, 337, 401, 701],
  1440: [264, 304, 271, 308, 336, 400, 700],
  1080: [137, 216, 299, 303, 335, 399, 616, 248, 699, 170],
  608:  [779, 780, 788],
  720:  [136, 298, 247, 302, 334, 398, 612, 698, 169],
  480:  [168, 135, 244, 397, 333, 697],
  360:  [167, 134, 243, 396, 332, 696],
  240:  [133, 242, 395, 331, 695],
  144:  [160, 597, 278, 394, 330, 694]
};

const legacyQualityMap = {
  144: [17, 13, 36],
  240: [5],
  270: [6],
  360: [18, 34, 43],
  480: [35, 44, 78, 59],
  720: [22, 45],
  1080: [37, 46],
  3072: [38]
};

// Extract iTag from URL
function extractItag(url) {
  const itagMatch = url.match(/[?&]itag=(\d+)/);
  return itagMatch ? parseInt(itagMatch[1]) : null;
}

// Get Quality from iTag
function getQualityFromItag(itag) {
  // Check in DASH Quality Map
  for (const [quality, itags] of Object.entries(qualityMap)) {
    if (itags.includes(itag)) return `${quality}p DASH`;
  }
  // Check in Legacy Quality Map
  for (const [quality, itags] of Object.entries(legacyQualityMap)) {
    if (itags.includes(itag)) return `${quality}p NON-DASH`;
  }
  // If not found
  return 'Unknown Quality';
}
// Calculate Bitrate
function calculateBitrate(clen, dur) {
  if (!clen || !dur) return 'Unknown';
  const bitrate = (parseInt(clen) * 8) / (parseFloat(dur) * 1000);
  return Math.round(bitrate);
}

// Root Route
app.get('/', (req, res) => {
  res.send('API is Working! Use /api/yt?url=YOUR_YOUTUBE_URL');
});

// YouTube API Route
app.get('/api/yt', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const data = await savefrom(url);

    if (!data || !Array.isArray(data)) {
      return res.status(404).json({ error: 'No video data available' });
    }

    const response = data.map(item => {
      const title = item.meta?.title || 'No title available';
      const duration = item.meta?.duration || 'No duration available';

      // Video Formats
      const videoFormats = item.url?.filter(format => format.ext === 'mp4' || format.ext === 'webm')
        .map(format => {
          const itag = extractItag(format.url);
          const quality = getQualityFromItag(itag);
          return {
            format: format.ext.toUpperCase(),
            quality: quality,
            url: format.url
          };
        }) || [];

      // Audio Formats and Best Audio
      let bestAudio = null;
      let highestBitrate = 0;
      const audioFormats = item.url?.filter(format =>
        ['mp3', 'opus', 'm4a', 'aac', 'flac', 'ogg'].includes(format.ext)
      ).map(format => {
        const clenMatch = format.url.match(/clen=(\d+)/);
        const durMatch = format.url.match(/dur=([\d.]+)/);
        const clen = clenMatch ? clenMatch[1] : null;
        const dur = durMatch ? durMatch[1] : null;
        const bitrate = calculateBitrate(clen, dur);
        const audioQuality = bitrate === 'Unknown' ? 'Unknown Quality' : `${bitrate} kbps`;

        // Select best audio (highest bitrate)
        if (bitrate !== 'Unknown' && bitrate > highestBitrate) {
          highestBitrate = bitrate;
          bestAudio = format.url;
        }

        return {
          format: format.ext.toUpperCase(),
          quality: audioQuality,
          url: format.url
        };
      }) || [];

      return {
        title,
        duration,
        videoFormats,
        audioFormats,
        bestAudio
      };
    });

    res.json(response);
  } catch (error) {
    console.error('Error fetching video data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
