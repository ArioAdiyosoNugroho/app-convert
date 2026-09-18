import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';

export default function ConvertProgress({ targetUrl, onCancel, platform = null }) {
  const { t } = useApp();
  const [percent, setPercent] = useState(15);
  const [currentStage, setCurrentStage] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  // Detect platform name and icon
  const getPlatformInfo = (urlStr) => {
    const u = (urlStr || '').toLowerCase();
    if (u.includes('tiktok.com')) return { name: 'TikTok', tag: 'HD Video + MP3' };
    if (u.includes('instagram.com')) return { name: 'Instagram', tag: 'Reels & Carousel' };
    if (u.includes('youtube.com') || u.includes('youtu.be')) return { name: 'YouTube', tag: '1080p + 320kbps' };
    if (u.includes('twitter.com') || u.includes('x.com')) return { name: 'Twitter / X', tag: 'Video & Media' };
    if (u.includes('spotify.com')) return { name: 'Spotify', tag: 'Lossless Audio' };
    if (u.includes('pinterest.com') || u.includes('pin.it')) return { name: 'Pinterest', tag: 'Image & Video' };
    if (u.includes('music.apple.com')) return { name: 'Apple Music', tag: 'Audio Stream' };
    if (u.includes('facebook.com') || u.includes('fb.watch')) return { name: 'Facebook', tag: 'Original Quality' };
    if (u.includes('xiaohongshu.com') || u.includes('xhslink.com')) return { name: 'RedNote', tag: 'Clean Media' };
    if (u.includes('douyin.com')) return { name: 'Douyin', tag: 'Full HD Video' };
    if (u.includes('bilibili.com')) return { name: 'Bilibili', tag: 'Direct Stream' };
    if (u.includes('threads.net')) return { name: 'Threads', tag: 'Media Stream' };
    if (u.includes('bandcamp.com')) return { name: 'Bandcamp', tag: 'High Quality Audio' };
    if (u.includes('pixiv.net')) return { name: 'Pixiv', tag: 'Original Artwork' };
    return { name: 'Media Engine', tag: 'Auto Resolving' };
  };

  const platformInfo = getPlatformInfo(targetUrl);

  const STAGES = [
    {
      title: 'Handshake & Gateway',
      desc: 'Connecting to server nodes...',
    },
    {
      title: 'Parsing Media Stream',
      desc: 'Extracting clean audio & video stream...',
    },
    {
      title: 'Resolving Formats',
      desc: 'Converting multi-resolution HD & MP3...',
    },
    {
      title: 'Finalizing Package',
      desc: 'Readying direct download links...',
    },
  ];

  // Animated progress simulation while scraping
  useEffect(() => {
    const startTime = Date.now();
    const timerInterval = setInterval(() => {
      setElapsed(((Date.now() - startTime) / 1000).toFixed(1));
    }, 100);

    // Progressive percentage milestones
    const t1 = setTimeout(() => {
      setPercent(38);
      setCurrentStage(1);
    }, 350);

    const t2 = setTimeout(() => {
      setPercent(68);
      setCurrentStage(2);
    }, 900);

    const t3 = setTimeout(() => {
      setPercent(88);
      setCurrentStage(3);
    }, 1800);

    const t4 = setTimeout(() => {
      setPercent(96);
    }, 3000);

    return () => {
      clearInterval(timerInterval);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  // Circle progress calculation (r = 46, circumference = 2 * PI * 46 ~ 289)
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="convert-progress-card">
      {/* Top Header info */}
      <div className="convert-progress-header">
        <div className="convert-header-left">
          <span className="live-pulse-dot" />
          <span className="convert-status-text">CONVERTING MEDIA</span>
        </div>
        <div className="convert-badge-pill">
          {platformInfo.name} • {platformInfo.tag}
        </div>
      </div>

      {/* Center Radial Progress + Metrics (Matching image2.png) */}
      <div className="convert-gauge-section">
        <div className="radial-progress-wrapper">
          <svg className="radial-progress-svg" viewBox="0 0 110 110" width="110" height="110">
            {/* Background track circle */}
            <circle
              cx="55"
              cy="55"
              r={radius}
              className="radial-progress-track"
              strokeWidth="9"
              fill="transparent"
            />
            {/* Animated progress circle */}
            <circle
              cx="55"
              cy="55"
              r={radius}
              className="radial-progress-bar"
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="radial-progress-inner">
            <span className="radial-percent-val">{percent}%</span>
            <span className="radial-percent-label">{elapsed}s</span>
          </div>
        </div>

        <div className="convert-gauge-info">
          <h4 className="convert-gauge-title">{STAGES[currentStage]?.title || 'Processing...'}</h4>
          <p className="convert-gauge-desc">{STAGES[currentStage]?.desc || 'Extracting media streams...'}</p>
          <div className="convert-mini-progress">
            <div className="convert-mini-bar" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </div>

      {/* Stepper Timeline (Matching image.png Tracking Stepper) */}
      <div className="convert-stepper-container">
        <div className="stepper-track-line">
          <div
            className="stepper-track-fill"
            style={{ width: `${(currentStage / (STAGES.length - 1)) * 100}%` }}
          />
        </div>

        <div className="stepper-nodes">
          {STAGES.map((stg, idx) => {
            const isCompleted = idx < currentStage;
            const isActive = idx === currentStage;
            return (
              <div
                key={idx}
                className={`stepper-node ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
              >
                <div className="stepper-dot">
                  {isCompleted ? (
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : isActive ? (
                    <span className="stepper-active-pulse" />
                  ) : (
                    <span className="stepper-pending-dot" />
                  )}
                </div>
                <span className="stepper-label">{stg.title.split(' ')[0]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Target Link Preview & Cancel Action */}
      <div className="convert-progress-footer">
        <div className="convert-target-url" title={targetUrl}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          <span className="url-truncate">{targetUrl}</span>
        </div>

        {onCancel && (
          <button type="button" className="convert-cancel-btn" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
