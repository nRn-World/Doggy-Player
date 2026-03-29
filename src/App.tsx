import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Square, SkipBack, SkipForward, Volume2, VolumeX, Maximize, FileVideo, X, Film, ListVideo, Trash2, Settings, ChevronDown, Copy, Check, Repeat, Repeat1, Shuffle } from 'lucide-react';

const translations = {
  sv: {
    settings: "Inställningar",
    language: "Språk",
    playback: "Uppspelning",
    autoplay: "Autoplay",
    repeat: "Upprepa",
    shortcuts: "Tangentbordsgenvägar",
    showShortcuts: "Visa genvägar",
    about: "Om",
    version: "Version",
    playlist: "Spellista",
    hidePlaylist: "Dölj spellista",
    togglePlaylist: "Växla spellista",
    dropFiles: "Dra och släpp en eller flera videofiler här för att börja titta, eller klicka på knappen nedan för att bläddra.",
    chooseFiles: "Välj videofiler",
    dropPlaylist: "Dra och släpp videofiler här för att skapa en spellista",
    scPlayPause: "Spela/Pausa (Håll för slow-mo)",
    scStop: "Stopp",
    scFullscreen: "Helskärm",
    scMute: "Tyst",
    scVolUp: "Höj volym",
    scVolDown: "Sänk volym",
    scForward: "Spola framåt 10s",
    scBackward: "Spola bakåt 10s",
    scFastForward: "Snabbspola (1.5x)",
    scFastForward2x: "Snabbspola (2.0x)",
    scZoomIn: "Zooma in",
    scZoomOut: "Zooma ut",
    scResetZoom: "Återställ zoom",
    scRotateRight: "Rotera höger",
    scRotateLeft: "Rotera vänster",
    scRotate180: "Rotera 180°",
    scRotate0: "Återställ rotation",
    copied: "Kopierad!",
    copyEmail: "Kopiera e-post",
    rememberVolume: "Kom ihåg volym",
    muteOnStart: "Ljudlös vid start",
    defaultSpeed: "Standardhastighet",
    resumePlayback: "Återuppta uppspelning",
    appearance: "Utseende",
    theme: "Tema",
    themeBrown: "Brun (Standard)",
    themeDark: "Mörk",
    themeLight: "Ljus",
    autoHideControls: "Dölj kontroller automatiskt",
    autoHideNever: "Aldrig",
    autoHide2s: "Efter 2 sekunder",
    autoHide5s: "Efter 5 sekunder",
    playlistSettings: "Spellista",
    autoRemoveFinished: "Ta bort färdigspelade videor"
  },
  en: {
    settings: "Settings",
    language: "Language",
    playback: "Playback",
    autoplay: "Autoplay",
    repeat: "Repeat",
    shortcuts: "Keyboard Shortcuts",
    showShortcuts: "Show shortcuts",
    about: "About",
    version: "Version",
    playlist: "Playlist",
    hidePlaylist: "Hide playlist",
    togglePlaylist: "Toggle playlist",
    dropFiles: "Drag and drop one or more video files here to start watching, or click the button below to browse.",
    chooseFiles: "Choose video files",
    dropPlaylist: "Drag and drop video files here to create a playlist",
    scPlayPause: "Play/Pause (Hold for slow-mo)",
    scStop: "Stop",
    scFullscreen: "Fullscreen",
    scMute: "Mute",
    scVolUp: "Volume up",
    scVolDown: "Volume down",
    scForward: "Forward 10s",
    scBackward: "Backward 10s",
    scFastForward: "Fast forward (1.5x)",
    scFastForward2x: "Fast forward (2.0x)",
    scZoomIn: "Zoom in",
    scZoomOut: "Zoom out",
    scResetZoom: "Reset zoom",
    scRotateRight: "Rotate right",
    scRotateLeft: "Rotate left",
    scRotate180: "Rotate 180°",
    scRotate0: "Reset rotation",
    copied: "Copied!",
    copyEmail: "Copy email",
    rememberVolume: "Remember volume",
    muteOnStart: "Mute on start",
    defaultSpeed: "Default speed",
    resumePlayback: "Resume playback",
    appearance: "Appearance",
    theme: "Theme",
    themeBrown: "Brown (Default)",
    themeDark: "Dark",
    themeLight: "Light",
    autoHideControls: "Auto-hide controls",
    autoHideNever: "Never",
    autoHide2s: "After 2 seconds",
    autoHide5s: "After 5 seconds",
    playlistSettings: "Playlist",
    autoRemoveFinished: "Auto-remove finished videos"
  }
};

const CustomLogo = ({ className, size = 24 }: { className?: string, size?: number }) => {
  return (
    <div 
      className={`relative inline-flex items-center justify-center ${className || ''}`} 
      style={{ width: size }}
    >
      <img 
        src="https://lh3.googleusercontent.com/d/1U5GlsJezjk_KU3dBFxTMXvmsL5KxfkNY" 
        alt="DoggyStyle Logo"
        className="w-full h-auto object-contain pointer-events-none"
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
      />
    </div>
  );
};

