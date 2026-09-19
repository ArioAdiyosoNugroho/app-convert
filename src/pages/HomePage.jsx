import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import ResultCard from '../components/ResultCard';
import ConvertProgress from '../components/ConvertProgress';
import ServerSelectModal from '../components/ServerSelectModal';
import BatchModal from '../components/BatchModal';
import { downloadFile } from '../utils/downloadFile';

import {
  setTikTokSource,
  scrapeTikTok,
  setInstagramSource,
  scrapeInstagram,
  setYouTubeSource,
  scrapeYouTube,
  setTwitterSource,
  scrapeTwitter,
  setSpotifySource,
  scrapeSpotify,
  scrapePinterest,
  scrapeAppleMusic,
  scrapeFacebook,
  scrapeRedNote,
  scrapeDouyin,
  scrapeBilibili,
  scrapeThreads,
  scrapeBandcamp,
  scrapePixiv,
} from '../scrapers/index.js';

export default function HomePage({ isDesktop }) {
  const { t, preferServer, history, addToHistory, totalDownloads, showToast, setActivePage } = useApp();

  const [url, setUrl] = useState(''); // full URL untuk analisis
  const [batchText, setBatchText] = useState('');
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const inputRef = useRef(null);

  // Potong URL untuk display di input — analisis tetap pakai url state (full)
  const shortenForDisplay = (rawUrl) => {
    if (!rawUrl) return '';
    try {
      const u = new URL(rawUrl.trim());
      const short = u.hostname + u.pathname;
      return short.length > 48 ? short.slice(0, 48) + '...' : short;
    } catch {
      return rawUrl.length > 48 ? rawUrl.slice(0, 48) + '...' : rawUrl;
    }
  };

  // Set tampilan input via DOM (uncontrolled) — tidak trigger overflow
  const setInputDisplay = (rawUrl) => {
    if (inputRef.current) {
      inputRef.current.value = shortenForDisplay(rawUrl);
      inputRef.current.scrollLeft = 0;
    }
  };

  // Server selection modal state
  const [serverModal, setServerModal] = useState({
    isOpen: false,
    platform: '',
    url: '',
    options: null,
  });

  // Batch modal state
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchItems, setBatchItems] = useState([]);

  // Scrape single URL dispatcher
  const performScrape = async (targetUrl, forcedSource = null) => {
    const trimmed = targetUrl.trim();
    if (!trimmed) {
      showToast(t('toast-paste-first', 'Please paste a valid URL first'), 'error');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      let data = null;

      if (trimmed.includes('tiktok.com')) {
        if (forcedSource) setTikTokSource(forcedSource);
        else if (preferServer === 'server1') setTikTokSource('tiktokio');
        else if (preferServer === 'server2') setTikTokSource('snaptik');
        else setTikTokSource(null);

        data = await scrapeTikTok(trimmed);

        if (data && data.requireSource) {
          setServerModal({
            isOpen: true,
            platform: 'tiktok',
            url: trimmed,
            options: {
              title: t('label-choose-server', 'Choose Server'),
              message: 'Server 1: TikTokIO (HD Video · MP3 · Photo Slideshow)\nServer 2: SnapTik (720p Video · Photo Slideshow)',
              server1Id: 'tiktokio',
              server1Label: 'SERVER 1',
              server2Id: 'snaptik',
              server2Label: 'SERVER 2',
            },
          });
          setLoading(false);
          return;
        }
      } else if (trimmed.includes('instagram.com')) {
        if (forcedSource) setInstagramSource(forcedSource);
        else if (preferServer === 'server1') setInstagramSource('indown');
        else if (preferServer === 'server2') setInstagramSource('savevid');
        else setInstagramSource(null);

        data = await scrapeInstagram(trimmed);

        if (data && data.requireSource) {
          setServerModal({
            isOpen: true,
            platform: 'instagram',
            url: trimmed,
            options: {
              title: t('label-choose-server', 'Choose Server'),
              message: 'Server 1: InDown (Reels, Posts & Photos)\nServer 2: SnapSave (Reels, Posts & Photos)',
              server1Id: 'indown',
              server1Label: 'SERVER 1',
              server2Id: 'savevid',
              server2Label: 'SERVER 2',
            },
          });
          setLoading(false);
          return;
        }
      } else if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
        if (forcedSource) setYouTubeSource(forcedSource);
        else if (preferServer === 'server1') setYouTubeSource('gg');
        else if (preferServer === 'server2') setYouTubeSource('mobi');
        else setYouTubeSource(null);

        data = await scrapeYouTube(trimmed);

        if (data && data.requireSource) {
          setServerModal({
            isOpen: true,
            platform: 'youtube',
            url: trimmed,
            options: {
              title: t('label-choose-server', 'Choose Server'),
              message: 'Server 1: YTMP3.gg (Multi Resolution 1080p - 360p + MP3)\nServer 2: YTMP3.mobi (Fast & Stable MP4 / MP3)',
              server1Id: 'gg',
              server1Label: 'SERVER 1',
              server2Id: 'mobi',
              server2Label: 'SERVER 2',
            },
          });
          setLoading(false);
          return;
        }
      } else if (
        trimmed.includes('twitter.com') ||
        trimmed.includes('x.com') ||
        trimmed.includes('fixupx.com') ||
        trimmed.includes('fxtwitter.com') ||
        trimmed.includes('vxtwitter.com')
      ) {
        if (forcedSource) setTwitterSource(forcedSource);
        else if (preferServer === 'server1') setTwitterSource('tvd');
        else if (preferServer === 'server2') setTwitterSource('tweeload');
        else setTwitterSource(null);

        data = await scrapeTwitter(trimmed);

        if (data && data.requireSource) {
          setServerModal({
            isOpen: true,
            platform: 'twitter',
            url: trimmed,
            options: {
              title: t('label-choose-server', 'Choose Server'),
              message: 'Server 1: TVD (Full HD 1080p · 720p · Multi-Res)\nServer 2: TweeLoad (SD 320p Video)',
              server1Id: 'tvd',
              server1Label: 'SERVER 1',
              server2Id: 'tweeload',
              server2Label: 'SERVER 2',
            },
          });
          setLoading(false);
          return;
        }
      } else if (trimmed.includes('spotify.com')) {
        if (forcedSource) setSpotifySource(forcedSource);
        else if (preferServer === 'server1') setSpotifySource('spotidown');
        else if (preferServer === 'server2') setSpotifySource('soundloaders');
        else setSpotifySource(null);

        data = await scrapeSpotify(trimmed);

        if (data && data.requireSource) {
          setServerModal({
            isOpen: true,
            platform: 'spotify',
            url: trimmed,
            options: {
              title: t('label-choose-server', 'Choose Server'),
              message: 'Server 1: SpotiDown (Playlist & Single Track)\nServer 2: SoundLoaders (Playlist & Single Track)',
              server1Id: 'spotidown',
              server1Label: 'SERVER 1',
              server2Id: 'soundloaders',
              server2Label: 'SERVER 2',
            },
          });
          setLoading(false);
          return;
        }
      } else if (trimmed.includes('pinterest.com') || trimmed.includes('pin.it')) {
        data = await scrapePinterest(trimmed);
      } else if (trimmed.includes('music.apple.com')) {
        data = await scrapeAppleMusic(trimmed);
      } else if (trimmed.includes('facebook.com') || trimmed.includes('fb.watch')) {
        data = await scrapeFacebook(trimmed);
      } else if (trimmed.includes('xiaohongshu.com') || trimmed.includes('xhslink.com')) {
        data = await scrapeRedNote(trimmed);
      } else if (trimmed.includes('douyin.com')) {
        data = await scrapeDouyin(trimmed);
      } else if (trimmed.includes('bilibili.com') || trimmed.includes('bili.im') || trimmed.includes('bilibili.tv')) {
        data = await scrapeBilibili(trimmed);
      } else if (trimmed.includes('threads.net')) {
        data = await scrapeThreads(trimmed);
      } else if (trimmed.includes('bandcamp.com')) {
        data = await scrapeBandcamp(trimmed);
      } else if (trimmed.includes('pixiv.net')) {
        data = await scrapePixiv(trimmed);
      } else {
        throw new Error(t('error-unsupported-platform', 'Unsupported platform or URL'));
      }

      if (data && data.status && data.result) {
        setResult(data.result);
        addToHistory({
          title: data.result.title || 'Untitled Media',
          url: trimmed,
          sourceUrl: trimmed,
          thumbnail: data.result.thumbnail,
          downloads: data.result.downloads,
        });
        showToast(t('toast-analyze-success', 'Media parsed successfully!'), 'success');
        setTimeout(() => {
          document.getElementById('resultSection')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 120);
      } else {
        throw new Error(data?.message || 'Failed to extract media links.');
      }
    } catch (err) {
      console.error('Analyze error:', err);
      showToast(err.message || 'Error parsing link. Please try another server or check URL.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleServerSelect = (chosenSource) => {
    const { url } = serverModal;
    setServerModal({ isOpen: false, platform: '', url: '', options: null });
    performScrape(url, chosenSource);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        if (isBatchMode) {
          setBatchText((prev) => (prev ? prev + '\n' + text : text));
        } else {
          const trimmed = text.trim();
          setUrl(trimmed);          // simpan full URL untuk analisis
          setInputDisplay(trimmed); // tampilkan URL singkat di input DOM
          setTimeout(() => inputRef.current?.blur(), 0); // blur agar mobile tidak scroll
        }
        showToast(t('toast-pasted', 'Pasted from clipboard!'), 'success');
      }
    } catch {
      showToast('Could not access clipboard', 'error');
    }
  };

  const handleClear = () => {
    if (isBatchMode) setBatchText('');
    else {
      setUrl('');
      if (inputRef.current) inputRef.current.value = '';
    }
    setResult(null);
  };

  const handleAnalyzeClick = () => {
    if (isBatchMode) {
      handleBatchAnalyze();
    } else {
      performScrape(url);
    }
  };

  const handleBatchAnalyze = async () => {
    const urls = batchText
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.startsWith('http://') || u.startsWith('https://'));

    if (urls.length === 0) {
      showToast('Please enter valid URLs (one per line)', 'error');
      return;
    }

    const items = urls.map((u) => ({ url: u, status: 'pending', result: null }));
    setBatchItems(items);
    setBatchModalOpen(true);

    for (let i = 0; i < items.length; i++) {
      items[i].status = 'analyzing';
      setBatchItems([...items]);

      try {
        let res = null;
        const u = items[i].url;
        if (u.includes('tiktok.com')) res = await scrapeTikTok(u);
        else if (u.includes('instagram.com')) res = await scrapeInstagram(u);
        else if (u.includes('youtube.com') || u.includes('youtu.be')) res = await scrapeYouTube(u);
        else if (u.includes('twitter.com') || u.includes('x.com')) res = await scrapeTwitter(u);
        else if (u.includes('spotify.com')) res = await scrapeSpotify(u);
        else if (u.includes('pinterest.com') || u.includes('pin.it')) res = await scrapePinterest(u);
        else if (u.includes('music.apple.com')) res = await scrapeAppleMusic(u);
        else if (u.includes('facebook.com')) res = await scrapeFacebook(u);
        else if (u.includes('xiaohongshu.com') || u.includes('xhslink.com')) res = await scrapeRedNote(u);
        else if (u.includes('douyin.com')) res = await scrapeDouyin(u);
        else if (u.includes('bilibili.com') || u.includes('bili.im')) res = await scrapeBilibili(u);
        else if (u.includes('threads.net')) res = await scrapeThreads(u);
        else if (u.includes('bandcamp.com')) res = await scrapeBandcamp(u);
        else if (u.includes('pixiv.net')) res = await scrapePixiv(u);

        if (res && res.status && res.result) {
          items[i].status = 'success';
          items[i].result = res.result;
          addToHistory({
            title: res.result.title || u,
            url: u,
            sourceUrl: u,
            thumbnail: res.result.thumbnail,
            downloads: res.result.downloads,
          });
        } else {
          items[i].status = 'error';
        }
      } catch {
        items[i].status = 'error';
      }
      setBatchItems([...items]);
    }
  };

  const handleDownloadSingle = (dlOption, currentResult) => {
    if (!dlOption?.url) {
      showToast('No download URL available.', 'error');
      return;
    }

    // Hint untuk nama file (quality label atau format)
    const hint = dlOption.quality || dlOption.type || dlOption.format || 'media';
    const mediaType = dlOption.isImage || dlOption.type?.toLowerCase().includes('cover')
      ? 'Cover Art'
      : dlOption.isAudio
      ? 'MP3 Audio'
      : 'File';

    downloadFile(dlOption.url, hint, {
      onStart: () => {
        showToast(t('toast-downloading', `Downloading ${mediaType}... Please wait`), 'info');
      },
      onSuccess: () => {
        showToast(t('toast-download-success', `${mediaType} saved successfully!`), 'success');
      },
      onFallback: () => {
        showToast('Opening in new tab — tap & hold to save manually.', 'info');
      },
      onError: (msg) => {
        showToast(msg || 'Download failed. Please try again.', 'error');
      },
    });
  };

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const PLATFORMS = [
    {
      name: 'TikTok',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.4a6.33 6.33 0 0 0-.85-.05A6.34 6.34 0 0 0 3.1 15.7a6.34 6.34 0 0 0 10.82 4.48 6.27 6.27 0 0 0 1.9-4.51v-6.6a8.28 8.28 0 0 0 4.84 1.55v-3.5a4.85 4.85 0 0 1-1.07-.43z" />
        </svg>
      ),
    },
    {
      name: 'Instagram',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      ),
    },
    {
      name: 'YouTube',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
        </svg>
      ),
    },
    {
      name: 'Twitter / X',
      icon: (
        <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: 'Spotify',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 15.2a7.6 7.6 0 0 1 8-1.2" />
          <path d="M7 12.2a9.7 9.7 0 0 1 10-1.2" />
          <path d="M6 9.2a12.2 12.2 0 0 1 12-1.2" />
        </svg>
      ),
    },
    {
      name: 'Pinterest',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="9" x2="12" y2="22" />
          <path d="M8 12c-1.5-1.5-1.5-4 0-5.5s4-1.5 5.5 0 1.5 4 0 5.5-4 1.5-5.5 0z" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      ),
    },
    {
      name: 'Threads',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12.004 2C6.477 2 2 6.477 2 12s4.477 10 10.004 10c2.81 0 5.37-1.155 7.214-3.023l-1.464-1.374A7.95 7.95 0 0 1 12.004 20C7.585 20 4 16.415 4 12s3.585-8 8.004-8c4.043 0 7.378 3.011 7.892 6.915.228 1.737-.215 3.42-1.22 4.63-.888 1.069-2.197 1.667-3.686 1.667-1.782 0-2.887-.935-3.08-2.617.848-.223 1.67-.624 2.336-1.25.96-.902 1.487-2.148 1.487-3.513 0-2.316-1.688-4.085-4.148-4.085-2.646 0-4.589 1.993-4.589 4.717 0 2.802 1.946 4.793 4.708 4.793 1.139 0 2.222-.361 3.125-1.042.428.847 1.173 1.401 2.147 1.545 1.838.272 3.606-.474 4.851-2.046 1.349-1.705 1.905-3.993 1.564-6.452C21.84 5.364 17.404 2 12.004 2zm.02 11.23c-1.42 0-2.378-1.047-2.378-2.483 0-1.436.958-2.483 2.378-2.483 1.385 0 2.315 1.026 2.315 2.483 0 1.457-.93 2.483-2.315 2.483z" />
        </svg>
      ),
    },
    {
      name: 'Facebook',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
  ];

  return (
    <div id="homePage" className={`page-content ${isDesktop ? 'desktop-home-mode' : ''}`}>
      <div className="home-layout-grid">
        <div className="home-main-col">
          {/* Signature Black Hero Dashboard Card (Matching reference image.png & image2.png) */}
          <div className="hero-engine-card">
        <div className="hero-card-glow" />

        <div className="hero-card-top">
          <div className="hero-status-tag">
            <span className="hero-pulse-dot" />
            <span>CONVERTER ENGINE</span>
          </div>

          <button
            type="button"
            className="hero-pill-btn"
            onClick={handlePaste}
            title="Paste URL from clipboard"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M19 2h-4.18C14.4.84 13.3 0 12 0S9.6.84 9.18 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 18H5V4h2v3h10V4h2v16z" />
            </svg>
            <span>Quick Paste</span>
          </button>
        </div>

        <div className="hero-card-middle">
          <div className="hero-card-text">
            <span className="hero-subheading">CLEAN & MINIMALIST</span>
            <h2 className="hero-main-heading">Paste. Convert. Save.</h2>
            <p className="hero-desc">
              High speed, watermark-free downloader for 14+ video & audio platforms.
            </p>
          </div>

          {/* Mini Radial Ready Meter (from image2.png) */}
          <div className="hero-metric-box">
            <div className="hero-circle-meter">
              <svg viewBox="0 0 54 54" width="54" height="54">
                <circle cx="27" cy="27" r="22" className="meter-bg" strokeWidth="5" fill="none" />
                <circle
                  cx="27"
                  cy="27"
                  r="22"
                  className="meter-fill"
                  strokeWidth="5"
                  strokeDasharray="138"
                  strokeDashoffset="18"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <span className="meter-label">HD</span>
            </div>
            <span className="meter-caption">1080p Ready</span>
          </div>
        </div>

        <div className="hero-card-bottom-actions">
          <button
            type="button"
            className="hero-action-pill primary"
            onClick={focusInput}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>New Convert</span>
          </button>

          <button
            type="button"
            className={`hero-action-pill secondary ${isBatchMode ? 'active' : ''}`}
            onClick={() => setIsBatchMode(!isBatchMode)}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
            </svg>
            <span>{isBatchMode ? 'Single Mode' : 'Batch Queue'}</span>
          </button>
        </div>
      </div>

      {/* Input Section (Matching reference search pill) */}
      <div className="input-section">
        <div className={`input-wrapper ${isBatchMode ? 'batch-active' : ''}`} id="inputWrapper">
          <span className="search-icon" id="searchIcon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>

          {!isBatchMode ? (
            <input
              ref={inputRef}
              type="text"
              id="urlInput"
              placeholder={t('placeholder-paste-link', 'Paste link here (TikTok, IG, YouTube...)')}
              autoComplete="off"
              defaultValue=""
              onChange={(e) => {
                // User ketik manual — update url state langsung dari DOM
                setUrl(e.target.value);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeClick()}
              onPaste={(e) => {
                e.preventDefault();
                const pastedText = (e.clipboardData || window.clipboardData).getData('text').trim();
                if (!pastedText) return;
                setUrl(pastedText);               // simpan full URL
                setInputDisplay(pastedText);       // tampilkan pendek di DOM
                showToast(t('toast-pasted', 'Pasted from clipboard!'), 'success');
                setTimeout(() => inputRef.current?.blur(), 0);
              }}
            />
          ) : (
            <textarea
              ref={inputRef}
              id="batchUrlInput"
              className="batch-url-textarea"
              placeholder={t('placeholder-batch-link', 'Paste multiple links (one per line)...')}
              autoComplete="off"
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
            />
          )}

          {/* Batch Toggle Button */}
          <button
            type="button"
            id="batchToggleBtn"
            className={`input-action-btn batch-toggle-btn ${isBatchMode ? 'active' : ''}`}
            title="Batch Mode"
            onClick={() => setIsBatchMode(!isBatchMode)}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
            </svg>
          </button>

          {/* Paste or Clear Button */}
          {(!isBatchMode && !url) || (isBatchMode && !batchText) ? (
            <button
              type="button"
              id="pasteBtn"
              className="input-action-btn"
              title="Paste link"
              onClick={handlePaste}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M19 2h-4.18C14.4.84 13.3 0 12 0S9.6.84 9.18 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 18H5V4h2v3h10V4h2v16z" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              id="clearBtn"
              className="input-action-btn"
              title="Clear input"
              onClick={handleClear}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Primary Convert Button (Solid Black Pill) */}
        <button
          type="button"
          id="downloadBtn"
          className="analyze-btn"
          onClick={handleAnalyzeClick}
          disabled={loading}
        >
          <span>
            {loading
              ? t('loader-analyzing', 'CONVERTING...')
              : isBatchMode
              ? t('btn-analyze-batch', 'CONVERT BATCH')
              : t('btn-analyze', 'CONVERT NOW')}
          </span>
          {!loading && (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          )}
        </button>
      </div>

      {/* Interactive Conversion Loading State (The user's core request!) */}
      {loading && (
        <ConvertProgress
          targetUrl={isBatchMode ? `${batchText.split('\n').filter(Boolean).length} links in batch` : url}
          onCancel={() => setLoading(false)}
        />
      )}

      {/* Result Section */}
      {result && !loading && (
        <ResultCard
          result={result}
          originalUrl={url}
          onClose={() => setResult(null)}
          onDownload={handleDownloadSingle}
        />
      )}

      {/* Supported Platforms (Reference image2.png "Categories" Grid) */}
      <div className="supported-section">
        <div className="section-header-row">
          <span className="section-label">SUPPORTED CHANNELS</span>
          <span className="section-subtext">14 Engines Active</span>
        </div>

        <div className="platform-grid">
          {PLATFORMS.map((plat, idx) => (
            <button
              key={idx}
              type="button"
              className="platform-card-item"
              onClick={() => {
                focusInput();
                showToast(`Ready for ${plat.name} link`, 'info');
              }}
            >
              <div className="platform-icon-circle">
                {plat.icon}
              </div>
              <span className="platform-name">{plat.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>

      {/* Desktop Side Widget Column (Shown in Desktop Mode) */}
      {isDesktop && (
        <aside className="home-desktop-side-col">
          {/* Widget 1: Quick Recent Downloads */}
          <div className="desktop-widget-card recent-downloads-widget">
            <div className="widget-header">
              <div className="widget-title-group">
                <span className="widget-badge-dot" />
                <h3 className="widget-title">Recent Activity</h3>
              </div>
              <button
                type="button"
                className="widget-link-btn"
                onClick={() => setActivePage('history')}
              >
                Archive ({history.length})
              </button>
            </div>

            {history.length === 0 ? (
              <div className="widget-empty-box">
                <p>No downloads yet today.</p>
                <span>Links you convert will appear here for instant 1-click re-download.</span>
              </div>
            ) : (
              <div className="widget-recent-list">
                {history.slice(0, 4).map((item) => (
                  <div key={item.id} className="widget-recent-item">
                    <div className="widget-item-thumb">
                      {item.thumbnail ? (
                        <img src={item.thumbnail} alt="" />
                      ) : (
                        <div className="widget-thumb-placeholder">
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="widget-item-meta">
                      <span className="widget-item-title" title={item.title}>
                        {item.title || 'Media file'}
                      </span>
                      <span className="widget-item-sub">
                        {new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="widget-quick-dl-btn"
                      title="Re-download"
                      onClick={() => {
                        if (item.downloads?.[0]) {
                          handleDownloadSingle(item.downloads[0], item);
                        } else if (item.url) {
                          window.open(item.url, '_blank');
                        }
                      }}
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Widget 2: Engine Diagnostics & Health */}
          <div className="desktop-widget-card engine-diag-widget">
            <div className="widget-header">
              <div className="widget-title-group">
                <span className="widget-badge-dot" />
                <h3 className="widget-title">Engine Health</h3>
              </div>
              <span className="widget-status-tag">OPTIMAL</span>
            </div>

            <div className="diag-metrics-grid">
              <div className="diag-metric-item">
                <span className="diag-val">{totalDownloads.toLocaleString()}</span>
                <span className="diag-lbl">Processed Media</span>
              </div>
              <div className="diag-metric-item">
                <span className="diag-val">14/14</span>
                <span className="diag-lbl">Engines Ready</span>
              </div>
              <div className="diag-metric-item">
                <span className="diag-val">1080p</span>
                <span className="diag-lbl">Max Resolution</span>
              </div>
              <div className="diag-metric-item">
                <span className="diag-val">0 Ads</span>
                <span className="diag-lbl">Clean Stream</span>
              </div>
            </div>
          </div>

          {/* Widget 3: Quick Batch Converter Launcher */}
          <div className="desktop-widget-card batch-quick-widget">
            <div className="batch-quick-content">
              <div className="batch-quick-text">
                <h4>Batch Multi-Link Queue</h4>
                <p>Paste multiple links from TikTok, Instagram or YouTube to download concurrently.</p>
              </div>
              <button
                type="button"
                className="batch-quick-btn"
                onClick={() => {
                  setIsBatchMode(true);
                  focusInput();
                }}
              >
                <span>Launch Batch Mode</span>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>

      {/* Choose Server Modal */}
      <ServerSelectModal
        isOpen={serverModal.isOpen}
        options={serverModal.options}
        onSelect={handleServerSelect}
        onClose={() => setServerModal({ isOpen: false, platform: '', url: '', options: null })}
      />

      {/* Batch Queue Modal */}
      <BatchModal
        isOpen={batchModalOpen}
        items={batchItems}
        onClose={() => setBatchModalOpen(false)}
        onDownloadItem={(item) => {
          if (item.result?.downloads?.[0]) {
            handleDownloadSingle(item.result.downloads[0], item.result);
          }
        }}
        onDownloadAll={() => {
          batchItems.forEach((item) => {
            if (item.status === 'success' && item.result?.downloads?.[0]) {
              handleDownloadSingle(item.result.downloads[0], item.result);
            }
          });
        }}
      />
    </div>
  );
}
