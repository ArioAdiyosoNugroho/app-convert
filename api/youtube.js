/**
 * api/youtube.js
 * Dedicated server-side YouTube scraper endpoint.
 *
 * Provides:
 *  - MP4 Video downloads (1080p / 720p / 360p)
 *  - MP3 Audio download (High Quality Audio)
 *  - Cover Art [HD] download (High Resolution Thumbnail JPG)
 *
 * Strategy:
 *  - Primary server: ytmp3.mobi or ytmp3.gg (convert1s) based on user selection
 *  - Automatic fallback between servers if one is blocked or fails
 *  - Fallback to loader.to for direct video/audio muxing
 *  - Always extracts high-res cover (maxresdefault.jpg / hqdefault.jpg)
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
    try {
      body = JSON.parse(body);
    } catch {
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
    const id = setTimeout(() => ctrl.abort(), Math.min(timeoutMs, Math.max(1000, remaining())));
    try {
      const r = await fetch(fetchUrl, { ...options, signal: ctrl.signal });
      return r;
    } finally {
      clearTimeout(id);
    }
  }

  // Helper sleep
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // --- Step 1: Get metadata (title + high-res thumbnail) ---
  let title = "YouTube Video";
  let thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  try {
    const oRes = await doFetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      { headers: { "User-Agent": CHROME_UA } },
      5000
    );
    if (oRes && oRes.ok) {
      const oData = await oRes.json();
      title = oData.title || title;
      thumbnail = oData.thumbnail_url || thumbnail;
    }
  } catch (_) {}

  // Check if maxresdefault.jpg exists for best HD thumbnail
  let coverUrl = thumbnail;
  try {
    const maxResCheck = await doFetch(
      `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
      { method: "HEAD" },
      2500
    );
    if (maxResCheck && maxResCheck.ok) {
      coverUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
      thumbnail = coverUrl;
    }
  } catch (_) {}

  // ─── Scraper 1: ytmp3.mobi (Fast & Stable MP4 720p + MP3) ───────────────────
  async function scrapeYtmp3Mobi() {
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
    if (!initRes || !initRes.ok) throw new Error("ytmp3.mobi init failed");
    const initData = await initRes.json();
    if (!initData?.convertURL) throw new Error("No convertURL from ytmp3.mobi");

    const fetchSingle = async (format) => {
      if (remaining() < 3000) return null;
      const convRes = await doFetch(
        `${initData.convertURL}&v=${videoId}&f=${format}`,
        { headers },
        8000
      );
      if (!convRes || !convRes.ok) return null;
      const convData = await convRes.json().catch(() => null);
      if (!convData || convData.error) return null;

      let dlUrl = convData.downloadURL;
      const progUrl = convData.progressURL;
      let progress = 0;
      let attempts = 0;

      while (progress < 3 && attempts < 8 && remaining() > 2000) {
        await sleep(1000);
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

    const [mp4Url, mp3Url] = await Promise.all([
      fetchSingle("mp4").catch(() => null),
      fetchSingle("mp3").catch(() => null),
    ]);

    const results = [];
    if (mp4Url) {
      results.push({
        type: "MP4 Video (720p HD)",
        quality: "720p HD",
        format: "mp4",
        url: mp4Url,
      });
    }
    if (mp3Url) {
      results.push({
        type: "MP3 Audio (128kbps)",
        quality: "128kbps Audio",
        isAudio: true,
        format: "mp3",
        url: mp3Url,
      });
    }
    return results;
  }

  // ─── Scraper 2: convert1s (ytmp3.gg - Multi Resolution MP4 + MP3) ────────────
  async function scrapeConvert1s() {
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
      if (!convRes || !convRes.ok) return null;

      let conv;
      try {
        const text = await convRes.text();
        if (text.trim().startsWith("<")) return null;
        conv = JSON.parse(text);
      } catch {
        return null;
      }
      if (!conv?.statusUrl) return null;

      let downloadUrl = null;
      let attempts = 0;
      while (!downloadUrl && attempts < 8 && remaining() > 2000) {
        await sleep(1000);
        if (remaining() < 1500) break;
        const pollRes = await doFetch(
          conv.statusUrl,
          { headers: { "User-Agent": CHROME_UA, Origin: "https://media.ytmp3.gg" } },
          5000
        ).catch(() => null);
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

    const [r1080, r720, mp3] = await Promise.all([
      runConvert("mp4", "1080p").catch(() => null),
      runConvert("mp4", "720p").catch(() => null),
      runConvert("mp3", "").catch(() => null),
    ]);

    const results = [];
    if (r1080?.url) {
      results.push({
        type: "MP4 Video (1080p FHD)",
        quality: "1080p Full HD",
        format: "mp4",
        url: r1080.url,
      });
    }
    if (r720?.url) {
      results.push({
        type: "MP4 Video (720p HD)",
        quality: "720p HD",
        format: "mp4",
        url: r720.url,
      });
    }
    if (mp3?.url) {
      results.push({
        type: "MP3 Audio (128kbps)",
        quality: "128kbps Audio",
        isAudio: true,
        format: "mp3",
        url: mp3.url,
      });
    }

    if (results.length === 0 && remaining() > 6000) {
      const r360 = await runConvert("mp4", "360p").catch(() => null);
      if (r360?.url) {
        results.push({
          type: "MP4 Video (360p SD)",
          quality: "360p SD",
          format: "mp4",
          url: r360.url,
        });
      }
    }

    return results;
  }

  // ─── Scraper 3: loader.to (Universal fallback for MP4 & MP3) ────────────────
  async function scrapeLoaderTo(format) {
    const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const initRes = await doFetch(
      `https://loader.to/ajax/download.php?format=${format}&url=${encodeURIComponent(ytUrl)}`,
      {
        headers: {
          "User-Agent": CHROME_UA,
          Accept: "application/json, text/plain, */*",
        },
      },
      10000
    );
    if (!initRes || !initRes.ok) return null;
    const initData = await initRes.json().catch(() => null);
    if (!initData || !initData.success) return null;

    let dlUrl = initData.download_url || initData.url;
    const progUrl = initData.progress_url;
    if (dlUrl) return dlUrl;
    if (!progUrl) return null;

    let attempts = 0;
    while (attempts < 16 && remaining() > 2500) {
      await sleep(1200);
      if (remaining() < 2000) break;
      const progRes = await doFetch(
        progUrl,
        { headers: { "User-Agent": CHROME_UA } },
        5000
      ).catch(() => null);
      if (!progRes?.ok) {
        attempts++;
        continue;
      }
      const progData = await progRes.json().catch(() => null);
      if (progData?.download_url) {
        return progData.download_url;
      }
      if (progData?.progress >= 1000 && !progData?.download_url) break;
      attempts++;
    }
    return null;
  }

  // ─── Execute scraping pipeline ──────────────────────────────────────────────
  const downloads = [];

  if (source === "gg") {
    // User explicitly chose Server 1 (YTMP3.gg / convert1s)
    try {
      const ggRes = await scrapeConvert1s();
      if (ggRes && ggRes.length > 0) {
        downloads.push(...ggRes);
      }
    } catch (err) {
      console.warn("[convert1s] Failed:", err.message);
    }

    // Check if we got at least one video and one audio
    const hasVideo = downloads.some((d) => !d.isAudio && !d.isImage);
    const hasAudio = downloads.some((d) => d.isAudio);

    // If convert1s was blocked or incomplete, fall back to ytmp3.mobi
    if ((!hasVideo || !hasAudio) && remaining() > 5000) {
      try {
        const mobiRes = await scrapeYtmp3Mobi();
        for (const item of mobiRes) {
          if (item.isAudio && !hasAudio) {
            downloads.push(item);
          } else if (!item.isAudio && !hasVideo) {
            downloads.push(item);
          }
        }
      } catch (err) {
        console.warn("[ytmp3.mobi fallback] Failed:", err.message);
      }
    }
  } else {
    // Default or source === "mobi" (Server 2: YTMP3.mobi - Fast & Stable)
    try {
      const mobiRes = await scrapeYtmp3Mobi();
      if (mobiRes && mobiRes.length > 0) {
        downloads.push(...mobiRes);
      }
    } catch (err) {
      console.warn("[ytmp3.mobi] Failed:", err.message);
    }

    // If mobi failed, try convert1s
    const hasVideo = downloads.some((d) => !d.isAudio && !d.isImage);
    const hasAudio = downloads.some((d) => d.isAudio);
    if ((!hasVideo || !hasAudio) && remaining() > 8000) {
      try {
        const ggRes = await scrapeConvert1s();
        for (const item of ggRes) {
          if (item.isAudio && !hasAudio) {
            downloads.push(item);
          } else if (!item.isAudio && !hasVideo) {
            downloads.push(item);
          }
        }
      } catch (err) {
        console.warn("[convert1s fallback] Failed:", err.message);
      }
    }
  }

  // ─── Ultimate Fallback: loader.to for missing video or audio ────────────────
  const hasVideoFinal = downloads.some((d) => !d.isAudio && !d.isImage);
  const hasAudioFinal = downloads.some((d) => d.isAudio);

  if (!hasVideoFinal && remaining() > 7000) {
    try {
      const l720 = await scrapeLoaderTo("720");
      if (l720) {
        downloads.push({
          type: "MP4 Video (720p HD)",
          quality: "720p HD",
          format: "mp4",
          url: l720,
        });
      }
    } catch (err) {
      console.warn("[loader.to 720] Failed:", err.message);
    }
  }

  if (!hasAudioFinal && remaining() > 5000) {
    try {
      const lmp3 = await scrapeLoaderTo("mp3");
      if (lmp3) {
        downloads.push({
          type: "MP3 Audio (320kbps)",
          quality: "320kbps High Quality",
          isAudio: true,
          format: "mp3",
          url: lmp3,
        });
      }
    } catch (err) {
      console.warn("[loader.to mp3] Failed:", err.message);
    }
  }

  // ─── Always add Cover Image download ────────────────────────────────────────
  downloads.push({
    type: "Cover [HD]",
    quality: "Cover Art (HD)",
    format: "jpg",
    ext: "jpg",
    isImage: true,
    url: coverUrl,
  });

  // ─── Sort downloads: Videos first (highest res first), then Audio, then Cover ──
  downloads.sort((a, b) => {
    const getScore = (item) => {
      if (item.isImage || item.type?.toLowerCase().includes("cover")) return 3;
      if (item.isAudio || item.format === "mp3") return 2;
      return 1; // video
    };
    const scoreDiff = getScore(a) - getScore(b);
    if (scoreDiff !== 0) return scoreDiff;

    // Inside videos: sort 1080p > 720p > 360p
    const resA = parseInt(a.quality?.match(/\d+/)?.[0] || "0", 10);
    const resB = parseInt(b.quality?.match(/\d+/)?.[0] || "0", 10);
    return resB - resA;
  });

  if (downloads.length === 1 && downloads[0].isImage) {
    // Only cover found, no video or audio could be extracted
    res.status(200).json({
      status: false,
      message:
        "Could not extract YouTube video or audio download links right now. Upstream services may be busy. Please try another server or try again shortly.",
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
