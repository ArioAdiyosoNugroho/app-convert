/**
 * downloadFile.js
 * Utility untuk force-download file dari URL cross-origin.
 *
 * Strategy (waterfall):
 *  1. Direct fetch → Blob → Object URL → <a download>  (tanpa server, paling cepat)
 *  2. Via /api/download → streaming server-side download (untuk CORS yang strict)
 *  3. Via /api/proxy  → base64 decode → Blob  (fallback untuk file kecil-medium)
 *  4. window.open    → buka tab baru (last resort)
 */

const DOWNLOAD_ENDPOINT = '/api/download';
const PROXY_ENDPOINT = '/api/proxy';

/**
 * Derive a sane filename dari URL + content-type.
 * @param {string} url
 * @param {string} [contentType]
 * @param {string} [hint]  - label/quality hint dari UI (e.g. "720p", "HD Audio")
 * @returns {string}
 */
function guessFilename(url, contentType = '', hint = '') {
  const isImageHint = /cover|thumb|poster|image|picture|photo|jpg|jpeg|png|webp/i.test(hint);
  const isAudioHint = !isImageHint && /mp3|audio|sound|bitrate/i.test(hint);
  const isVideoHint = !isImageHint && /mp4|video|720p|1080p|360p|480p|hd|fhd|mkv|webm/i.test(hint);

  try {
    const path = new URL(url).pathname;
    const basename = path.split('/').pop().split('?')[0];
    const nameWithoutExt = basename.split('.')[0];
    const isGeneric =
      !nameWithoutExt ||
      /^(maxresdefault|hqdefault|mqdefault|default|download|videoplayback|stream|media|output|file|\d+)$/i.test(
        nameWithoutExt
      );

    if (
      !isGeneric &&
      basename &&
      /\.\w{2,5}$/.test(basename) &&
      !/\.(html?|php|aspx?|jsp)$/i.test(basename)
    ) {
      return decodeURIComponent(basename);
    }
  } catch (_) {
    // ignore
  }

  let ext = '';
  if (/image\/jpeg/.test(contentType) || (isImageHint && /jpe?g/i.test(hint))) ext = '.jpg';
  else if (/image\/png/.test(contentType) || (isImageHint && /png/i.test(hint))) ext = '.png';
  else if (/image\/webp/.test(contentType) || (isImageHint && /webp/i.test(hint))) ext = '.webp';
  else if (/image/.test(contentType) || isImageHint) ext = '.jpg';
  else if (/video/.test(contentType) || isVideoHint) ext = '.mp4';
  else if (/audio/.test(contentType) || isAudioHint) ext = '.mp3';
  else if (/pdf/.test(contentType)) ext = '.pdf';

  const slug = hint ? hint.replace(/[^a-z0-9]+/gi, '_').toLowerCase().replace(/^_+|_+$/g, '') : 'media';
  return `grabbl_${slug}${ext || (isAudioHint ? '.mp3' : isImageHint ? '.jpg' : '.mp4')}`;
}

/**
 * Trigger browser download dari Blob.
 * @param {Blob} blob
 * @param {string} filename
 */
function triggerBlobDownload(blob, filename) {
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoke setelah delay agar browser sempat mulai download
  setTimeout(() => URL.revokeObjectURL(objectUrl), 15000);
}

/**
 * Strategy 1: Via /api/download (streaming server-side download).
 * Server fetch ke URL target dan stream langsung ke browser.
 * Diperiksa status dan Content-Type agar tidak mendownload HTML/JSON error.
 */
