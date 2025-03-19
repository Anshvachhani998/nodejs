import express from 'express';
import { savefrom } from '@bochilteam/scraper-savefrom';

const app = express();
const PORT = process.env.PORT || 3000;

// iTag to Quality Mapping
const qualityMap = {
  4320p: [138, 272, 571, 402, 702],
  2160p: [266, 305, 313, 315, 337, 401, 701],
  1440p: [264, 304, 271, 308, 336, 400, 700],
  1080p: [137, 216, 299, 303, 335, 399, 616, 248, 699, 170],
  720p:  [136, 298, 247, 302, 334, 398, 612, 698, 169],
  480p:  [168, 135, 244, 397, 333, 697],
  360p:  [167, 134, 243, 396, 332, 696],
  240p:  [133, 242, 395, 331, 695],
  144p:  [160, 597, 278, 394, 330, 694] 
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

// Root Route
app.get('/', (req, res) => {
  res.send('API is Working! Use to get video data.');
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

      const videoFormats = item.url?.filter(format => format.ext === 'mp4' || format.ext === 'webm').map(format => {
        const itag = extractItag(format.url);
        const quality = qualityMap[itag] || 'Unknown Quality';
        return {
          format: format.ext.toUpperCase(),
          quality: quality,
          url: format.url
        };
      });

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
        const itag = extractItag(format.url);
        const audioQuality = bitrate === 'Unknown' ? (qualityMap[itag] || 'Unknown Quality') : `${bitrate} kbps`;

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
      });

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
