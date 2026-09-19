import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import proxyHandler from './api/proxy.js';
import downloadHandler from './api/download.js';
import spotifyHandler from './api/spotify.js';
import youtubeHandler from './api/youtube.js';

function proxyApiPlugin() {
  return {
    name: 'proxy-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const parsedUrl = new URL(req.url, 'http://localhost');
        const pathname = parsedUrl.pathname;

        let handler = null;
        if (pathname === '/api/proxy') handler = proxyHandler;
        else if (pathname === '/api/download') handler = downloadHandler;
        else if (pathname === '/api/spotify') handler = spotifyHandler;
        else if (pathname === '/api/youtube') handler = youtubeHandler;

        if (!handler) {
          return next();
        }

        // Attach Express-like helpers to Node http.ServerResponse
        if (!res.status) {
          res.status = function (code) {
            this.statusCode = code;
            return this;
          };
        }
        if (!res.json) {
          res.json = function (data) {
            this.setHeader('Content-Type', 'application/json');
            this.end(JSON.stringify(data));
          };
        }

        // Attach parsed query parameters
        req.query = Object.fromEntries(parsedUrl.searchParams.entries());

        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.method === 'POST' || req.method === 'PUT') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              req.body = body ? JSON.parse(body) : {};
              await handler(req, res);
            } catch (e) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: e.message }));
            }
          });
          return;
        }

        // GET or other methods
        try {
          await handler(req, res);
        } catch (e) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: e.message }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), proxyApiPlugin()],
  server: {
    port: 5173,
    open: false,
  },
});