export default function App() {
  const appRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [playlist, setPlaylist] = useState<{id: string, name: string, url: string}[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoSrc = playlist[currentIndex]?.url || null;
  
  // Video State
  const [isPlaying, setIsPlaying] = useState(false);

  // Handle video source and play state changes
  useEffect(() => {
    if (!videoRef.current || !videoSrc) return;

    if (isPlaying) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Auto-play prevented or failed:", error);
          setIsPlaying(false);
        });
      }
    } else {
      videoRef.current.pause();
    }
  }, [videoSrc, isPlaying]);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number>(0);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const [volume, setVolume] = useState(() => {
    if (localStorage.getItem('cinelens_rememberVolume') === 'true') {
      return parseFloat(localStorage.getItem('cinelens_savedVolume') || '1');
    }
    return 1;
  });
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('cinelens_muteOnStart') === 'true');
  const [playbackRate, setPlaybackRate] = useState(() => parseFloat(localStorage.getItem('cinelens_defaultSpeed') || '1'));
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showVolumeIndicator, setShowVolumeIndicator] = useState(false);
  const volumeIndicatorTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Settings State
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [autoplay, setAutoplay] = useState(() => localStorage.getItem('cinelens_autoplay') === 'true');
  const [repeat, setRepeat] = useState<'off' | 'all' | 'one'>('off');
  const [shuffle, setShuffle] = useState(false);
  const [language, setLanguage] = useState<'sv' | 'en'>(() => {
    const saved = localStorage.getItem('cinelens_language');
    return (saved === 'sv' || saved === 'en') ? saved : 'en';
  });

  const [rememberVolume, setRememberVolume] = useState(() => localStorage.getItem('cinelens_rememberVolume') === 'true');
  const [muteOnStart, setMuteOnStart] = useState(() => localStorage.getItem('cinelens_muteOnStart') === 'true');
  const [defaultSpeed, setDefaultSpeed] = useState(() => parseFloat(localStorage.getItem('cinelens_defaultSpeed') || '1'));
  const [resumePlayback, setResumePlayback] = useState(() => localStorage.getItem('cinelens_resumePlayback') === 'true');
  const [theme, setTheme] = useState<'brown' | 'dark' | 'light'>(() => {
    const saved = localStorage.getItem('cinelens_theme');
    return (saved === 'brown' || saved === 'dark' || saved === 'light') ? saved : 'brown';
  });
  const [autoHideControls, setAutoHideControls] = useState(() => parseInt(localStorage.getItem('cinelens_autoHideControls') || '0', 10));
  const [autoRemoveFinished, setAutoRemoveFinished] = useState(() => localStorage.getItem('cinelens_autoRemoveFinished') === 'true');

  useEffect(() => {
    localStorage.setItem('cinelens_language', language);
  }, [language]);

  useEffect(() => { localStorage.setItem('cinelens_autoplay', autoplay.toString()); }, [autoplay]);
  useEffect(() => { localStorage.setItem('cinelens_rememberVolume', rememberVolume.toString()); }, [rememberVolume]);
  useEffect(() => { 
    localStorage.setItem('cinelens_muteOnStart', muteOnStart.toString()); 
    setIsMuted(muteOnStart);
    if (videoRef.current) {
      videoRef.current.muted = muteOnStart;
    }
  }, [muteOnStart]);
  useEffect(() => { localStorage.setItem('cinelens_defaultSpeed', defaultSpeed.toString()); }, [defaultSpeed]);
  useEffect(() => { localStorage.setItem('cinelens_resumePlayback', resumePlayback.toString()); }, [resumePlayback]);
  useEffect(() => { localStorage.setItem('cinelens_theme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('cinelens_autoHideControls', autoHideControls.toString()); }, [autoHideControls]);
  useEffect(() => { localStorage.setItem('cinelens_autoRemoveFinished', autoRemoveFinished.toString()); }, [autoRemoveFinished]);

  const [emailCopied, setEmailCopied] = useState(false);

  useEffect(() => {
    const handleFileLoad = (filePath: string) => {
      const fileUrl = 'file:///' + filePath.replace(/\\/g, '/');
      const fileName = filePath.split('\\').pop() || filePath.split('/').pop() || 'Video';
      
      setPlaylist(prev => {
        const newItems = [{
          id: Math.random().toString(36).substring(2, 9),
          name: fileName,
          url: fileUrl
        }];
        
        if (prev.length === 0) {
          setCurrentIndex(0);
        } else {
          setCurrentIndex(prev.length);
        }
        setIsPlaying(true);
        setCurrentTime(0);
        setZoomRect(null);
        setZoomState({ scale: 1, tx: 0, ty: 0, vcX: 50, vcY: 50 });
        return [...prev, ...newItems];
      });
    };

    // Attempt to load immediately if Electron already injected the path
    const w = window as any;
    if (w.__initialVideoInfo) {
      handleFileLoad(w.__initialVideoInfo);
      w.__initialVideoInfo = null; // consume
    }

    // Listener for when Electron injects it moments after React mounts
    const onElectronFileOpened = () => {
      if (w.__initialVideoInfo) {
        handleFileLoad(w.__initialVideoInfo);
        w.__initialVideoInfo = null;
      }
    };
    window.addEventListener('electron-file-opened', onElectronFileOpened);

    // IPC Fallback
    let cleanupIpc = () => {};
    try {
      if (w.require) {
        const { ipcRenderer } = w.require('electron');
        const onIpcFile = (event: any, filePath: string) => {
          handleFileLoad(filePath);
        };
        ipcRenderer.on('open-file', onIpcFile);
        cleanupIpc = () => ipcRenderer.removeListener('open-file', onIpcFile);
      }
    } catch (e) {
      // not in electron
    }

    return () => {
      window.removeEventListener('electron-file-opened', onElectronFileOpened);
      cleanupIpc();
    };
  }, []);

  useEffect(() => {
    if (rememberVolume) {
      localStorage.setItem('cinelens_savedVolume', volume.toString());
    }
  }, [volume, rememberVolume]);

  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleMouseMove = () => {
      setIsControlsVisible(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      const hideDelay = isFullscreen ? 10000 : autoHideControls;
      
      if (hideDelay > 0) {
        controlsTimeoutRef.current = setTimeout(() => {
          if (isPlaying) {
            setIsControlsVisible(false);
          }
        }, hideDelay);
      }
    };

    const handleMouseLeave = () => {
      const hideDelay = isFullscreen ? 10000 : autoHideControls;
      if (hideDelay > 0 && isPlaying) {
        setIsControlsVisible(false);
      }
    };

    const appElement = appRef.current;
    if (appElement) {
      appElement.addEventListener('mousemove', handleMouseMove);
      appElement.addEventListener('mouseleave', handleMouseLeave);
    }

    handleMouseMove();

    return () => {
      if (appElement) {
        appElement.removeEventListener('mousemove', handleMouseMove);
        appElement.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [autoHideControls, isPlaying, isFullscreen]);

  // Save progress
  useEffect(() => {
    if (!videoSrc || !resumePlayback || currentTime === 0) return;
    const key = `cinelens_progress_${videoSrc}`;
    localStorage.setItem(key, currentTime.toString());
  }, [currentTime, videoSrc, resumePlayback]);

  // Apply default speed on new video
  useEffect(() => {
    if (videoSrc && videoRef.current) {
      videoRef.current.playbackRate = defaultSpeed;
      setPlaybackRate(defaultSpeed);
    }
  }, [videoSrc, defaultSpeed]);

  const t = translations[language];

  // Zoom Selection State
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null);
  const [zoomRect, setZoomRect] = useState<{ xPct: number; yPct: number; wPct: number; hPct: number } | null>(null);
  
  const [zoomState, setZoomState] = useState({
    scale: 1,
    tx: 0,
    ty: 0,
    vcX: 50,
    vcY: 50,
  });

  // Web Audio API for >100% volume
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const volumeRef = useRef(1);

  // Keep volumeRef in sync
  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  const initAudio = () => {
    if (!audioCtxRef.current && videoRef.current) {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext();
        audioCtxRef.current = ctx;
        const source = ctx.createMediaElementSource(videoRef.current);
        const gainNode = ctx.createGain();
        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        gainNodeRef.current = gainNode;
        gainNode.gain.value = volumeRef.current;
      } catch (e) {
        console.error("Web Audio API setup failed", e);
      }
    }
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const updateVolume = (newVol: number, showIndicator = false) => {
    newVol = Math.max(0, Math.min(1.5, newVol));
    setVolume(newVol);
    
    if (showIndicator) {
      setShowVolumeIndicator(true);
      if (volumeIndicatorTimeout.current) {
        clearTimeout(volumeIndicatorTimeout.current);
      }
      volumeIndicatorTimeout.current = setTimeout(() => {
        setShowVolumeIndicator(false);
      }, 1500);
    }
    
    if (newVol > 1) {
      initAudio();
    }
    
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newVol;
    } else if (videoRef.current) {
      videoRef.current.volume = Math.min(1, newVol);
    }

    if (newVol === 0) {
      setIsMuted(true);
      if (videoRef.current) videoRef.current.muted = true;
    } else {
      setIsMuted(false);
      if (videoRef.current) videoRef.current.muted = false;
    }
  };

  const [isAltPressed, setIsAltPressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number; tx: number; ty: number } | null>(null);

  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const [rotation, setRotation] = useState(0);
  const rotationRef = useRef(0);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    const updateRotation = () => {
      if (keysPressed.current['KeyR']) {
        if (keysPressed.current['ArrowRight']) {
          rotationRef.current += 0.1;
          setRotation(rotationRef.current);
        } else if (keysPressed.current['ArrowLeft']) {
          rotationRef.current -= 0.1;
          setRotation(rotationRef.current);
        }
      }
      requestRef.current = requestAnimationFrame(updateRotation);
    };
    requestRef.current = requestAnimationFrame(updateRotation);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const zoomRectRef = useRef(zoomRect);
  useEffect(() => {
    zoomRectRef.current = zoomRect;
  }, [zoomRect]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const lastRightArrowPressTime = useRef(0);

  // Handle File Upload
  const handleFiles = (files: FileList | File[]) => {
    const videoExtensions = ['.mp4', '.m4v', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.ogg', '.ogv', '.3gp', '.vob', '.ts', '.m2ts', '.rm', '.rmvb', '.divx', '.xvid', '.mpeg', '.mpg', '.hevc', '.av1'];
    const videoFiles = Array.from(files).filter(f => {
      if (f.type.startsWith('video/')) return true;
      const lowerName = f.name.toLowerCase();
      return videoExtensions.some(ext => lowerName.endsWith(ext));
    });
    if (videoFiles.length === 0) return;

    const newItems = videoFiles.map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      url: URL.createObjectURL(file)
    }));

    setPlaylist(prev => {
      const updated = [...prev, ...newItems];
      if (prev.length === 0) {
        setCurrentIndex(0);
        setIsPlaying(true);
        setCurrentTime(0);
        setZoomRect(null);
        setZoomState({ scale: 1, tx: 0, ty: 0, vcX: 50, vcY: 50 });
        rotationRef.current = 0;
        setRotation(0);
      }
      return updated;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const spacePressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSlowMoActive = useRef(false);
  const preSlowMoState = useRef({ wasPlaying: false, rate: 1.0 });

  // Keyboard Shortcuts (VLC style)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;
      setIsAltPressed(e.altKey);
      if (!videoRef.current) return;

      if (e.altKey) {
        e.preventDefault(); // Prevent browser menu focus
        
        // Handle ALT + 0-9 for quick zoom
        const match = e.code.match(/^(Digit|Numpad)(\d)$/);
        if (match) {
          const num = parseInt(match[2], 10);
          if (num === 0) {
            setZoomState({ scale: 1, tx: 0, ty: 0, vcX: 50, vcY: 50 });
            setZoomRect(null);
            rotationRef.current = 0;
            setRotation(0);
          } else {
            const targetScale = num * 10;
            setZoomState(prev => {
              let targetVcX = prev.vcX;
              let targetVcY = prev.vcY;
              
              if (zoomRectRef.current) {
                targetVcX = zoomRectRef.current.xPct + zoomRectRef.current.wPct / 2;
                targetVcY = zoomRectRef.current.yPct + zoomRectRef.current.hPct / 2;
              }

              // Center the target point on the screen (50%)
              let newTx = 50 - targetVcX * targetScale;
              let newTy = 50 - targetVcY * targetScale;

              newTx = Math.max(100 * (1 - targetScale), Math.min(newTx, 0));
              newTy = Math.max(100 * (1 - targetScale), Math.min(newTy, 0));
              return { ...prev, scale: targetScale, tx: newTx, ty: newTy, vcX: targetVcX, vcY: targetVcY };
            });
          }
          return;
        }
      }

      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        if (keysPressed.current['KeyR']) {
          e.preventDefault();
        } else if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
          e.preventDefault();
        }
      }

      switch (e.code) {
        case 'Space':
        case 'KeyK':
          if (!e.repeat) {
            preSlowMoState.current = {
              wasPlaying: !videoRef.current.paused,
              rate: videoRef.current.playbackRate
            };
            spacePressTimer.current = setTimeout(() => {
              isSlowMoActive.current = true;
              if (videoRef.current) {
                videoRef.current.playbackRate = 0.25;
                setPlaybackRate(0.25);
                if (videoRef.current.paused) {
                  initAudio();
                  videoRef.current.play().catch(console.error);
                  setIsPlaying(true);
                }
              }
            }, 250);
          }
          break;
        case 'KeyS':
          stopVideo();
          break;
        case 'ArrowRight':
          if (keysPressed.current['KeyR']) {
            e.preventDefault();
            break;
          }
          if (e.altKey) {
            if (!e.repeat) {
              const now = Date.now();
              if (now - lastRightArrowPressTime.current < 400) {
                videoRef.current.playbackRate = 2.0;
                setPlaybackRate(2.0);
              } else {
                videoRef.current.playbackRate = 1.5;
                setPlaybackRate(1.5);
              }
              lastRightArrowPressTime.current = now;
            }
          } else {
            videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 10);
          }
          break;
        case 'ArrowLeft':
          if (keysPressed.current['KeyR']) {
            e.preventDefault();
            break;
          }
          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
          break;
        case 'ArrowUp':
          if (keysPressed.current['KeyR']) {
            e.preventDefault();
            rotationRef.current = 180;
            setRotation(180);
            break;
          }
          updateVolume(volumeRef.current + 0.05, true);
          break;
        case 'ArrowDown':
          if (keysPressed.current['KeyR']) {
            e.preventDefault();
            rotationRef.current = 0;
            setRotation(0);
            break;
          }
          updateVolume(volumeRef.current - 0.05, true);
          break;
        case 'KeyM':
          toggleMute();
          break;
        case 'KeyF':
          toggleFullscreen();
          break;
        case 'Equal':
        case 'NumpadAdd':
          setZoomState(prev => {
            const newScale = Math.min(prev.scale * 1.2, 10);
            return { ...prev, scale: newScale };
          });
          break;
        case 'Minus':
        case 'NumpadSubtract':
          setZoomState(prev => {
            const newScale = Math.max(prev.scale / 1.2, 1);
            let newTx = prev.tx;
            let newTy = prev.ty;
            if (newScale === 1) {
              newTx = 0;
              newTy = 0;
            } else {
              newTx = Math.max(100 * (1 - newScale), Math.min(newTx, 0));
              newTy = Math.max(100 * (1 - newScale), Math.min(newTy, 0));
            }
            return { ...prev, scale: newScale, tx: newTx, ty: newTy };
          });
          break;
        case 'KeyZ':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setZoomState({ scale: 1, tx: 0, ty: 0, vcX: 50, vcY: 50 });
          }
          break;
        case 'Digit0':
        case 'Numpad0':
          if (keysPressed.current['KeyR']) {
            e.preventDefault();
            rotationRef.current = 0;
            setRotation(0);
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
      setIsAltPressed(e.altKey);
      if (!videoRef.current) return;

      if (e.code === 'Space' || e.code === 'KeyK') {
        if (spacePressTimer.current) {
          clearTimeout(spacePressTimer.current);
          spacePressTimer.current = null;
        }
        if (isSlowMoActive.current) {
          isSlowMoActive.current = false;
          videoRef.current.playbackRate = preSlowMoState.current.rate;
          setPlaybackRate(preSlowMoState.current.rate);
          if (!preSlowMoState.current.wasPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        } else {
          togglePlay();
        }
      }

      if (e.code === 'ArrowRight' || e.code === 'AltLeft' || e.code === 'AltRight') {
        if (videoRef.current.playbackRate !== 1.0) {
          videoRef.current.playbackRate = 1.0;
          setPlaybackRate(1.0);
        }
      }
    };

    const handleBlur = () => {
      keysPressed.current = {};
      setIsAltPressed(false);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Wheel to Zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (zoomRectRef.current) {
        e.preventDefault();
        setZoomState(prev => {
          // Use a multiplier for faster zooming up to 100x
          const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
          let newScale = prev.scale * zoomFactor;
          newScale = Math.max(1, Math.min(newScale, 100)); // Max 100x zoom

          let newTx = prev.tx + prev.vcX * (prev.scale - newScale);
          let newTy = prev.ty + prev.vcY * (prev.scale - newScale);

          // Clamp translation so video doesn't leave the container
          newTx = Math.max(100 * (1 - newScale), Math.min(newTx, 0));
          newTy = Math.max(100 * (1 - newScale), Math.min(newTy, 0));

          return {
            ...prev,
            scale: newScale,
            tx: newTx,
            ty: newTy
          };
        });
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // Mouse Selection Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || !containerRef.current) return;

    if (e.altKey && zoomState.scale > 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY, tx: zoomState.tx, ty: zoomState.ty });
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    setStartPos({ x: xPct, y: yPct });
    setCurrentPos({ x: xPct, y: yPct });
    setIsSelecting(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    if (isPanning && panStart) {
      const rect = containerRef.current.getBoundingClientRect();
      const deltaXPct = ((e.clientX - panStart.x) / rect.width) * 100;
      const deltaYPct = ((e.clientY - panStart.y) / rect.height) * 100;

      setZoomState(prev => {
        let newTx = panStart.tx + deltaXPct;
        let newTy = panStart.ty + deltaYPct;

        newTx = Math.max(100 * (1 - prev.scale), Math.min(newTx, 0));
        newTy = Math.max(100 * (1 - prev.scale), Math.min(newTy, 0));

        const newVcX = (50 - newTx) / prev.scale;
        const newVcY = (50 - newTy) / prev.scale;

        return { ...prev, tx: newTx, ty: newTy, vcX: newVcX, vcY: newVcY };
      });
      return;
    }

    if (!isSelecting) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = (Math.max(0, Math.min(e.clientX - rect.left, rect.width)) / rect.width) * 100;
    const yPct = (Math.max(0, Math.min(e.clientY - rect.top, rect.height)) / rect.height) * 100;
    setCurrentPos({ x: xPct, y: yPct });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isPanning) {
      setIsPanning(false);
      setPanStart(null);
      return;
    }

    if (!isSelecting || !startPos || !currentPos) return;
    setIsSelecting(false);

    const width = Math.abs(startPos.x - currentPos.x);
    const height = Math.abs(startPos.y - currentPos.y);

    if (width > 1 && height > 1) {
      const x = Math.min(startPos.x, currentPos.x);
      const y = Math.min(startPos.y, currentPos.y);
      
      const scX = x + width / 2;
      const scY = y + height / 2;
      
      const vcX = (scX - zoomState.tx) / zoomState.scale;
      const vcY = (scY - zoomState.ty) / zoomState.scale;

      const vX = (x - zoomState.tx) / zoomState.scale;
      const vY = (y - zoomState.ty) / zoomState.scale;
      const vW = width / zoomState.scale;
      const vH = height / zoomState.scale;

      setZoomRect({ xPct: vX, yPct: vY, wPct: vW, hPct: vH });
      setZoomState(prev => ({ ...prev, vcX, vcY }));
    } else {
      togglePlay();
    }
    setStartPos(null);
    setCurrentPos(null);
  };

  // Video Controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        initAudio(); // Initialize audio context on first user interaction
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const stopVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      appRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) videoRef.current.currentTime = time;
  };

  const handleTimelineMouseMove = (e: React.MouseEvent<HTMLInputElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const time = percentage * duration;
    
    setHoverTime(time);
    setHoverPosition(x); // x is relative to the input element
    
    if (previewVideoRef.current) {
      previewVideoRef.current.currentTime = time;
    }
  };

  const handleTimelineMouseLeave = () => {
    setHoverTime(null);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    updateVolume(vol);
  };

  const toggleMute = () => {
    let wasMuted = false;
    setIsMuted(prev => {
      wasMuted = prev;
      const newMuted = !prev;
      if (videoRef.current) {
        videoRef.current.muted = newMuted;
      }
      return newMuted;
    });
    
    if (wasMuted && volumeRef.current === 0) {
      updateVolume(1, false);
    }

    setShowVolumeIndicator(true);
    if (volumeIndicatorTimeout.current) {
      clearTimeout(volumeIndicatorTimeout.current);
    }
    volumeIndicatorTimeout.current = setTimeout(() => {
      setShowVolumeIndicator(false);
    }, 1500);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const m = Math.floor(time / 60).toString().padStart(2, '0');
    const s = Math.floor(time % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Dynamic Styles
  let selectionBoxStyle = {};
  if (isSelecting && startPos && currentPos) {
    const x = Math.min(startPos.x, currentPos.x);
    const y = Math.min(startPos.y, currentPos.y);
    const width = Math.abs(startPos.x - currentPos.x);
    const height = Math.abs(startPos.y - currentPos.y);
    selectionBoxStyle = { left: `${x}%`, top: `${y}%`, width: `${width}%`, height: `${height}%` };
  }

  let cursorStyle = 'default';
  if (zoomState.scale > 1 && isAltPressed) {
    cursorStyle = isPanning ? 'grabbing' : 'grab';
  } else if (isSelecting) {
    cursorStyle = 'crosshair';
  }

  let transformStyle: React.CSSProperties = {};
  if (zoomState.scale > 1 || zoomState.tx !== 0 || zoomState.ty !== 0 || rotation !== 0) {
    transformStyle = {
      transform: `translate(${zoomState.tx}%, ${zoomState.ty}%) scale(${zoomState.scale}) translate(50%, 50%) rotate(${rotation}deg) translate(-50%, -50%)`,
      transformOrigin: `0 0`,
      transition: (isSelecting || keysPressed.current['KeyR']) ? 'none' : 'transform 0.1s ease-out'
    };
  }

  return (
    <div 
      className={`flex h-screen bg-theme-bg text-theme-text font-sans select-none overflow-hidden theme-${theme}`} 
      ref={appRef}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Main Player Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Video Area */}
        <div 
          className="flex-1 relative overflow-hidden flex items-center justify-center bg-black"
        ref={containerRef}
        style={{ cursor: cursorStyle }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={toggleFullscreen}
      >
        {!videoSrc ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="flex flex-col items-center max-w-md w-full mx-4 text-center">
              <div className="w-full max-w-[448px] h-auto mb-8 flex items-center justify-center">
                <CustomLogo size={448} className="opacity-90 object-contain" />
              </div>
              
              <p className="text-theme-text-muted mb-8 text-sm leading-relaxed">
                {t.dropFiles}
              </p>
              
              <label className="cursor-pointer bg-theme-primary hover:bg-theme-hover text-white px-6 py-2.5 rounded-md font-medium text-sm transition-colors flex items-center gap-2 shadow-sm">
                <FileVideo size={18} />
                <span>{t.chooseFiles}</span>
                <input type="file" accept="video/*,.mkv,.avi,.mov,.wmv,.flv,.webm,.ogg,.ogv,.3gp,.vob,.ts,.m2ts,.rm,.rmvb,.divx,.xvid,.mpeg,.mpg,.m4v,.hevc,.av1" multiple className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              src={videoSrc}
              muted={isMuted}
              className="w-full h-full object-contain"
              style={transformStyle}
              onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  videoRef.current.volume = Math.min(1, volume);
                  videoRef.current.muted = isMuted;
                }
                setDuration(videoRef.current?.duration || 0);
                if (resumePlayback && videoSrc) {
                  const savedTime = localStorage.getItem(`cinelens_progress_${videoSrc}`);
                  if (savedTime && videoRef.current) {
                    const parsedTime = parseFloat(savedTime);
                    if (parsedTime > 0 && parsedTime < (videoRef.current.duration - 2)) {
                      videoRef.current.currentTime = parsedTime;
                    }
                  }
                }
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => {
                if (repeat === 'one') {
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                    videoRef.current.play();
                  }
                  return;
                }

                let nextIndex = currentIndex;
                let shouldPlay = autoplay;

                if (autoRemoveFinished) {
                  const newLength = playlist.length - 1;
                  if (newLength === 0) {
                    shouldPlay = false;
                    nextIndex = 0;
                  } else if (shuffle) {
                    nextIndex = Math.floor(Math.random() * newLength);
                  } else if (currentIndex >= newLength) {
                    if (repeat === 'all') {
                      nextIndex = 0;
                    } else {
                      nextIndex = Math.max(0, newLength - 1);
                      shouldPlay = false;
                    }
                  }
                  
                  setPlaylist(prev => prev.filter((_, i) => i !== currentIndex));
                  setCurrentIndex(nextIndex);
                  setIsPlaying(shouldPlay);
                  return;
                }

                if (autoplay) {
                  if (shuffle && playlist.length > 1) {
                    let nextIndex;
                    do {
                      nextIndex = Math.floor(Math.random() * playlist.length);
                    } while (nextIndex === currentIndex);
                    setCurrentIndex(nextIndex);
                    setIsPlaying(true);
                  } else if (currentIndex < playlist.length - 1) {
                    setCurrentIndex(currentIndex + 1);
                    setIsPlaying(true);
                  } else if (repeat === 'all') {
                    if (playlist.length <= 1) {
                      if (videoRef.current) {
                        videoRef.current.currentTime = 0;
                        videoRef.current.play();
                      }
                    } else {
                      setCurrentIndex(0);
                      setIsPlaying(true);
                    }
                  } else {
                    setIsPlaying(false);
                  }
                } else {
                  setIsPlaying(false);
                }
              }}
            />
            
            {/* Selection Box */}
            {isSelecting && startPos && currentPos && (
              <div 
                className="absolute border-2 border-theme-primary bg-theme-primary/20 pointer-events-none"
                style={selectionBoxStyle}
              />
            )}

            {/* Zoom Indicator Box */}
            {zoomRect && !isSelecting && (
              <div 
                className="absolute border-2 border-blue-500/50 bg-blue-500/10 pointer-events-none transition-all duration-100 ease-out"
                style={{
                  left: `${zoomRect.xPct * zoomState.scale + zoomState.tx}%`,
                  top: `${zoomRect.yPct * zoomState.scale + zoomState.ty}%`,
                  width: `${zoomRect.wPct * zoomState.scale}%`,
                  height: `${zoomRect.hPct * zoomState.scale}%`,
                }}
              />
            )}

            {/* Top Right Indicators */}
            <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-50 pointer-events-none">
              {/* 1.5x Speed Indicator */}
              {playbackRate > 1 && (
                <div className="bg-theme-bg/80 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm font-bold text-theme-text flex items-center gap-2 shadow-sm border border-theme-border">
                  <SkipForward size={16} />
                  {playbackRate}x Speed
                </div>
              )}
              
              {/* Volume Indicator Overlay */}
              {showVolumeIndicator && (
                <div className="bg-theme-bg/80 backdrop-blur-sm px-4 py-2 rounded-lg text-theme-text flex items-center gap-2 transition-opacity duration-300 shadow-sm border border-theme-border">
                  {volume === 0 || isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                  <span className="text-xl font-bold">{Math.round(volume * 100)}%</span>
                </div>
              )}
            </div>

            {/* Zoom Scale Indicator */}
            {(zoomState.scale > 1 || rotation !== 0) && (
              <div className="absolute top-4 left-4 bg-theme-bg/80 backdrop-blur-sm px-4 py-2 rounded-lg text-theme-text flex items-center gap-2 z-50 shadow-sm border border-theme-border">
                {zoomState.scale > 1 && <span className="text-xl font-bold">Zoom: {zoomState.scale.toFixed(1)}x</span>}
                {zoomState.scale > 1 && rotation !== 0 && <span className="text-xl font-bold text-theme-text-muted">|</span>}
                {rotation !== 0 && <span className="text-xl font-bold">Rot: {(((rotation % 360) + 360) % 360).toFixed(1)}&deg;</span>}
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setZoomState({ scale: 1, tx: 0, ty: 0, vcX: 50, vcY: 50 }); 
                    setZoomRect(null); 
                    rotationRef.current = 0;
                    setRotation(0);
                  }}
                  className="ml-2 hover:text-theme-accent transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Controls */}
      <div className={`bg-theme-bg border-t border-theme-border p-2 flex flex-col gap-2 shrink-0 transition-opacity duration-300 ${!isControlsVisible ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {/* Timeline */}
        <div className="flex items-center gap-2 px-2 relative group">
          {hoverTime !== null && (
            <div 
              className="absolute bottom-full mb-2 -translate-x-1/2 bg-theme-bg border border-theme-border rounded-lg shadow-xl overflow-hidden z-50 pointer-events-none"
              style={{ left: `calc(0.5rem + ${hoverPosition}px)` }}
            >
              <video 
                ref={previewVideoRef}
                src={videoSrc || undefined}
                className="w-40 h-auto object-contain bg-black"
                muted
                playsInline
              />
              <div className="text-center text-xs text-theme-text font-mono py-1 bg-theme-bg-tertiary">
                {formatTime(hoverTime)}
              </div>
            </div>
          )}
          <input 
            type="range" 
            min="0" 
            max={duration || 100} 
            value={currentTime} 
            onChange={handleTimeChange}
            onMouseMove={handleTimelineMouseMove}
            onMouseLeave={handleTimelineMouseLeave}
            className="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-theme-primary hover:h-2 transition-all"
          />
        </div>
        
        {/* Buttons */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="hover:text-theme-accent transition-colors">
              {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current" />}
            </button>
            <button onClick={stopVideo} className="hover:text-theme-accent transition-colors">
              <Square size={16} className="fill-current" />
            </button>
            <button onClick={() => { if(videoRef.current) videoRef.current.currentTime -= 10; }} className="hover:text-theme-accent transition-colors">
              <SkipBack size={20} />
            </button>
            <button onClick={() => { if(videoRef.current) videoRef.current.currentTime += 10; }} className="hover:text-theme-accent transition-colors">
              <SkipForward size={20} />
            </button>
            
            <button 
              onClick={() => setShuffle(!shuffle)} 
              className={`transition-colors ${shuffle ? 'text-theme-accent' : 'text-theme-text hover:text-theme-accent'}`}
              title={shuffle ? "Shuffle On" : "Shuffle Off"}
            >
              <Shuffle size={20} />
            </button>

            <button 
              onClick={() => {
                if (repeat === 'off') setRepeat('all');
                else if (repeat === 'all') setRepeat('one');
                else setRepeat('off');
              }} 
              className={`transition-colors ${repeat !== 'off' ? 'text-theme-accent' : 'text-theme-text hover:text-theme-accent'}`}
              title={`Repeat: ${repeat}`}
            >
              {repeat === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
            </button>
            
            <div className="text-xs font-mono text-theme-text-muted ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 group">
              <button onClick={toggleMute} className="hover:text-theme-accent transition-colors">
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input 
                type="range" 
                min="0" 
                max="1.5" 
                step="0.05" 
                value={isMuted ? 0 : volume} 
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-theme-primary opacity-0 group-hover:opacity-100 transition-opacity"
              />
              <span className="text-xs font-mono text-theme-text-muted w-10 opacity-0 group-hover:opacity-100 transition-opacity">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>
            <button onClick={toggleFullscreen} className="hover:text-theme-accent transition-colors">
              <Maximize size={20} />
            </button>
            <button 
              onClick={() => setShowPlaylist(!showPlaylist)} 
              className={`transition-colors ${showPlaylist ? 'text-theme-primary hover:text-theme-accent' : 'text-theme-text hover:text-theme-accent'}`}
              title={t.togglePlaylist}
            >
              <ListVideo size={20} />
            </button>
            <button 
              onClick={() => setShowSettingsModal(true)} 
              className="text-theme-text hover:text-theme-accent transition-colors"
              title={t.settings}
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </div>
      </div>
      
      {/* Playlist Sidebar */}
      <div className={`bg-theme-bg-secondary flex flex-col shrink-0 z-20 transition-all duration-300 ease-in-out overflow-hidden ${(showPlaylist && !isFullscreen) ? 'w-80 border-l border-theme-border' : 'w-0 border-none'}`}>
        <div className="w-80 h-full flex flex-col">
          <button 
            onClick={() => setShowPlaylist(false)}
            className="p-5 border-b border-theme-border flex items-center gap-3 hover:bg-theme-bg-tertiary transition-colors cursor-pointer w-full text-left"
            title={t.hidePlaylist}
          >
            <ListVideo size={20} className="text-theme-primary" />
            <h2 className="font-semibold text-sm tracking-wide text-theme-text uppercase">{t.playlist}</h2>
          </button>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {playlist.length === 0 ? (
            <div className="text-theme-text-muted text-sm text-center mt-10 p-6 border-2 border-dashed border-theme-border rounded-xl flex flex-col items-center gap-4">
              <FileVideo size={32} className="text-theme-text-muted" />
              <p>{t.dropPlaylist}</p>
            </div>
          ) : (
            playlist.map((item, idx) => (
              <div 
                key={item.id}
                onClick={() => {
                  setCurrentIndex(idx);
                  setIsPlaying(true);
                }}
                className={`p-3 rounded-lg cursor-pointer text-sm truncate transition-all flex items-center gap-3 group ${idx === currentIndex ? 'bg-theme-primary text-theme-primary-text font-medium shadow-md' : 'hover:bg-theme-bg-tertiary text-theme-text-muted'}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs ${idx === currentIndex ? 'bg-black/20' : 'bg-theme-bg-tertiary group-hover:bg-theme-border'}`}>
                  {idx === currentIndex && isPlaying ? <Play size={10} className="ml-0.5" /> : idx + 1}
                </div>
                <span className="truncate">{item.name}</span>
                <button 
                  className="ml-auto opacity-0 group-hover:opacity-100 hover:text-theme-accent p-1 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    URL.revokeObjectURL(item.url);
                    setPlaylist(prev => prev.filter(p => p.id !== item.id));
                    if (idx === currentIndex) {
                      if (idx < playlist.length - 1) {
                        // stays same index, but points to next item
                      } else {
                        setCurrentIndex(Math.max(0, playlist.length - 2));
                      }
                    } else if (idx < currentIndex) {
                      setCurrentIndex(currentIndex - 1);
                    }
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
        </div>
      </div>
      
      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-theme-bg-secondary rounded-xl w-full max-w-md border border-theme-border shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-theme-border">
              <h2 className="text-xl font-semibold text-theme-text">{t.settings}</h2>
              <button onClick={() => setShowSettingsModal(false)} className="text-theme-text-muted hover:text-theme-text transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 space-y-6 flex-1 overflow-y-auto">
              {/* Språk */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-theme-text">{t.language}</h3>
                <div className="relative w-32">
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'sv' | 'en')}
                    className="w-full appearance-none bg-theme-bg border border-theme-border text-theme-text text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary/50 cursor-pointer"
                  >
                    <option value="sv" className="bg-theme-bg text-theme-text">Svenska</option>
                    <option value="en" className="bg-theme-bg text-theme-text">English</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-text-muted pointer-events-none" />
                </div>
              </div>

              {/* Uppspelning */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-theme-text">{t.playback}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-theme-text">{t.autoplay}</span>
                  <button 
                    onClick={() => setAutoplay(!autoplay)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${autoplay ? 'bg-theme-primary' : 'bg-theme-bg-tertiary border border-theme-border'}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${autoplay ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-theme-text">{t.rememberVolume}</span>
                  <button 
                    onClick={() => setRememberVolume(!rememberVolume)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${rememberVolume ? 'bg-theme-primary' : 'bg-theme-bg-tertiary border border-theme-border'}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${rememberVolume ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-theme-text">{t.muteOnStart}</span>
                  <button 
                    onClick={() => setMuteOnStart(!muteOnStart)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${muteOnStart ? 'bg-theme-primary' : 'bg-theme-bg-tertiary border border-theme-border'}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${muteOnStart ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-theme-text">{t.resumePlayback}</span>
                  <button 
                    onClick={() => setResumePlayback(!resumePlayback)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${resumePlayback ? 'bg-theme-primary' : 'bg-theme-bg-tertiary border border-theme-border'}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${resumePlayback ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-theme-text">{t.defaultSpeed}</span>
                  <div className="relative w-24">
                    <select 
                      value={defaultSpeed}
                      onChange={(e) => setDefaultSpeed(parseFloat(e.target.value))}
                      className="w-full appearance-none bg-theme-bg border border-theme-border text-theme-text text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary/50 cursor-pointer"
                    >
                      <option value="0.5" className="bg-theme-bg text-theme-text">0.5x</option>
                      <option value="1" className="bg-theme-bg text-theme-text">1.0x</option>
                      <option value="1.25" className="bg-theme-bg text-theme-text">1.25x</option>
                      <option value="1.5" className="bg-theme-bg text-theme-text">1.5x</option>
                      <option value="2" className="bg-theme-bg text-theme-text">2.0x</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-text-muted pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Spellista */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-theme-text">{t.playlistSettings}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-theme-text">{t.autoRemoveFinished}</span>
                  <button 
                    onClick={() => setAutoRemoveFinished(!autoRemoveFinished)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${autoRemoveFinished ? 'bg-theme-primary' : 'bg-theme-bg-tertiary border border-theme-border'}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${autoRemoveFinished ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              {/* Tangentbordsgenvägar */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-theme-text">{t.shortcuts}</h3>
                <button 
                  onClick={() => setShowShortcutsModal(true)}
                  className="w-full bg-theme-primary hover:bg-theme-hover text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
                >
                  {t.showShortcuts}
                </button>
              </div>
            </div>

            <div className="p-5 border-t border-theme-border text-center space-y-2">
              <div className="text-xs text-theme-text-muted">{t.about} • {t.version} 1.0.0</div>
              <div className="text-xs text-theme-text-muted">
                Created 2026 by © nRn World<br/>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <a href="mailto:bynrnworld@gmail.com" className="hover:text-theme-text transition-colors">bynrnworld@gmail.com</a>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText('bynrnworld@gmail.com');
                      setEmailCopied(true);
                      setTimeout(() => setEmailCopied(false), 2000);
                    }}
                    className="text-theme-text-muted hover:text-theme-text transition-colors"
                    title={t.copyEmail}
                  >
                    {emailCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shortcuts Modal */}
      {showShortcutsModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-theme-bg rounded-xl w-full max-w-lg border border-theme-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-theme-border shrink-0">
              <h2 className="text-xl font-semibold text-theme-text">{t.shortcuts}</h2>
              <button onClick={() => setShowShortcutsModal(false)} className="text-theme-text-muted hover:text-theme-text transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-2 overflow-y-auto">
              <div className="flex flex-col">
                {[
                  { keys: ['Space', '/', 'K'], desc: t.scPlayPause },
                  { keys: ['S'], desc: t.scStop },
                  { keys: ['F'], desc: t.scFullscreen },
                  { keys: ['M'], desc: t.scMute },
                  { keys: ['↑'], desc: t.scVolUp },
                  { keys: ['↓'], desc: t.scVolDown },
                  { keys: ['←'], desc: t.scBackward },
                  { keys: ['→'], desc: t.scForward },
                  { keys: ['Alt', '+', '→'], desc: t.scFastForward },
                  { keys: ['Alt', '+', '→', '→'], desc: t.scFastForward2x },
                  { keys: ['+', '/', '='], desc: t.scZoomIn },
                  { keys: ['-'], desc: t.scZoomOut },
                  { keys: ['Ctrl', '+', 'Z'], desc: t.scResetZoom },
                  { keys: ['R', '+', '→'], desc: t.scRotateRight },
                  { keys: ['R', '+', '←'], desc: t.scRotateLeft },
                  { keys: ['R', '+', '↑'], desc: t.scRotate180 },
                  { keys: ['R', '+', '↓', '/', '0'], desc: t.scRotate0 },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 hover:bg-theme-bg-tertiary rounded-lg transition-colors">
                    <div className="flex items-center gap-1.5">
                      {item.keys.map((k, i) => (
                        k === '/' || k === '+' ? (
                          <span key={i} className="text-theme-text-muted text-sm px-1">{k}</span>
                        ) : (
                          <kbd key={i} className="bg-theme-bg-tertiary border border-theme-border text-theme-text text-xs px-2 py-1 rounded shadow-sm font-mono">
                            {k}
                          </kbd>
                        )
                      ))}
                    </div>
                    <span className="text-sm text-theme-text">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