async function fetchViaDownloadEndpoint(url, hint) {
  const filename = guessFilename(url, '', hint);
  const params = new URLSearchParams({ url, filename });

  const res = await fetch(`${DOWNLOAD_ENDPOINT}?${params.toString()}`, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!res.ok) {
    let msg = `Server returned HTTP ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson?.error) msg = errJson.error;
    } catch (_) {}
    throw new Error(msg);
  }

  const contentType = res.headers.get('content-type') || 'application/octet-stream';
  if (contentType.includes('text/html') || contentType.includes('application/json')) {
    throw new Error('Server returned an error page instead of media.');
  }

  const blob = await res.blob();
  if (blob.size < 10000 && (hint.toLowerCase().includes('mp3') || hint.toLowerCase().includes('audio') || hint.toLowerCase().includes('video'))) {
    throw new Error('Downloaded file is incomplete or corrupt (< 10 KB).');
  }

  return { blob, contentType };
}

/**
 * Strategy 2: Direct fetch (tanpa server).
 * Berhasil jika CDN punya CORS header yang mengizinkan.
 */
async function fetchDirect(url) {
  const res = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Direct HTTP ${res.status}`);
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/html') || contentType.includes('application/json')) {
    throw new Error('Direct target returned HTML page instead of binary media.');
  }
  const blob = await res.blob();
  if (blob.size < 10000 && (url.includes('.mp3') || url.includes('.mp4'))) {
    throw new Error('Downloaded direct file is too small or corrupt.');
  }
  return { blob, contentType };
}

/**
 * Strategy 3: Via /api/proxy (base64 decode).
 * Fallback jika streaming endpoint gagal. Cocok untuk file kecil-medium.
 */
async function fetchViaProxy(url) {
  const res = await fetch(PROXY_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, method: 'GET', responseType: 'arraybuffer' }),
  });
  if (!res.ok) throw new Error(`Proxy HTTP ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error);

  const contentType = json.headers?.['content-type'] || 'application/octet-stream';
  if (contentType.includes('text/html') || contentType.includes('application/json')) {
    throw new Error('Proxy returned HTML error page.');
  }

  let blob;
  if (json.encoding === 'base64' && json.data) {
    const binaryStr = atob(json.data);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    blob = new Blob([bytes], { type: contentType });
  } else {
    blob = new Blob([json.data || ''], { type: contentType });
  }

  if (blob.size < 1000 || (blob.size < 10000 && (/video/.test(contentType) || /audio/.test(contentType)))) {
    throw new Error('Proxy returned incomplete media.');
  }

  return { blob, contentType };
}

/**
 * Main export: Force-download file dari URL apapun.
 *
 * @param {string} url          - URL file yang ingin didownload
 * @param {string} [hint]       - Nama/label untuk filename (e.g. "720p", "HD Audio", atau track title)
 * @param {object} [callbacks]
 * @param {function} [callbacks.onStart]    - dipanggil saat download dimulai
 * @param {function} [callbacks.onSuccess]  - dipanggil saat download berhasil
 * @param {function} [callbacks.onFallback] - dipanggil saat fallback ke tab baru
 * @param {function} [callbacks.onError]    - dipanggil saat semua gagal
 */
export async function downloadFile(url, hint = '', callbacks = {}) {
  const { onStart, onSuccess, onFallback, onError } = callbacks;

  if (!url) {
    onError?.('No download URL provided.');
    return;
  }

  onStart?.();

  let lastError = null;

  // --- Strategy 1: Server-side stream via /api/download (with Content-Type & Size validation) ---
  try {
    const { blob, contentType } = await fetchViaDownloadEndpoint(url, hint);
    const filename = guessFilename(url, contentType, hint);
    triggerBlobDownload(blob, filename);
    onSuccess?.();
    return;
  } catch (err) {
    console.warn('[downloadFile] Server download endpoint failed:', err.message);
    lastError = err.message;
  }

  // --- Strategy 2: Direct fetch (CORS allowed CDN) ---
  try {
    const { blob, contentType } = await fetchDirect(url);
    const filename = guessFilename(url, contentType, hint);
    triggerBlobDownload(blob, filename);
    onSuccess?.();
    return;
  } catch (err) {
    console.warn('[downloadFile] Direct fetch failed:', err.message);
    lastError = lastError || err.message;
  }

  // --- Strategy 3: /api/proxy (base64 decode fallback) ---
  try {
    const { blob, contentType } = await fetchViaProxy(url);
    const filename = guessFilename(url, contentType, hint);
    triggerBlobDownload(blob, filename);
    onSuccess?.();
    return;
  } catch (err) {
    console.warn('[downloadFile] Proxy failed:', err.message);
    lastError = lastError || err.message;
  }

  // If all binary download methods failed, do not save a corrupt file!
  onError?.(lastError || 'Download failed. Upstream source may be unavailable.');
}
