import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import proxyHandler from './api/proxy.js';
import downloadHandler from './api/download.js';
import spotifyHandler from './api/spotify.js';
import youtubeHandler from './api/youtube.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS Proxy route for scraping
app.all('/api/proxy', async (req, res) => {
  try {
    await proxyHandler(req, res);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Direct media streaming download endpoint
app.all('/api/download', async (req, res) => {
  try {
    await downloadHandler(req, res);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Spotify scraper & MP3 generator
app.all('/api/spotify', async (req, res) => {
  try {
    await spotifyHandler(req, res);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// YouTube scraper & MP3 generator
app.all('/api/youtube', async (req, res) => {
  try {
    await youtubeHandler(req, res);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Serve built React assets
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback to index.html for SPA
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Grabbl running at http://localhost:${PORT}`);
});
