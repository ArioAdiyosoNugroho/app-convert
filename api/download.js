/**
 * api/download.js
 * Endpoint khusus untuk stream file download ke browser.
 * Berbeda dengan proxy.js (yang untuk scraping JSON),
 * endpoint ini stream binary langsung sehingga:
 *  - Tidak perlu encode base64 (hemat memory)
 *  - Browser langsung mendownload file (Content-Disposition: attachment)
 *  - Support file besar tanpa buffer penuh di memory server
 */

const MAX_TIMEOUT_MS = 60000;
const CHROME_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

export default async function handler(req, res) {
  const setStatus = (code) => {
    if (res.status) res.status(code);
    else res.statusCode = code;
    return res;
  };

  const sendJson = (data) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    setStatus(204);
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    setStatus(405);
    sendJson({ error: 'Method not allowed' });
    return;
  }

  let url = req.query?.url;
  let filename = req.query?.filename;
  if (!url && req.url) {
    try {
      const parsedUrl = new URL(req.url, 'http://localhost');
      url = parsedUrl.searchParams.get('url');
      filename = filename || parsedUrl.searchParams.get('filename');
    } catch (_) {}
  }

  if (!url || typeof url !== 'string') {
    setStatus(400);
    sendJson({ error: 'Missing ?url= parameter' });
    return;
  }

  let targetUrl;
  try {
    targetUrl = new URL(url);
    if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') {
      throw new Error('Unsupported protocol');
    }
  } catch {
    setStatus(400);
    sendJson({ error: 'Invalid target URL' });
    return;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), MAX_TIMEOUT_MS);

  try {
    const upstream = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': CHROME_UA,
        'Accept': '*/*',
        'Referer': targetUrl.origin + '/',
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    if (!upstream.ok) {
      setStatus(upstream.status);
      sendJson({ error: `Upstream returned ${upstream.status}` });
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
      setStatus(502);
      sendJson({ error: msg });
    }
  }
}
