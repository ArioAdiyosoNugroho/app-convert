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
  try {
    const path = new URL(url).pathname;
    const basename = path.split('/').pop().split('?')[0];
    if (basename && /\.\w{2,5}$/.test(basename)) {
      return decodeURIComponent(basename);
    }
  } catch (_) {
    // ignore
  }

  let ext = '';
  if (/video/.test(contentType)) ext = '.mp4';
  else if (/audio/.test(contentType)) ext = '.mp3';
  else if (/image\/jpeg/.test(contentType)) ext = '.jpg';
  else if (/image\/png/.test(contentType)) ext = '.png';
  else if (/image\/webp/.test(contentType)) ext = '.webp';
  else if (/pdf/.test(contentType)) ext = '.pdf';

  const slug = hint ? hint.replace(/[^a-z0-9]+/gi, '_').toLowerCase() : 'media';
  return `grabbl_${slug}${ext || ''}`;
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
 * Strategy 1: Direct fetch (tanpa server).
 * Berhasil jika CDN punya CORS header yang mengizinkan.
 */
async function fetchDirect(url) {
  const res = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const contentType = res.headers.get('content-type') || '';
  const blob = await res.blob();
  return { blob, contentType };
}

/**
 * Strategy 2: Via /api/download (streaming server-side).
 * Server fetch ke URL target dan stream langsung ke browser.
 * Lebih efisien untuk file besar (no base64 overhead).
 */
async function fetchViaDownloadEndpoint(url, hint) {
  const params = new URLSearchParams({ url });
  if (hint) params.set('filename', `grabbl_${hint.replace(/[^a-z0-9]+/gi, '_').toLowerCase()}`);

  const res = await fetch(`${DOWNLOAD_ENDPOINT}?${params.toString()}`, {
    method: 'GET',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Download endpoint HTTP ${res.status}`);
  const contentType = res.headers.get('content-type') || 'application/octet-stream';
  const blob = await res.blob();
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

  return { blob, contentType };
}

/**
 * Main export: Force-download file dari URL apapun.
 *
 * @param {string} url          - URL file yang ingin didownload
 * @param {string} [hint]       - Nama/label untuk filename (e.g. "720p", "HD Audio")
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

  // --- Strategy 1: Direct fetch (tanpa server) ---
  try {
    const { blob, contentType } = await fetchDirect(url);
    const filename = guessFilename(url, contentType, hint);
    triggerBlobDownload(blob, filename);
    onSuccess?.();
    return;
  } catch (err) {
    console.warn('[downloadFile] Direct fetch failed:', err.message);
  }

  // --- Strategy 2: /api/download (streaming server-side) ---
  try {
    const { blob, contentType } = await fetchViaDownloadEndpoint(url, hint);
    const filename = guessFilename(url, contentType, hint);
    triggerBlobDownload(blob, filename);
    onSuccess?.();
    return;
  } catch (err) {
    console.warn('[downloadFile] Download endpoint failed:', err.message);
  }

  // --- Strategy 3: /api/proxy (base64 decode, file kecil-medium) ---
  try {
    const { blob, contentType } = await fetchViaProxy(url);
    const filename = guessFilename(url, contentType, hint);
    triggerBlobDownload(blob, filename);
    onSuccess?.();
    return;
  } catch (err) {
    console.warn('[downloadFile] Proxy failed, opening tab:', err.message);
  }

  // --- Strategy 4: Fallback (window.open) ---
  try {
    window.open(url, '_blank', 'noopener,noreferrer');
    onFallback?.();
  } catch (err) {
    onError?.(err.message || 'Download failed.');
  }
}
