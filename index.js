import express from 'express';
import { savefrom } from '@bochilteam/scraper-savefrom';

const app = express();
const PORT = process.env.PORT || 3000;

// iTag to Quality Mapping
const qualityMap = {
  // 🎬 Video + Audio
  5: '240p Both',
  6: '270p Both',
  17: '144p Both',
  18: '360p Both',
  22: '720p Both',
  34: '360p Both',
  35: '480p Both',
  36: '180p Both',
  37: '1080p Both',
  38: '3072p Both',
  43: '360p Both',
  44: '480p Both',
  45: '720p Both',
  46: '1080p Both',

  // 🎥 Video Only
  133: '240p Video',
  134: '360p Video',
  135: '480p Video',
  136: '720p Video',
  137: '1080p Video',
  138: '2160p Video',
  160: '144p Video',
  242: '240p Video',
  243: '360p Video',
  244: '480p Video',
  247: '720p Video',
  248: '1080p Video',
  271: '1440p Video',
  272: '2160p Video',
  278: '144p Video',
  313: '2160p Video',
  315: '2160p Video',
  298: '720p60 Video',
  299: '1080p60 Video',
  303: '1080p60 Video',
  308: '1440p60 Video',
  315: '2160p60 Video',
  394: '144p AV1',
  395: '240p AV1',
  396: '360p AV1',
  397: '480p AV1',
  398: '720p AV1',
  399: '1080p AV1',
  400: '1440p AV1',
  401: '2160p AV1',

  // 🔊 Audio Only
  139: '48kbps Audio',
  140: '128kbps Audio',
  141: '256kbps Audio',
  171: '128kbps Audio',
  172: '192kbps Audio',
  249: '50kbps Opus',
  250: '70kbps Opus',
  251: '160kbps Opus'
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
