import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function ResultCard({ result, originalUrl, onClose, onDownload }) {
  const { t, showToast } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [filterType, setFilterType] = useState('all'); // 'all', 'video', 'audio'
  const [downloadingIdx, setDownloadingIdx] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);

  if (!result) return null;

  const downloads = result.downloads || [];
  const previewSlides = downloads.filter((dl) => !dl.isMirror);
  const slides = previewSlides.length > 0 ? previewSlides : downloads;

  const currentItem = slides[currentSlide] || slides[0] || {};
  const isVideo =
    currentItem.type?.toUpperCase().includes('VIDEO') ||
    currentItem.type?.toUpperCase().includes('MP4') ||
    currentItem.url?.includes('.mp4');

  const handlePrev = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(currentSlide + 1);
  };

  const copyToClipboard = (url, idx) => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopiedIdx(idx);
        showToast(t('toast-copied', 'Link copied to clipboard!'), 'success');
        setTimeout(() => setCopiedIdx(null), 2000);
      })
      .catch(() => {
        showToast('Failed to copy', 'error');
      });
  };

  const handleDownloadWithFeedback = (dl, idx) => {
    setDownloadingIdx(idx);
    onDownload(dl, result);
    setTimeout(() => {
      setDownloadingIdx(null);
    }, 2500);
  };

  // Filter downloads
  const hasVideos = downloads.some((dl) => !dl.isAudio && !dl.isImage && !dl.type?.toLowerCase().includes('cover'));
  const hasAudio = downloads.some((dl) => dl.isAudio || dl.type?.toLowerCase().includes('audio') || dl.format === 'mp3');
  const hasImages = downloads.some((dl) => dl.isImage || dl.type?.toLowerCase().includes('cover') || dl.format === 'jpg' || dl.format === 'png');

  const filteredDownloads = downloads.filter((dl) => {
    const isImg = dl.isImage || dl.type?.toLowerCase().includes('cover') || dl.format === 'jpg' || dl.format === 'png';
    const isAud = dl.isAudio || dl.type?.toLowerCase().includes('audio') || dl.format === 'mp3';
    const isVid = !isAud && !isImg;

    if (filterType === 'video') return isVid;
    if (filterType === 'audio') return isAud;
    if (filterType === 'image') return isImg;
    return true;
  });

  return (
    <div id="resultSection" className="result-section">
      <div className="media-card">
        {/* Media Preview Header */}
        <div className="thumbnail-wrapper" id="previewContainer">
          <button
            type="button"
            id="closeResult"
            className="media-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {slides.length > 1 && (
            <div className="media-badge-indicator">
              {currentSlide + 1} / {slides.length}
            </div>
          )}

          <div id="slidesWrapper" className="slides-viewport" style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {isVideo ? (
              <video
                src={currentItem.url || result.thumbnail}
                poster={result.thumbnail}
                controls
                playsInline
                className="media-preview-content"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  display: 'block',
                  maxWidth: '100%',
                  maxHeight: '100%',
                }}
              />
            ) : (
              <img
                src={currentItem.url || result.thumbnail}
                alt={result.title || 'Media preview'}
                className="media-preview-content"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  display: 'block',
                  maxWidth: '100%',
                  maxHeight: '100%',
                }}
                onError={(e) => {
                  if (result.thumbnail && e.target.src !== result.thumbnail) {
                    e.target.src = result.thumbnail;
                  }
                }}
              />
            )}
          </div>

          {slides.length > 1 && (
            <>
              <button
                type="button"
                className="media-nav-btn prev"
                onClick={handlePrev}
                disabled={currentSlide === 0}
                aria-label="Previous slide"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                type="button"
                className="media-nav-btn next"
                onClick={handleNext}
                disabled={currentSlide === slides.length - 1}
                aria-label="Next slide"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Media Details */}
        <div className="info-wrapper">
          <div className="result-meta-top">
            <span className="result-status-pill">Ready to Save</span>
            {result.author && (
              <span className="result-author-pill">
                @{result.author}
              </span>
            )}
          </div>

          {/* <h2 id="resultTitle" className="result-title">
            {result.title || 'Media Processed Successfully'}
          </h2> */}

          {/* Quick Filter Tabs */}
          <div className="result-filter-tabs">
            <button
              type="button"
              className={`filter-tab-btn ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              All Formats ({downloads.length})
            </button>
            {hasVideos && (
              <button
                type="button"
                className={`filter-tab-btn ${filterType === 'video' ? 'active' : ''}`}
                onClick={() => setFilterType('video')}
              >
                Video (MP4)
              </button>
            )}
            {hasAudio && (
              <button
                type="button"
                className={`filter-tab-btn ${filterType === 'audio' ? 'active' : ''}`}
                onClick={() => setFilterType('audio')}
              >
                Audio (MP3)
              </button>
            )}
            {hasImages && (
              <button
                type="button"
                className={`filter-tab-btn ${filterType === 'image' ? 'active' : ''}`}
                onClick={() => setFilterType('image')}
              >
                Cover / Image
              </button>
            )}
          </div>

          {/* Download Options */}
          <div id="downloadList" className="download-options">
            {filteredDownloads.map((dl, idx) => {
              const label =
                dl.quality ||
                dl.type ||
                (dl.isAudio ? 'High Quality Audio' : `Download Option ${idx + 1}`);
              const isImg = dl.isImage || dl.type?.toLowerCase().includes('cover') || dl.format === 'jpg' || dl.format === 'png';
              const formatBadge = dl.isAudio ? 'MP3' : isImg ? 'Cover (JPG)' : (dl.format?.toUpperCase() || 'MP4');
              const isDownloading = downloadingIdx === idx;
              const isCopied = copiedIdx === idx;
              const itemNum = String(idx + 1).padStart(2, '0');

              return (
                <div key={idx} className={`download-row ${isDownloading ? 'downloading' : ''}`}>
                  <span className="dl-item-index">{itemNum}</span>

                  <button
                    type="button"
                    className="download-action-btn"
                    onClick={() => handleDownloadWithFeedback(dl, idx)}
                    disabled={isDownloading}
                  >
                    <div className="dl-action-text-group">
                      <span className="dl-name">{label}</span>
                      <span className="dl-subtext">{formatBadge} • Direct Stream</span>
                    </div>

                    <div className="dl-btn-end">
                      {isDownloading ? (
                        <span className="dl-progress-pill">
                          <span className="dl-spin-dot" />
                          Saving...
                        </span>
                      ) : (
                        <span className="dl-format-badge">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                          Download
                        </span>
                      )}
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`copy-link-btn ${isCopied ? 'copied' : ''}`}
                    title="Copy direct link"
                    onClick={() => copyToClipboard(dl.url, idx)}
                  >
                    {isCopied ? (
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Primary Quick Download CTA (like image copy.png Purchase Now >>>) */}
          {filteredDownloads.length > 0 && (
            <div className="result-primary-cta">
              <button
                type="button"
                className="btn-download-all-cta"
                onClick={() => handleDownloadWithFeedback(filteredDownloads[0], 0)}
              >
                <span className="cta-btn-text">Save Best Quality ({filteredDownloads[0]?.quality || 'HD'})</span>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
