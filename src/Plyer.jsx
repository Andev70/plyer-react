import React, { useState, useRef, useEffect, useCallback } from 'react';
import Hls from 'hls.js';
import dashjs from 'dashjs';
import './Plyer.css';

const DEFAULT_SOURCES = [];

const Plyer = ({ src, sources = DEFAULT_SOURCES, poster, options = {} }) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const previewVideoRef = useRef(null);
  const timelineRef = useRef(null);
  const timeoutRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [qualityLabel, setQualityLabel] = useState('');
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewTime, setPreviewTime] = useState(0);
  const [previewLeft, setPreviewLeft] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [hlsLevels, setHlsLevels] = useState([]);
  const [dashBitrates, setDashBitrates] = useState([]);
  const [activeQualityIndex, setActiveQualityIndex] = useState(-1);
  
  const hlsRef = useRef(null);
  const dashRef = useRef(null);
  const currentSrcRef = useRef('');

  const formatTime = (time) => {
    if (isNaN(time) || time === Infinity) return "0:00";
    const s = Math.floor(time % 60);
    const m = Math.floor(time / 60) % 60;
    const h = Math.floor(time / 3600);
    if (h === 0) return `${m}:${s < 10 ? '0' : ''}${s}`;
    return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const loadSource = useCallback((sourceUrl) => {
    const video = videoRef.current;
    if (!video || !sourceUrl) return;
    
    // Only reload if the source actually changed
    if (sourceUrl === currentSrcRef.current) return;
    currentSrcRef.current = sourceUrl;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (dashRef.current) {
      dashRef.current.reset();
      dashRef.current = null;
    }

    // Prepare state for new source
    setIsLoading(true);
    setHlsLevels([]);
    setDashBitrates([]);
    setQualityLabel('Auto');
    setActiveQualityIndex(-1);
    setBuffered(0);
    setCurrentTime(0);

    if (previewVideoRef.current) {
      previewVideoRef.current.src = sourceUrl;
      previewVideoRef.current.load();
    }

    const extension = sourceUrl.split('?')[0].split('.').pop().toLowerCase();

    if (extension === 'm3u8') {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setHlsLevels(hls.levels);
          setIsLoading(false);
        });
        hlsRef.current = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
      }
    } else if (extension === 'mpd') {
      const dash = dashjs.MediaPlayer().create();
      dash.initialize(video, sourceUrl, false);
      dash.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED, () => {
        setDashBitrates(dash.getBitrateInfoListFor('video'));
        setIsLoading(false);
      });
      dashRef.current = dash;
    } else {
      video.src = sourceUrl;
      if (sources && sources.length) {
        const current = sources.find(s => s.src === sourceUrl);
        if (current) setQualityLabel(current.label);
      }
    }
  }, [sources]);

  useEffect(() => {
    const initialSrc = src || (sources && sources.length ? sources[0].src : '');
    if (initialSrc) {
      loadSource(initialSrc);
    }
    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
      if (dashRef.current) dashRef.current.reset();
    };
  }, [src, sources, loadSource]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const togglePlay = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    videoRef.current.volume = val;
    videoRef.current.muted = val === 0;
    setVolume(val);
    setIsMuted(val === 0);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(videoRef.current.duration);
    setIsLoading(false);
  };

  const handleProgress = () => {
    if (videoRef.current.duration > 0) {
      for (let i = 0; i < videoRef.current.buffered.length; i++) {
        if (videoRef.current.buffered.start(videoRef.current.buffered.length - 1 - i) < videoRef.current.currentTime) {
          const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1 - i);
          setBuffered((bufferedEnd / videoRef.current.duration) * 100);
          break;
        }
      }
    }
  };

  const scrub = (e) => {
    const rect = timelineRef.current.getBoundingClientRect();
    const percent = Math.min(Math.max(0, e.clientX - rect.left), rect.width) / rect.width;
    videoRef.current.currentTime = percent * videoRef.current.duration;
  };

  const handleMouseMove = (e) => {
    const rect = timelineRef.current.getBoundingClientRect();
    const percent = Math.min(Math.max(0, e.clientX - rect.left), rect.width) / rect.width;
    const time = percent * videoRef.current.duration;
    setPreviewTime(time);
    setPreviewLeft(percent * 100);
    
    if (previewVideoRef.current && !isNaN(time)) {
      previewVideoRef.current.currentTime = time;
    }
  };

  useEffect(() => {
    if (showPreview && previewVideoRef.current) {
        const canvas = document.getElementById('preview-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        const draw = () => {
            ctx.drawImage(previewVideoRef.current, 0, 0, 160, 90);
        };
        
        const currentPreview = previewVideoRef.current;
        currentPreview.addEventListener('seeked', draw);
        return () => currentPreview.removeEventListener('seeked', draw);
    }
  }, [showPreview]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const changePlaybackRate = (rate) => {
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
  };

  const changeHlsQuality = (index) => {
    if (hlsRef.current) {
        hlsRef.current.currentLevel = index;
        setActiveQualityIndex(index);
        setQualityLabel(index === -1 ? 'Auto' : `${hlsRef.current.levels[index].height}p`);
    }
    setShowQualityMenu(false);
  };

  const changeDashQuality = (index) => {
    const dash = dashRef.current;
    if (dash) {
        if (index === -1) {
          dash.updateSettings({ streaming: { abr: { autoSwitchBitrate: { video: true } } } });
        } else {
          dash.updateSettings({ streaming: { abr: { autoSwitchBitrate: { video: false } } } });
          dash.setQualityFor('video', index);
        }
        setActiveQualityIndex(index);
        setQualityLabel(index === -1 ? 'Auto' : `${dashBitrates[index].height}p`);
    }
    setShowQualityMenu(false);
  };

  const changeManualQuality = (index) => {
    const source = sources[index];
    const time = videoRef.current.currentTime;
    const paused = videoRef.current.paused;
    
    loadSource(source.src);
    setActiveQualityIndex(index);
    setQualityLabel(source.label);
    setShowQualityMenu(false);

    const onLoaded = () => {
        videoRef.current.currentTime = time;
        if (!paused) videoRef.current.play();
        videoRef.current.removeEventListener('loadeddata', onLoaded);
    };
    videoRef.current.addEventListener('loadeddata', onLoaded);
  };

  const showControls = () => {
    containerRef.current.style.cursor = 'default';
    const controls = containerRef.current.querySelector('.controls-container');
    if (controls) controls.style.opacity = '1';
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
        if (isPlaying && !showQualityMenu && !showSpeedMenu) {
            containerRef.current.style.cursor = 'none';
            if (controls) controls.style.opacity = '0';
        }
    }, 3000);
  };

  return (
    <div 
      ref={containerRef} 
      className={`video-container ${!isPlaying ? 'paused' : ''} ${isFullscreen ? 'fullscreen' : ''}`}
      onMouseMove={showControls}
    >
      <video
        ref={videoRef}
        className="video"
        poster={poster}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onProgress={handleProgress}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        onCanPlay={() => setIsLoading(false)}
        onSeeking={() => setIsLoading(true)}
        onSeeked={() => setIsLoading(false)}
        onCanPlayThrough={() => setIsLoading(false)}
        onLoadStart={() => setIsLoading(true)}
        onLoadedData={() => setIsLoading(false)}
        onLoadedMetadata={handleLoadedMetadata}
        onError={() => setIsLoading(false)}
        onAbort={() => setIsLoading(false)}
        onStalled={() => setIsLoading(false)}
        onSuspend={() => setIsLoading(false)}
        onClick={togglePlay}
        playsInline
        crossOrigin="anonymous"
      />

      <video ref={previewVideoRef} muted style={{ display: 'none' }} crossOrigin="anonymous" preload="auto" />

      <div className="video-overlay" onClick={togglePlay}>
        {isLoading && <div className="loader" style={{ display: 'block' }}></div>}
        {!isPlaying && !isLoading && (
            <div className="play-button-overlay">
                <svg viewBox="0 0 24 24" width="64" height="64" fill="white">
                    <path d="M8 5v14l11-7z"/>
                </svg>
            </div>
        )}
      </div>

      <div className="controls-container">
        <div 
          className="timeline-container" 
          ref={timelineRef}
          onMouseDown={scrub}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setShowPreview(true)}
          onMouseLeave={() => setShowPreview(false)}
        >
          {showPreview && (
            <div className="preview-thumbnail" style={{ display: 'flex', left: `${previewLeft}%` }}>
              <canvas id="preview-canvas" width="160" height="90"></canvas>
              <span className="preview-time">{formatTime(previewTime)}</span>
            </div>
          )}
          <div className="timeline">
            <div className="buffered-bar" style={{ width: `${buffered}%` }}></div>
            <div className="timeline-bar" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
            <div className="timeline-thumb" style={{ left: `${(currentTime / duration) * 100}%` }}></div>
          </div>
        </div>

        <div className="controls">
          <div className="controls-left">
            <button className="control-btn" onClick={togglePlay}>
              {!isPlaying ? (
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M5 3l14 9-14 9V3z"/></svg>
              ) : (
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
              )}
            </button>

            <div className="volume-container">
              <button className="control-btn" onClick={() => {
                videoRef.current.muted = !videoRef.current.muted;
                setIsMuted(videoRef.current.muted);
              }}>
                {isMuted || volume === 0 ? (
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                )}
              </button>
              <input type="range" className="volume-slider" min="0" max="1" step="0.05" value={isMuted ? 0 : volume} onChange={handleVolumeChange} />
            </div>

            <div className="time-display">
              <span>{formatTime(currentTime)}</span> / <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="controls-right">
            {(hlsLevels.length > 0 || dashBitrates.length > 0 || sources.length > 0) && (
              <div className="quality-selector">
                <button className="control-btn" onClick={() => { setShowQualityMenu(!showQualityMenu); setShowSpeedMenu(false); }}>
                   <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
                    </svg>
                    {qualityLabel && <span id="quality-label" style={{ display: 'block' }}>{qualityLabel}</span>}
                </button>
                <div className={`quality-menu ${showQualityMenu ? 'show' : ''}`}>
                  {hlsRef.current && (
                    <>
                      <button className={activeQualityIndex === -1 ? 'active' : ''} onClick={() => changeHlsQuality(-1)}>
                        <span>Auto</span>
                        <CheckIcon />
                      </button>
                      {hlsLevels.map((l, i) => (
                        <button key={i} className={activeQualityIndex === i ? 'active' : ''} onClick={() => changeHlsQuality(i)}>
                          <span>{l.height}p</span>
                          <CheckIcon />
                        </button>
                      ))}
                    </>
                  )}
                  {dashRef.current && (
                    <>
                      <button className={activeQualityIndex === -1 ? 'active' : ''} onClick={() => changeDashQuality(-1)}>
                        <span>Auto</span>
                        <CheckIcon />
                      </button>
                      {dashBitrates.map((b, i) => (
                        <button key={i} className={activeQualityIndex === i ? 'active' : ''} onClick={() => changeDashQuality(i)}>
                          <span>{b.height}p</span>
                          <CheckIcon />
                        </button>
                      ))}
                    </>
                  )}
                  {!hlsRef.current && !dashRef.current && sources.map((s, i) => (
                    <button key={i} className={activeQualityIndex === i ? 'active' : ''} onClick={() => changeManualQuality(i)}>
                      <span>{s.label}</span>
                      <CheckIcon />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="speed-selector">
              <button className="control-btn" onClick={() => { setShowSpeedMenu(!showSpeedMenu); setShowQualityMenu(false); }}>{playbackRate}x</button>
              <div className={`speed-menu ${showSpeedMenu ? 'show' : ''}`}>
                {[0.5, 1, 1.5, 2].map(rate => (
                  <button key={rate} className={playbackRate === rate ? 'active' : ''} onClick={() => changePlaybackRate(rate)}>
                    <span>{rate}x</span>
                    <CheckIcon />
                  </button>
                ))}
              </div>
            </div>

            <button className="control-btn" onClick={toggleFullscreen}>
               {!isFullscreen ? (
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
               ) : (
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
               )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckIcon = () => (
  <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export default Plyer;

