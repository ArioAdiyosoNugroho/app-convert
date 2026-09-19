/**
 * api/youtube.js
 * Dedicated server-side YouTube scraper endpoint.
 *
 * Kenapa perlu endpoint ini:
 *  - Di browser (Vercel), setiap scraperFetch() → /api/proxy → 1 Vercel invocation baru
 *  - YouTube butuh ~15+ request (oembed + convert + polling)
 *  - hub.convert1s.com memblock Cloudflare/datacenter IP, tapi ytmp3.mobi lebih permissive
 *  - Solusi: semua logic scraping dijalankan SEKALI di server, bukan per-request
 *
 * Endpoint ini menerima:  POST /api/youtube  { url, source }
 * Mengembalikan:          { status, result: { title, thumbnail, downloads, sourceUrl } }
 *                    atau { status: false, message }
 */

const CHROME_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

const MAX_DURATION_MS = 55000; // 55s total budget (Vercel limit 60s)

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ status: false, message: "Method not allowed" });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch {
      res.status(400).json({ status: false, message: "Invalid JSON" });
      return;
    }
  }

  const { url, source } = body || {};
  if (!url) {
    res.status(400).json({ status: false, message: "Missing url" });
    return;
  }

  // Extract video ID
  const videoMatch = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  );
  const videoId = videoMatch?.[1];
  if (!videoId) {
    res.status(400).json({ status: false, message: "Invalid YouTube URL" });
    return;
  }

  const deadline = Date.now() + MAX_DURATION_MS;
  const remaining = () => deadline - Date.now();

  // Helper: fetch with timeout
  async function doFetch(fetchUrl, options = {}, timeoutMs = 10000) {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), Math.min(timeoutMs, remaining()));
    try {
      const r = await fetch(fetchUrl, { ...options, signal: ctrl.signal });
      return r;
    } finally {
      clearTimeout(id);
    }
  }

  // --- Step 1: Get metadata (title + thumbnail) ---
  let title = "YouTube Video";
  let thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  try {
    const oRes = await doFetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      { headers: { "User-Agent": CHROME_UA } },
      5000
    );
    if (oRes.ok) {
      const oData = await oRes.json();
      title = oData.title || title;
      thumbnail = oData.thumbnail_url || thumbnail;
    }
  } catch (_) {}

  // --- Step 2: Try loader.to (Reliable audio converter) ---
  const downloads = [];

  if (remaining() > 5000) {
    try {
      const loaderAudio = await scrapeLoaderToAudio(videoId, doFetch, remaining);
      if (loaderAudio) {
        downloads.push({
          type: "MP3 320kbps",
          quality: "320kbps Audio",
          isAudio: true,
          format: "mp3",
          url: loaderAudio,
        });
      }
    } catch (err) {
      console.warn("[loader.to] Failed:", err.message);
    }
  }

  // --- Step 3: Try ytmp3.mobi ---
  if (downloads.length === 0 && remaining() > 5000) {
    try {
      downloads.push(...(await scrapeYtmp3Mobi(videoId, doFetch, remaining)));
    } catch (err) {
      console.warn("[ytmp3.mobi] Failed:", err.message);
    }
  }

  // --- Step 4: Fallback ke convert1s jika mobi gagal dan masih ada waktu ---
  if (downloads.length === 0 && remaining() > 8000) {
    try {
      downloads.push(...(await scrapeConvert1s(url, videoId, doFetch, remaining)));
    } catch (err) {
      console.warn("[convert1s] Failed:", err.message);
    }
  }

  if (downloads.length === 0) {
    res.status(200).json({
      status: false,
      message: "Could not extract YouTube download links. The conversion service may be busy. Please try again in a moment.",
    });
    return;
  }

  res.status(200).json({
    status: true,
    result: {
      title,
      thumbnail,
      downloads,
      sourceUrl: url,
    },
  });
}

// ─── ytmp3.mobi scraper ───────────────────────────────────────────────────────
async function scrapeYtmp3Mobi(videoId, doFetch, remaining) {
  const headers = {
    Origin: "https://ytmp3.mobi",
    Referer: "https://ytmp3.mobi/",
    "User-Agent": CHROME_UA,
    Accept: "application/json, text/plain, */*",
  };

  // Init
  const initRes = await doFetch(
    "https://a.ymcdn.org/api/v1/init?p=y%2623=1llum1n471",
    { headers },
    8000
  );
  if (!initRes.ok) throw new Error("Init failed: " + initRes.status);
  const initData = await initRes.json();
  if (!initData?.convertURL) throw new Error("No convertURL");

  const fetchSingle = async (format) => {
    if (remaining() < 3000) return null;
    const convRes = await doFetch(
      `${initData.convertURL}&v=${videoId}&f=${format}`,
      { headers },
      8000
    );
    if (!convRes.ok) return null;
    const convData = await convRes.json();
    if (!convData || convData.error) return null;

    let dlUrl = convData.downloadURL;
    const progUrl = convData.progressURL;
    let progress = 0;
    let attempts = 0;

    // Poll — maks 8 attempts × 1200ms = 9.6s
    while (progress < 3 && attempts < 8 && remaining() > 2000) {
      await sleep(1200);
      if (remaining() < 1500) break;
      const progRes = await doFetch(progUrl, { headers }, 5000).catch(() => null);
      if (!progRes?.ok) break;
      const progData = await progRes.json().catch(() => null);
      if (!progData) break;
      progress = progData.progress ?? 0;
      if (progData.downloadURL) dlUrl = progData.downloadURL;
      if (progress >= 3) break;
      attempts++;
    }

    if (!dlUrl || progress < 3) return null;
    if (dlUrl.startsWith("//")) dlUrl = "https:" + dlUrl;
    if (dlUrl.startsWith("/")) dlUrl = "https://ytmp3.mobi" + dlUrl;
    return dlUrl;
  };

  // Fetch MP4 dan MP3 secara bersamaan
  const [mp4Url, mp3Url] = await Promise.all([
    fetchSingle("mp4").catch(() => null),
    fetchSingle("mp3").catch(() => null),
  ]);

  const results = [];
  if (mp4Url) results.push({ type: "MP4 720p", quality: "720p", url: mp4Url });
  if (mp3Url) results.push({ type: "MP3", quality: "MP3", isAudio: true, url: mp3Url });
  return results;
}

