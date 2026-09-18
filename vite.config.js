import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import proxyHandler from './src/api/proxy.js';

function proxyApiPlugin() {
  return {
    name: 'proxy-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/proxy') {
          if (req.method === 'OPTIONS') {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            res.statusCode = 204;
            res.end();
            return;
          }
          if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', async () => {
              try {
                req.body = body ? JSON.parse(body) : {};
                await proxyHandler(req, res);
              } catch (e) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: e.message }));
              }
            });
            return;
          }
        }
        next();
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
