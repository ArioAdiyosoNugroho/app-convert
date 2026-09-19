/**
 * api/spotify.js
 * Dedicated server-side Spotify scraper & downloader endpoint.
 *
 * Extracts Spotify track/album metadata via Spotify oEmbed,
 * matches track with high-fidelity audio on YouTube, and generates
 * direct MP3 download URLs (audio/mpeg) via ytmp3 converter engine.
 */

const CHROME_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

const MAX_DURATION_MS = 55000;

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
    try {
      body = JSON.parse(body);
    } catch {
      res.status(400).json({ status: false, message: "Invalid JSON" });
      return;
    }
  }

  const { url } = body || {};
  if (!url) {
    res.status(400).json({ status: false, message: "Missing url parameter" });
    return;
  }

  const deadline = Date.now() + MAX_DURATION_MS;
  const remaining = () => deadline - Date.now();

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

  try {
    // 1. Extract Spotify Track / Album Metadata via oEmbed
    let title = "Spotify Track";
    let thumbnail = "https://open.spotify.com/favicon.ico";

    try {
      const oRes = await doFetch(
        `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`,
        { headers: { "User-Agent": CHROME_UA } },
        6000
      );
      if (oRes.ok) {
        const oData = await oRes.json();
        title = oData.title || title;
        thumbnail = oData.thumbnail_url || thumbnail;
      }
    } catch (_) {}

    // 2. Search YouTube for matching track audio
    const searchQuery = `${title} audio`;
    const searchRes = await doFetch(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`,
      { headers: { "User-Agent": CHROME_UA } },
      8000
    );

    let videoId = null;
    if (searchRes.ok) {
      const html = await searchRes.text();
      const match = html.match(/"videoId":"([^"]{11})"/);
      if (match && match[1]) {
        videoId = match[1];
      }
    }

    if (!videoId) {
      res.status(404).json({
        status: false,
        message: "Could not find matching audio for this Spotify track.",
      });
      return;
    }

    // 3. Convert YouTube Video to Direct MP3 (loader.to as primary, with fallbacks)
    let mp3Url = null;
    try {
      mp3Url = await scrapeLoaderToAudio(videoId, doFetch, remaining);
    } catch (e) {
      console.warn("[Spotify API] loader.to error:", e.message);
    }

    if (!mp3Url && remaining() > 8000) {
      try {
        mp3Url = await scrapeYtmp3MobiAudio(videoId, doFetch, remaining);
      } catch (e) {
        console.warn("[Spotify API] ytmp3.mobi error:", e.message);
      }
    }

    if (!mp3Url && remaining() > 8000) {
      try {
        mp3Url = await scrapeConvert1sAudio(videoId, doFetch, remaining);
      } catch (e) {
        console.warn("[Spotify API] convert1s error:", e.message);
      }
    }

    if (!mp3Url) {
      res.status(500).json({
        status: false,
        message: "Failed to generate MP3 download link. Please try again.",
      });
      return;
    }

    const downloads = [
      {
        type: `${title} [MP3]`,
        quality: "320kbps MP3 Audio",
        isAudio: true,
        format: "mp3",
        url: mp3Url,
      },
    ];

    if (thumbnail && thumbnail.startsWith("http")) {
      downloads.push({
        type: "Cover Art (HD Image)",
        quality: "HD Cover Image",
        isAudio: false,
        isImage: true,
        format: "jpg",
        url: thumbnail,
      });
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
  } catch (err) {
    res.status(500).json({
      status: false,
      message: err.message || "Error processing Spotify link.",
    });
  }
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

// ─── ytmp3.mobi MP3 Scraper Helper (Fallback) ──────────────────────────────────
async function scrapeYtmp3MobiAudio(videoId, doFetch, remaining) {
  const headers = {
    Origin: "https://ytmp3.mobi",
    Referer: "https://ytmp3.mobi/",
    "User-Agent": CHROME_UA,
    Accept: "application/json, text/plain, */*",
  };

  const initRes = await doFetch(
    "https://a.ymcdn.org/api/v1/init?p=y%2623=1llum1n471",
    { headers },
    8000
  );
  if (!initRes.ok) throw new Error("Init failed: " + initRes.status);
  const initData = await initRes.json();
  if (!initData?.convertURL) throw new Error("No convertURL");

  const convRes = await doFetch(
    `${initData.convertURL}&v=${videoId}&f=mp3`,
    { headers },
    8000
  );
  if (!convRes.ok) throw new Error("Convert failed: " + convRes.status);
  const convData = await convRes.json();
  if (!convData || convData.error) throw new Error("Convert returned error");

  let dlUrl = convData.downloadURL;
  if (dlUrl) {
    if (dlUrl.startsWith("//")) dlUrl = "https:" + dlUrl;
    if (dlUrl.startsWith("/")) dlUrl = "https://ytmp3.mobi" + dlUrl;
    return dlUrl;
  }

  const progUrl = convData.progressURL;
  let progress = 0;
  let attempts = 0;

  while (progress < 3 && attempts < 8 && remaining() > 2000) {
    await sleep(800);
    if (remaining() < 1500) break;
    const progRes = await doFetch(progUrl, { headers }, 4000).catch(() => null);
    if (!progRes?.ok) break;
    const progData = await progRes.json().catch(() => null);
    if (!progData) break;
    progress = progData.progress ?? 0;
    if (progData.downloadURL) dlUrl = progData.downloadURL;
    if (progress >= 3 || dlUrl) break;
    attempts++;
  }

  if (!dlUrl) throw new Error("No download URL from ytmp3.mobi");
  if (dlUrl.startsWith("//")) dlUrl = "https:" + dlUrl;
  if (dlUrl.startsWith("/")) dlUrl = "https://ytmp3.mobi" + dlUrl;

  return dlUrl;
}

// ─── convert1s MP3 Scraper Helper (Fallback) ───────────────────────────────────
async function scrapeConvert1sAudio(videoId, doFetch, remaining) {
  const headers = {
    Origin: "https://media.ytmp3.gg",
    Referer: "https://media.ytmp3.gg/",
    "User-Agent": CHROME_UA,
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json",
  };

  const convRes = await doFetch(
    "https://hub.convert1s.com/api/download",
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        url: `https://www.youtube.com/watch?v=${videoId}`,
        os: "macos",
        output: { type: "audio", format: "mp3", quality: "" },
        audio: { bitrate: "320k" },
      }),
    },
    10000
  );
  if (!convRes.ok) throw new Error("convert1s failed: " + convRes.status);
  const conv = await convRes.json();
  if (!conv?.statusUrl) throw new Error("No statusUrl from convert1s");

  let downloadUrl = null;
  let attempts = 0;

  while (!downloadUrl && attempts < 10 && remaining() > 2000) {
    await sleep(1000);
    if (remaining() < 1500) break;
    const pollRes = await doFetch(conv.statusUrl, { headers }, 5000).catch(() => null);
    if (!pollRes?.ok) break;
    const pollData = await pollRes.json().catch(() => null);
    if (pollData?.status === "completed" && pollData?.downloadUrl) {
      downloadUrl = pollData.downloadUrl;
      break;
    }
    if (pollData?.status === "error" || pollData?.status === "failed") break;
    attempts++;
  }

  return downloadUrl;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