// ─── convert1s (ytmp3.gg) scraper ────────────────────────────────────────────
async function scrapeConvert1s(url, videoId, doFetch, remaining) {
  const headers = {
    Origin: "https://media.ytmp3.gg",
    Referer: "https://media.ytmp3.gg/",
    "User-Agent": CHROME_UA,
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json",
  };

  const runConvert = async (format, quality) => {
    if (remaining() < 5000) return null;
    const convRes = await doFetch(
      "https://hub.convert1s.com/api/download",
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          url: `https://www.youtube.com/watch?v=${videoId}`,
          os: "macos",
          output: {
            type: format === "mp4" ? "video" : "audio",
            format,
            quality,
          },
          audio: { bitrate: "128k" },
        }),
      },
      10000
    );
    if (!convRes.ok) return null;

    let conv;
    try {
      const text = await convRes.text();
      if (text.trim().startsWith("<")) return null;
      conv = JSON.parse(text);
    } catch { return null; }

    if (!conv?.statusUrl) return null;

    let downloadUrl = null;
    let attempts = 0;
    // Poll — maks 10 attempts × 1000ms = 10s
    while (!downloadUrl && attempts < 10 && remaining() > 2000) {
      await sleep(1000);
      if (remaining() < 1500) break;
      const pollRes = await doFetch(conv.statusUrl, { headers: { "User-Agent": CHROME_UA, Origin: "https://media.ytmp3.gg" } }, 5000).catch(() => null);
      if (!pollRes?.ok) break;
      const pollData = await pollRes.json().catch(() => null);
      if (!pollData) break;
      if (pollData.status === "completed" && pollData.downloadUrl) {
        downloadUrl = pollData.downloadUrl;
        break;
      }
      if (pollData.status === "error" || pollData.status === "failed") break;
      attempts++;
    }

    return downloadUrl ? { url: downloadUrl, quality: conv.selectedQuality || quality } : null;
  };

  const [r1080, r720] = await Promise.all([
    runConvert("mp4", "1080p").catch(() => null),
    runConvert("mp4", "720p").catch(() => null),
  ]);

  const results = [];
  if (r1080?.url) results.push({ type: "MP4 1080p", quality: "1080p", url: r1080.url });
  if (r720?.url) results.push({ type: "MP4 720p", quality: "720p", url: r720.url });

  if (results.length === 0 && remaining() > 6000) {
    const r360 = await runConvert("mp4", "360p").catch(() => null);
    if (r360?.url) results.push({ type: "MP4 360p", quality: "360p", url: r360.url });
  }

  if (remaining() > 5000) {
    const mp3 = await runConvert("mp3", "").catch(() => null);
    if (mp3?.url) results.push({ type: "MP3", quality: "MP3", isAudio: true, url: mp3.url });
  }

  return results;
}

// ─── loader.to MP3 Scraper Helper (Primary & Reliable) ─────────────────────────
async function scrapeLoaderToAudio(videoId, doFetch, remaining) {
  const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const initRes = await doFetch(
    `https://loader.to/ajax/download.php?format=mp3&url=${encodeURIComponent(ytUrl)}`,
    {
      headers: {
        "User-Agent": CHROME_UA,
        Accept: "application/json, text/plain, */*",
      },
    },
    10000
  );
  if (!initRes.ok) throw new Error("Loader.to init HTTP " + initRes.status);
  const initData = await initRes.json();
  if (!initData || !initData.success) throw new Error("Loader.to init returned unsuccessful");

  let dlUrl = initData.download_url || initData.url;
  const progUrl = initData.progress_url;
  if (dlUrl) return dlUrl;
  if (!progUrl) throw new Error("No progress URL from loader.to");

  let attempts = 0;
  while (attempts < 16 && remaining() > 2500) {
    await sleep(1200);
    if (remaining() < 2000) break;
    const progRes = await doFetch(progUrl, { headers: { "User-Agent": CHROME_UA } }, 5000).catch(() => null);
    if (!progRes?.ok) {
      attempts++;
      continue;
    }
    const progData = await progRes.json().catch(() => null);
    if (progData?.download_url) {
      return progData.download_url;
    }
    attempts++;
  }

  return null;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
