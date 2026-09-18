/**
 * api/download.js
 * Endpoint khusus untuk stream file download ke browser.
 * Berbeda dengan proxy.js (yang untuk scraping JSON),
 * endpoint ini stream binary langsung sehingga:
 *  - Tidak perlu encode base64 (hemat memory)
 *  - Browser langsung mendownload file (Content-Disposition: attachment)
 *  - Support file besar tanpa buffer penuh di memory server
 */

const MAX_TIMEOUT_MS = 28000;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { url, filename } = req.query;

  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'Missing ?url= parameter' });
    return;
  }

  let targetUrl;
  try {
    targetUrl = new URL(url);
    if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') {
      throw new Error('Unsupported protocol');
    }
  } catch {
    res.status(400).json({ error: 'Invalid target URL' });
    return;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), MAX_TIMEOUT_MS);

  try {
    const upstream = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Grabbl/1.0)',
        'Accept': '*/*',
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: `Upstream returned ${upstream.status}` });
      return;
    }

    // Tentukan nama file untuk Content-Disposition
    let downloadName = filename || '';
    if (!downloadName) {
      try {
        const pathPart = new URL(url).pathname.split('/').pop().split('?')[0];
        if (pathPart && /\.\w{2,5}$/.test(pathPart)) {
          downloadName = decodeURIComponent(pathPart);
        }
      } catch (_) {}
    }

    // Content-Type dari upstream
    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    const contentLength = upstream.headers.get('content-length');

    // Auto-extension jika tidak ada nama file
    if (!downloadName) {
      let ext = '';
      if (/video/.test(contentType)) ext = '.mp4';
      else if (/audio/.test(contentType)) ext = '.mp3';
      else if (/jpeg/.test(contentType)) ext = '.jpg';
      else if (/png/.test(contentType)) ext = '.png';
      else if (/webp/.test(contentType)) ext = '.webp';
      downloadName = `grabbl_media${ext}`;
    }

    // Set response headers untuk trigger download
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
    if (contentLength) res.setHeader('Content-Length', contentLength);
    res.setHeader('Cache-Control', 'no-store');

    // Stream body langsung ke client
    const reader = upstream.body.getReader();
    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(Buffer.from(value));
      }
      res.end();
    };
    await pump();

  } catch (err) {
    clearTimeout(timeoutId);
    if (!res.headersSent) {
      const msg = err.name === 'AbortError' ? 'Download timed out.' : err.message || 'Download failed.';
      res.status(502).json({ error: msg });
    }
  }
}
