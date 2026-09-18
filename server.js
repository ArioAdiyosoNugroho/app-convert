import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import proxyHandler from './api/proxy.js';

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

// Serve built React assets
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback to index.html for SPA
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Grabbl running at http://localhost:${PORT}`);
});
