import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ContextMenu } from './ContextMenu';
import { Play, Pause, Square, SkipBack, SkipForward, Volume2, VolumeX, Maximize, FileVideo, X, Film, ListVideo, Trash2, Settings, ChevronDown, Copy, Check, Repeat, Repeat1, Shuffle, Monitor, LogOut, Search, Grid, Heart, Key, Captions, Upload, Camera, SlidersHorizontal, Tv2, Activity, FolderPlus, FolderEdit, FolderMinus, FolderOpen, MoreVertical, Edit3 } from 'lucide-react';
import Hls from 'hls.js';

const translations = {
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
    dropFiles: "Drag and drop one or more video files here to start watching.",
    chooseFiles: "Choose video files",
    openUrl: "Open URL",
    openUrlPlaceholder: "Paste video or stream URL...",
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
    scFastForward2x: "Fast forward (2.0x) - double tap",
    scZoomIn: "Zoom in",
    scZoomOut: "Zoom out",
    scResetZoom: "Reset zoom",
    scRotateRight: "Rotate right",
    scRotateLeft: "Rotate left",
    scRotate180: "Rotate 180°",
    scRotate0: "Reset rotation",
    scScreenshot: "Screenshot",
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
    playlistSettings: "Playlist",
    autoRemoveFinished: "Auto-remove finished videos",
    iptvQuality: "IPTV Default Quality",
    iptvQualityAuto: "Auto (Recommended)",
    screenshotSaved: "Screenshot saved!",
    equalizer: "Equalizer",
    epg: "TV Guide",
    epgUrl: "EPG URL",
    epgNow: "Now",
    deleteFavorites: "Delete all favorites",
    deleteFavoritesConfirm: "Are you sure you want to delete the Favorites category?",
    epgNext: "Next",
    epgNoData: "No guide data",
    epgLoading: "Loading guide...",
    play: "Play",
    pause: "Pause",
    stop: "Stop",
    previous: "Previous",
    nextVideo: "Next Video",
    exitApp: "Exit",
    fullscreen: "Fullscreen",
    windowscreen: "Window Mode",
    iptv: "IPTV",
    files: "Files",
    login: "Login",
    url: "Server URL",
    username: "Username",
    password: "Password",
    connect: "Connect",
    categories: "Categories",
    searching: "Searching...",
    noChannels: "No channels found",
    logout: "Logout",
    streams: "Streams",
    all: "All",
    searchPlaceholder: "Search...",
    iptvLoginRequired: "Please login to view IPTV channels.",
    live: "Live TV",
    movies: "Movies",
    series: "Series",
    itemsPerPage: "Channels per page",
    seasons: "Seasons",
    episodes: "Episodes",
    loadingInfo: "Loading...",
    allCategories: "All Categories",
    newCategoryLabel: "New Category",
    enterCategoryName: "Enter new category name:",
    categoryExists: "Category already exists",
    deleteCategoryConfirm: 'Are you sure you want to delete category "{name}"?',
    enterNewName: "Enter new name:",
    categoryNameExists: "Category name already exists",
    emptyCategory: "Empty category",
    noFavorites: "No saved favorites or categories",
    updateAvailableTitle: "Update available",
    downloadingUpdate: "Downloading in background...",
    updateReadyTitle: "Update ready",
    restartToUpdate: "Restart to install the new version.",
    restart: "Restart",
    favoritesLabel: "Favorites",
    standardLabel: "Standard",
    noCategoriesCreated: "No categories created",
    activationCodeTitle: "Enter Activation Code",
    renderLimit: "Render Limit",
    activateAndLogin: "Activate & Login",
    loading: "Loading...",
    saveCode: "Save Code",
    shareCodeInfo: "Choose a 4-digit code to link to your login. Share the code with a friend, and they can login automatically!",
    createActivationCode: "Create Activation Code"
  },
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
    dropFiles: "Dra och släpp videofiler här för att börja titta.",
    chooseFiles: "Välj videofiler",
    openUrl: "Öppna URL",
    openUrlPlaceholder: "Klistra in video- eller ström-URL...",
    dropPlaylist: "Dra och släpp för att skapa spellista",
    scPlayPause: "Spela/Pausa (Håll för slow-mo)",
    scStop: "Stopp",
    scFullscreen: "Helskärm",
    scMute: "Tyst",
    scVolUp: "Höj volym",
    scVolDown: "Sänk volym",
    scForward: "Framåt 10s",
    scBackward: "Bakåt 10s",
    scFastForward: "Snabbspola (1.5x)",
    scFastForward2x: "Snabbspola (2.0x) - dubbelklick",
    scZoomIn: "Zooma in",
    scZoomOut: "Zooma ut",
    scResetZoom: "Återställ zoom",
    scRotateRight: "Rotera höger",
    scRotateLeft: "Rotera vänster",
    scRotate180: "Rotera 180°",
    scRotate0: "Återställ rotation",
    scScreenshot: "Skärmdump",
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
    autoHideControls: "Dölj kontroller",
    playlistSettings: "Spellista",
    autoRemoveFinished: "Ta bort spelade",
    iptvQuality: "IPTV Standardkvalitet",
    iptvQualityAuto: "Auto (Rekommenderas)",
    screenshotSaved: "Skärmdump sparad!",
    deleteFavorites: "Radera alla favoriter",
    deleteFavoritesConfirm: "Är du säker på att du vill radera Favorit kategorin?",
    equalizer: "Equalizer",
    epg: "TV-tablå",
    epgUrl: "EPG URL",
    epgNow: "Nu",
    epgNext: "Härnäst",
    epgNoData: "Ingen tablådata",
    epgLoading: "Laddar tablå...",
    play: "Spela upp",
    pause: "Pausa",
    stop: "Stoppa",
    previous: "Föregående",
    nextVideo: "Nästa Video",
    exitApp: "Avsluta",
    fullscreen: "Helskärm",
    windowscreen: "Fönsterläge",
    iptv: "IPTV",
    files: "Filer",
    login: "Logga in",
    url: "Server URL",
    username: "Användarnamn",
    password: "Lösenord",
    connect: "Anslut",
    categories: "Kategorier",
    searching: "Söker...",
    noChannels: "Inga hittades",
    logout: "Logga ut",
    streams: "Strömmar",
    all: "Alla",
    searchPlaceholder: "Sök...",
    iptvLoginRequired: "Vänligen logga in för IPTV.",
    live: "Live TV",
    movies: "Filmer",
    series: "Serier",
    itemsPerPage: "Kanaler per sida",
    seasons: "Säsonger",
    episodes: "Avsnitt",
    loadingInfo: "Laddar...",
    allCategories: "Alla Kategorier",
    newCategoryLabel: "Ny kategori",
    enterCategoryName: "Ange namn på ny kategori:",
    categoryExists: "Kategorin finns redan",
    deleteCategoryConfirm: 'Är du säker på att du vill radera kategorin "{name}"?',
    enterNewName: "Ange nytt namn:",
    categoryNameExists: "Kategorinamnet finns redan",
    emptyCategory: "Tom kategori",
    noFavorites: "Inga sparade favoriter eller kategorier",
    updateAvailableTitle: "Uppdatering tillgänglig",
    downloadingUpdate: "Laddar ner i bakgrunden...",
    updateReadyTitle: "Uppdatering klar",
    restartToUpdate: "Starta om för att installera den nya versionen.",
    restart: "Starta om",
    favoritesLabel: "Favoriter",
    standardLabel: "Standard",
    noCategoriesCreated: "Inga kategorier skapade",
    activationCodeTitle: "Ange aktiveringskod",
    renderLimit: "Renderingsgräns",
    activateAndLogin: "Aktivera & Logga in",
    loading: "Laddar...",
    saveCode: "Spara kod",
    shareCodeInfo: "Välj en 4-siffrig kod som kopplas till din inloggning. Ge koden till en vän, så kan de logga in automatiskt!",
    createActivationCode: "Skapa aktiveringskod"
  }
};

const CustomLogo = ({ className, size = 24 }: { className?: string, size?: number }) => {
  return (
    <div 
      className={`relative inline-flex items-center justify-center ${className || ''}`} 
      style={{ width: size }}
    >
      <img
        src="logo.gif"
        alt="Doggy Player Logo"
        className="w-full h-auto object-contain pointer-events-none"
      />
    </div>
  );
};

export default function App() {
  const appRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [playlist, setPlaylist] = useState<{id: string, name: string, url: string}[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoSrc = playlist[currentIndex]?.url || null;
  const [isPlaying, setIsPlaying] = useState(false);

  // Function to determine if a URL should be handled by hls.js
  const isHlsStream = (url: string) => {
    if (!url) return false;
    // Strictly target .m3u8 or player_api calls that we target with HLS
    return url.includes('.m3u8');
  };

  // Handle video source and play state changes
  useEffect(() => {
    if (!videoRef.current || !videoSrc) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      return;
    }

    const isStream = isHlsStream(videoSrc);

    if (isStream) {
      if (Hls.isSupported()) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(videoSrc);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, (_e, data) => {
          const levels = data.levels.map((l: any) => ({ height: l.height || 0, bitrate: l.bitrate || 0 }));
          setHlsLevels(levels);
          setHlsCurrentLevel(-1);
          // Apply default quality from settings (-1 = auto)
          hls.currentLevel = defaultHlsQuality;
          setHlsQuality(defaultHlsQuality);
          if (isPlaying && videoRef.current) {
            videoRef.current.play().catch(() => {});
          }
        });
        hls.on(Hls.Events.LEVEL_SWITCHED, (_e, data) => {
          setHlsCurrentLevel(data.level);
        });
        hlsRef.current = hls;

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                break;
            }
          }
        });
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        // Fallback for Safari/Mac
        videoRef.current.src = videoSrc;
      }
    } else {
      // Normal file
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      videoRef.current.src = videoSrc;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoSrc]);

  // Handle play/pause sync
  useEffect(() => {
    if (!videoRef.current || !videoSrc) return;
    
    if (isPlaying) {
      // For standard files, handle play normally
      if (!isHlsStream(videoSrc)) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Playback error:", error);
            setIsPlaying(false);
          });
        }
      } else {
        // For streams, ensure play
        videoRef.current.play().catch(() => {});
      }
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying, videoSrc]);

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
  const [defaultHlsQuality, setDefaultHlsQuality] = useState<number>(() => parseInt(localStorage.getItem('cinelens_defaultHlsQuality') || '-1', 10));

  // HLS quality
  const [hlsLevels, setHlsLevels] = useState<{ height: number; bitrate: number }[]>([]);
  const [hlsQuality, setHlsQuality] = useState<number>(-1); // -1 = auto
  const [hlsCurrentLevel, setHlsCurrentLevel] = useState<number>(-1);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const qualityMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (qualityMenuRef.current && !qualityMenuRef.current.contains(e.target as Node)) {
        setShowQualityMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const applyQuality = (level: number) => {
    setHlsQuality(level);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = level;
    }
    setShowQualityMenu(false);
  };

  const qualityLabel = (level: number) => {
    if (level === -1) return 'Auto';
    const l = hlsLevels[level];
    if (!l) return `Level ${level}`;
    return l.height > 0 ? `${l.height}p` : `${Math.round(l.bitrate / 1000)}k`;
  };

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
  useEffect(() => { localStorage.setItem('cinelens_defaultHlsQuality', defaultHlsQuality.toString()); }, [defaultHlsQuality]);

  // ---------------------------------------------------------
  // IPTV State
  // ---------------------------------------------------------
  const [sidebarMode, setSidebarMode] = useState<'files' | 'iptv'>('files');
  const [iptvMode, setIptvMode] = useState<'xtream' | 'm3u' | 'code'>(() => (localStorage.getItem('doggy_iptv_mode') as 'xtream' | 'm3u' | 'code') || 'code');
  const [iptvType, setIptvType] = useState<'live' | 'movie' | 'series'>('live');
  const [m3uSubMode, setM3uSubMode] = useState<'playlist' | 'stream'>('playlist');
  
  // Activation
  const [activationCode, setActivationCode] = useState('');
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [generateCode, setGenerateCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // App key for keyvalue.immanuel.co - completely free, no signup needed
  const KV_APP_KEY = 'bjlqbgku';

  const ACTIVATION_CODES: Record<string, { url: string; user: string; pass: string }> = {
    "6923": { url: "http://premiumtest.tr:8080", user: "hBHCQDmz", pass: "ggY6RMm" }
  };

  // Helper: encode JSON to URL-safe base64
  const encodeForKV = (obj: object): string => {
    const json = JSON.stringify(obj);
    const b64 = btoa(unescape(encodeURIComponent(json)));
    // Replace + with -, / with _ and strip = padding
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  };

  // Helper: decode URL-safe base64 back to object
  const decodeFromKV = (raw: string): any => {
    const cleaned = raw.replace(/"/g, '').trim();
    // Restore standard base64: - → +, _ → /
    const padLen = (4 - (cleaned.length % 4)) % 4;
    const padded = cleaned.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(padLen);
    try {
      const json = decodeURIComponent(escape(atob(padded)));
      return JSON.parse(json);
    } catch {
      return null;
    }
  };

  const handleActivationLogin = async () => {
    if (!activationCode.trim()) return;
    setIsIptvLoading(true);
    
    try {
      const { ipcRenderer } = (window as any).require('electron');
      const creds = ACTIVATION_CODES[activationCode.trim()];
      if (creds) {
        setXtreamUrl(creds.url); setXtreamUser(creds.user); setXtreamPass(creds.pass);
        localStorage.setItem('doggy_xtream_url', creds.url);
        localStorage.setItem('doggy_xtream_user', creds.user);
        localStorage.setItem('doggy_xtream_pass', creds.pass);
        setIptvMode('xtream');
        await handleXtreamLogin(false, creds.url, creds.user, creds.pass);
        setIsIptvLoading(false);
        return;
      }
      
      // Fetch from keyvalue.immanuel.co
      const raw = await ipcRenderer.invoke('iptv-fetch', `https://keyvalue.immanuel.co/api/KeyVal/GetValue/${KV_APP_KEY}/${activationCode.trim()}`);
      
      if (raw && typeof raw === 'string' && raw.trim() !== '' && raw.trim() !== '""') {
        const data = decodeFromKV(raw);
        if (data && data.url && data.user && data.pass) {
          setXtreamUrl(data.url); setXtreamUser(data.user); setXtreamPass(data.pass);
          localStorage.setItem('doggy_xtream_url', data.url);
          localStorage.setItem('doggy_xtream_user', data.user);
          localStorage.setItem('doggy_xtream_pass', data.pass);
          setIptvMode('xtream');
          await handleXtreamLogin(false, data.url, data.user, data.pass);
          return;
        }
      }
      alert("Invalid Activation Code or not found.");
    } catch (e) {
      console.error('Activation error:', e);
      alert("Invalid Activation Code or not found.");
    } finally {
      setIsIptvLoading(false);
    }
  };

  const handleCreateCode = async () => {
    if (!generateCode || generateCode.length !== 4) return alert("Code must be 4 digits");
    if (!xtreamUrl || !xtreamUser || !xtreamPass) return alert("Logga in med Xtream först innan du skapar en kod.");
    setIsGenerating(true);
    try {
       const { ipcRenderer } = (window as any).require('electron');
       
       // Encode credentials as URL-safe base64 (handles :// and special chars in URLs)
       const encoded = encodeForKV({ url: xtreamUrl, user: xtreamUser, pass: xtreamPass });
       
       // Store via keyvalue.immanuel.co
       const result = await ipcRenderer.invoke('iptv-fetch', `https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/${KV_APP_KEY}/${generateCode}/${encoded}`);
       
       if (result === true || String(result).toLowerCase() === 'true') {
          alert(`✅ Kod ${generateCode} är nu aktiv!\n\nDela den med dina vänner – de loggar in via Code-fliken!`);
          setShowCodeModal(false);
          setGenerateCode('');
       } else {
          alert("Koden kunde inte sparas. Försök igen.");
       }
    } catch (err) {
       console.error("Save code error:", err);
       alert("Koden kunde inte sparas. Kontrollera anslutningen.");
    } finally {
       setIsGenerating(false);
    }
  };
  
  // Xtream
  const [xtreamUrl, setXtreamUrl] = useState(() => localStorage.getItem('doggy_xtream_url') || '');
  const [xtreamUser, setXtreamUser] = useState(() => localStorage.getItem('doggy_xtream_user') || '');
  const [xtreamPass, setXtreamPass] = useState(() => localStorage.getItem('doggy_xtream_pass') || '');
  
  // M3U
  const [m3uUrl, setM3uUrl] = useState(() => localStorage.getItem('doggy_m3u_url') || '');

  const [isIptvLogged, setIsIptvLogged] = useState(() => localStorage.getItem('doggy_iptv_logged') === 'true');
  const [iptvCategories, setIptvCategories] = useState<{id: string, name: string}[]>([]);
  const [iptvLiveCategories, setIptvLiveCategories] = useState<{id: string, name: string}[]>([]);
  const [iptvMovieCategories, setIptvMovieCategories] = useState<{id: string, name: string}[]>([]);
  const [iptvSeriesCategories, setIptvSeriesCategories] = useState<{id: string, name: string}[]>([]);
  const [iptvStreams, setIptvStreams] = useState<{id: string, name: string, icon: string, category_id: string, url: string, ext?: string}[]>([]);
  const [iptvMovies, setIptvMovies] = useState<{id: string, name: string, icon: string, category_id: string, url: string, ext?: string}[]>([]);
  const [iptvSeries, setIptvSeries] = useState<{id: string, name: string, icon: string, category_id: string, url: string, ext?: string}[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | 'all'>('all');
  const [iptvSearch, setIptvSearch] = useState('');
  const [isIptvLoading, setIsIptvLoading] = useState(false);
  const [iptvLimit, setIptvLimit] = useState(() => parseInt(localStorage.getItem('doggy_iptv_limit') || '100'));
  const [selectedSeriesInfo, setSelectedSeriesInfo] = useState<any>(null);
  const [isSeriesInfoLoading, setIsSeriesInfoLoading] = useState(false);
  const [showIptvOverlay, setShowIptvOverlay] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  interface FavoriteFolder { name: string; items: string[]; }
  const [favorites, setFavorites] = useState<string[]>(() => JSON.parse(localStorage.getItem('doggy_iptv_favorites') || '[]'));
  const [favoriteFolders, setFavoriteFolders] = useState<FavoriteFolder[]>(() => JSON.parse(localStorage.getItem('doggy_iptv_folders') || '[]'));
  const [isSyncing, setIsSyncing] = useState(false);
  const [moveMenu, setMoveMenu] = useState<{ id: string; x: number; y: number } | null>(null);

  useEffect(() => {
    // Favorites handled by sync block
  }, [favorites]);
  const getSyncKey = () => {
    const mainIdentity = xtreamUrl ? `${xtreamUrl}|${xtreamUser}` : m3uUrl;
    if (!mainIdentity) return null;
    return `favs_${btoa(unescape(encodeURIComponent(mainIdentity))).replace(/[^a-zA-Z0-9]/g, '')}`;
  };

  const saveToCloud = async (favs: string[], folders: FavoriteFolder[]) => {
    const key = getSyncKey();
    if (!key) return;
    const { ipcRenderer } = (window as any).require('electron');
    const data = encodeForKV({ items: favs, folders });
    try {
      await ipcRenderer.invoke('iptv-fetch', `https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/${KV_APP_KEY}/${key}/${data}`);
    } catch (e) {}
  };

  const loadFromCloud = async () => {
    const key = getSyncKey();
    if (!key) return;
    setIsSyncing(true);
    const { ipcRenderer } = (window as any).require('electron');
    try {
      const b64 = await ipcRenderer.invoke('iptv-fetch', `https://keyvalue.immanuel.co/api/KeyVal/GetValue/${KV_APP_KEY}/${key}`);
      if (b64 && b64 !== "Key not found") {
        const data = decodeFromKV(b64);
        if (data.items) setFavorites(data.items);
        if (data.folders) setFavoriteFolders(data.folders);
      }
    } catch (e) {}
    setIsSyncing(false);
  };

  useEffect(() => {
    localStorage.setItem('doggy_iptv_favorites', JSON.stringify(favorites));
    localStorage.setItem('doggy_iptv_folders', JSON.stringify(favoriteFolders));
    saveToCloud(favorites, favoriteFolders);
  }, [favorites, favoriteFolders]);


  const [networkPing, setNetworkPing] = useState(24);
  const [networkType, setNetworkType] = useState('LAN');
  useEffect(() => {
    const updateNetworkInfo = async () => {
      try {
        const { ipcRenderer } = (window as any).require('electron');
        const type = await ipcRenderer.invoke('get-network-info');
        if (type) setNetworkType(type);
      } catch (e) {
        const conn = (navigator as any).connection;
        if (conn) {
          if (conn.type === 'wifi') setNetworkType('Wifi');
          else if (conn.type === 'cellular') setNetworkType('4G/5G');
          else setNetworkType('LAN');
        }
      }
    };
    updateNetworkInfo();
    const interval = setInterval(() => {
      setNetworkPing(prev => Math.max(12, Math.min(80, prev + (Math.floor(Math.random() * 5) - 2))));
      updateNetworkInfo();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (videoSrc) setIsVideoLoading(true);
  }, [videoSrc]);

  useEffect(() => {
    if (showIptvOverlay && videoSrc) {
      setTimeout(() => {
        try {
          const activeId = `osd-channel-${btoa(videoSrc).replace(/[^a-zA-Z0-9]/g, '')}`;
          const el = document.getElementById(activeId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } catch (e) { /* ignore base64 errors */ }
      }, 100);
    }
  }, [showIptvOverlay, videoSrc, selectedCategoryId, iptvType]);

  
  const createFavoriteFolder = () => {
    const name = window.prompt(t.enterCategoryName);
    if (name && name.trim()) {
      if (favoriteFolders.some(f => f.name === name.trim())) return alert(t.categoryExists);
      setFavoriteFolders(prev => [...prev, { name: name.trim(), items: [] }]);
    }
  };

  const deleteFavoriteFolder = (name: string) => {
    if (window.confirm(t.deleteCategoryConfirm.replace('{name}', name))) {
      setFavoriteFolders(prev => prev.filter(f => f.name !== name));
    }
  };

  const renameFavoriteFolder = (oldName: string) => {
    const newName = window.prompt(t.enterNewName, oldName);
    if (newName && newName.trim() && newName !== oldName) {
      if (favoriteFolders.some(f => f.name === newName.trim())) return alert(t.categoryNameExists);
      setFavoriteFolders(prev => prev.map(f => f.name === oldName ? { ...f, name: newName.trim() } : f));
    }
  };

  const toggleItemInFolder = (itemId: string, folderName: string) => {
     setFavoriteFolders(prev => prev.map(f => {
       if (f.name === folderName) {
         const exists = f.items.includes(itemId);
         return { ...f, items: exists ? f.items.filter(id => id !== itemId) : [...f.items, itemId] };
       }
       return f;
     }));
  };

  const handleClearFavorites = () => {
    if (window.confirm(t.deleteFavoritesConfirm)) {
      setFavorites([]);
      setFavoriteFolders([]);
    }
  };

  const toggleFavorite = (favId: string) => {
    setFavorites(prev => prev.includes(favId) ? prev.filter(id => id !== favId) : [...prev, favId]);
  };

  useEffect(() => {
    localStorage.setItem('doggy_iptv_limit', iptvLimit.toString());
  }, [iptvLimit]);

  useEffect(() => {
    localStorage.setItem('doggy_iptv_logged', isIptvLogged.toString());
  }, [isIptvLogged]);

  useEffect(() => {
    localStorage.setItem('doggy_iptv_mode', iptvMode);
  }, [iptvMode]);
  
  // Validate on mount - restore session immediately, refresh data in background
  useEffect(() => {
    if (iptvMode === 'xtream' && xtreamUrl && xtreamUser && xtreamPass) {
      // If already marked as logged in, restore immediately without waiting for network
      if (localStorage.getItem('doggy_iptv_logged') === 'true') {
        setIsIptvLogged(true); loadFromCloud();
      }
      // Always refresh channel data in background
      handleXtreamLogin(true);
    } else if (iptvMode === 'm3u' && m3uUrl) {
      if (localStorage.getItem('doggy_iptv_logged') === 'true') {
        setIsIptvLogged(true);
      }
      handleM3ULogin(true);
    }
  }, []);

  useEffect(() => {
    if (iptvMode !== 'xtream') return;
    if (iptvType === 'live') setIptvCategories(iptvLiveCategories);
    else if (iptvType === 'movie') setIptvCategories(iptvMovieCategories);
    else if (iptvType === 'series') setIptvCategories(iptvSeriesCategories);
    setSelectedCategoryId('all');
  }, [iptvType, iptvLiveCategories, iptvMovieCategories, iptvSeriesCategories, iptvMode]);

  const fetchSeriesInfo = async (series: any) => {
    if (!series || !series.id) return;
    setIsSeriesInfoLoading(true);
    try {
      const baseUrl = xtreamUrl.endsWith('/') ? xtreamUrl.slice(0, -1) : xtreamUrl;
      const { ipcRenderer } = (window as any).require('electron');
      const data = await ipcRenderer.invoke('iptv-fetch', `${baseUrl}/player_api.php?username=${xtreamUser}&password=${xtreamPass}&action=get_series_info&series_id=${series.id}`);
      setSelectedSeriesInfo({ ...series, episodes: data.episodes || {} });
    } catch (e) {
      console.error("Fetch series info error:", e);
    } finally {
      setIsSeriesInfoLoading(false);
    }
  };

  async function handleM3ULogin(isAuto = false) {
    if (!m3uUrl) return;
    setIsIptvLoading(true);
    try {
      let text = '';
      try {
        const { ipcRenderer } = (window as any).require('electron');
        text = await ipcRenderer.invoke('iptv-fetch', m3uUrl);
      } catch (ipcErr) {
        // Fallback to normal fetch if not in electron
        const response = await fetch(m3uUrl);
        text = await response.text();
      }
      
      const lines = text.split('\n');
      const streams: any[] = [];
      const cats: Set<string> = new Set();
      let currentItem: any = null;

      for (let line of lines) {
        line = line.trim();
        if (line.startsWith('#EXTINF:')) {
          const name = line.split(',').pop() || "Unknown";
          const icon = line.match(/tvg-logo="([^"]+)"/)?.[1] || "";
          const group = line.match(/group-title="([^"]+)"/)?.[1] || "Default";
          currentItem = { name, icon, category_id: group };
          cats.add(group);
        } else if (line.startsWith('http') && currentItem) {
          currentItem.url = line;
          currentItem.id = Math.random().toString(36).substr(2, 9);
          streams.push(currentItem);
          currentItem = null;
        }
      }

      setIptvStreams(streams);
      setIptvCategories(Array.from(cats).map(c => ({ id: c, name: c })));
      setIsIptvLogged(true);
      // Always save M3U URL to keep session persistent
      localStorage.setItem('doggy_m3u_url', m3uUrl);
    } catch (e) {
      console.error("M3U Load Error:", e);
      if (!isAuto) alert("Failed to load M3U playlist. " + (e instanceof Error ? e.message : "Network error."));
    } finally {
      setIsIptvLoading(false);
    }
  }

  // Updated handleXtreamLogin to fetch VOD and set correct URLs
  async function handleXtreamLogin(isAuto = false, pUrl?: string, pUser?: string, pPass?: string) {
    const uUrl = pUrl || xtreamUrl;
    const uUser = pUser || xtreamUser;
    const uPass = pPass || xtreamPass;
    if (!uUrl || !uUser || !uPass) return;
    
    setIsIptvLoading(true);
    const baseUrl = uUrl.endsWith('/') ? uUrl.slice(0, -1) : uUrl;
    const loginUrl = `${baseUrl}/player_api.php?username=${uUser}&password=${uPass}`;
    
    try {
      const { ipcRenderer } = (window as any).require('electron');
      const data = await ipcRenderer.invoke('iptv-fetch', loginUrl);
      
      if (data.user_info && data.user_info.auth === 1) {
        setIsIptvLogged(true);
        // Important: Use direct values to avoid waiting for state update in this function
        const urlToUse = uUrl;
        const userToUse = uUser;
        const passToUse = uPass;

        setXtreamUrl(urlToUse);
        setXtreamUser(userToUse);
        setXtreamPass(passToUse);

        // Always save credentials to keep session persistent across restarts and updates
        localStorage.setItem('doggy_xtream_url', urlToUse);
        localStorage.setItem('doggy_xtream_user', userToUse);
        localStorage.setItem('doggy_xtream_pass', passToUse);

        // Fetch LIVE
        const streamData = await ipcRenderer.invoke('iptv-fetch', `${baseUrl}/player_api.php?username=${userToUse}&password=${passToUse}&action=get_live_streams`);
        if (Array.isArray(streamData)) {
          setIptvStreams(streamData.map((s: any) => ({
            id: s.stream_id,
            name: s.name,
            icon: s.stream_icon,
            category_id: s.category_id,
            url: `${baseUrl}/live/${userToUse}/${passToUse}/${s.stream_id}.m3u8` 
          })));
        }

        // Fetch MOVIES (VOD)
        const movieData = await ipcRenderer.invoke('iptv-fetch', `${baseUrl}/player_api.php?username=${userToUse}&password=${passToUse}&action=get_vod_streams`);
        if (Array.isArray(movieData)) {
          setIptvMovies(movieData.map((m: any) => ({
            id: m.stream_id,
            name: m.name,
            icon: m.stream_icon,
            category_id: m.category_id,
            ext: m.container_extension || 'mkv',
            url: `${baseUrl}/movie/${userToUse}/${passToUse}/${m.stream_id}.${m.container_extension || 'mkv'}`
          })));
        }

        // Fetch SERIES
        const seriesData = await ipcRenderer.invoke('iptv-fetch', `${baseUrl}/player_api.php?username=${userToUse}&password=${passToUse}&action=get_series`);
        if (Array.isArray(seriesData)) {
          setIptvSeries(seriesData.map((s: any) => ({
            id: s.series_id,
            name: s.name,
            icon: s.cover || s.stream_icon || "",
            category_id: s.category_id,
            url: `${baseUrl}/series/${userToUse}/${passToUse}/${s.series_id}.mkv`
          })));
        }

        // Fetch Categories
        const [liveCats, movieCats, seriesCats] = await Promise.all([
          ipcRenderer.invoke('iptv-fetch', `${baseUrl}/player_api.php?username=${userToUse}&password=${passToUse}&action=get_live_categories`),
          ipcRenderer.invoke('iptv-fetch', `${baseUrl}/player_api.php?username=${userToUse}&password=${passToUse}&action=get_vod_categories`),
          ipcRenderer.invoke('iptv-fetch', `${baseUrl}/player_api.php?username=${userToUse}&password=${passToUse}&action=get_series_categories`)
        ]);

        if (Array.isArray(liveCats)) setIptvLiveCategories(liveCats.map((c: any) => ({ id: c.category_id, name: c.category_name })));
        if (Array.isArray(movieCats)) setIptvMovieCategories(movieCats.map((c: any) => ({ id: c.category_id, name: c.category_name })));
        if (Array.isArray(seriesCats)) setIptvSeriesCategories(seriesCats.map((c: any) => ({ id: c.category_id, name: c.category_name })));
        
        // Initial setup for Live categories (default)
        if (iptvType === 'live' && Array.isArray(liveCats)) {
           setIptvCategories(liveCats.map((c: any) => ({ id: c.category_id, name: c.category_name })));
        }
      } else {
        if (!isAuto) alert("Login failed. Check your credentials.");
      }
    } catch (e: any) {
      console.error("IPTV Login Error:", e);
    } finally {
      setIsIptvLoading(false);
    }
  }

  function handleLogoutIptv() {
    setIsIptvLogged(false);
    setIptvCategories([]);
    setIptvStreams([]);
    setIptvMovies([]);
    setIptvSeries([]);
    setIptvLiveCategories([]);
    setIptvMovieCategories([]);
    setIptvSeriesCategories([]);
    setSelectedCategoryId('all');
    setIptvSearch('');
    localStorage.removeItem('doggy_iptv_logged');
    localStorage.removeItem('doggy_xtream_url');
    localStorage.removeItem('doggy_xtream_user');
    localStorage.removeItem('doggy_xtream_pass');
    localStorage.removeItem('doggy_m3u_url');
  }

  const [emailCopied, setEmailCopied] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateDownloaded, setUpdateDownloaded] = useState(false);

  useEffect(() => {
    try {
      const { ipcRenderer } = (window as any).require('electron');
      ipcRenderer.on('update-available', () => setUpdateAvailable(true));
      ipcRenderer.on('update-downloaded', () => {
        setUpdateAvailable(false);
        setUpdateDownloaded(true);
      });
      ipcRenderer.on('update-error', (_: any, msg: string) => {
        console.error('Update error:', msg);
        // Silent error to avoid annoying users with firewall/network issues
      });
    } catch {
      // not in electron
    }
  }, []);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    const handleFileLoad = (filePath: string) => {
      const fileUrl = 'file:///' + filePath.replace(/\\/g, '/');
      const fileName = filePath.split('\\').pop() || filePath.split('/').pop() || 'Video';
      
      setPlaylist(prev => {
        // Kontrollera om filen redan finns i listan (för att undvika dubbletter vid start)
        const exists = prev.find(p => p.url === fileUrl);
        if (exists) {
          const existingIndex = prev.indexOf(exists);
          setCurrentIndex(existingIndex);
          setIsPlaying(true);
          return prev;
        }

        const newItems = [{
          id: Math.random().toString(36).substring(2, 9),
          name: fileName,
          url: fileUrl
        }];
        
        setCurrentIndex(prev.length);
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
      } else {
        // Switch to first newly added file
        setCurrentIndex(prev.length);
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

  const [urlInput, setUrlInput] = useState('');

  const handleOpenUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    const name = url.split('/').pop()?.split('?')[0] || 'Stream';
    const newItem = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      url
    };
    setPlaylist(prev => {
      const updated = [...prev, newItem];
      setCurrentIndex(updated.length - 1);
      setIsPlaying(true);
      setCurrentTime(0);
      setZoomRect(null);
      setZoomState({ scale: 1, tx: 0, ty: 0, vcX: 50, vcY: 50 });
      return updated;
    });
    setUrlInput('');
  };

  // ── Subtitle state ──────────────────────────────────────────────
  interface SubCue { start: number; end: number; text: string; }
  const [subtitleCues, setSubtitleCues] = useState<SubCue[]>([]);
  const [subtitleOffset, setSubtitleOffset] = useState(0);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const subtitleMenuRef = useRef<HTMLDivElement>(null);

  // Close subtitle menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (subtitleMenuRef.current && !subtitleMenuRef.current.contains(e.target as Node)) {
        setShowSubtitleMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Reset subtitles when video changes
  useEffect(() => {
    setSubtitleCues([]);
    setSubtitleOffset(0);
    setHlsLevels([]);
    setHlsCurrentLevel(-1);
  }, [videoSrc]);

  const parseSRT = (text: string): SubCue[] => {
    const cues: SubCue[] = [];
    const blocks = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().split(/\n\s*\n/);
    const timeToSec = (t: string) => {
      const [h, m, rest] = t.split(':');
      const [s, ms] = rest.replace(',', '.').split('.');
      return parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s) + parseFloat('0.' + (ms || '0'));
    };
    for (const block of blocks) {
      const lines = block.trim().split('\n');
      const timeLine = lines.find(l => l.includes('-->'));
      if (!timeLine) continue;
      const [startStr, endStr] = timeLine.split('-->').map(s => s.trim());
      const text = lines.slice(lines.indexOf(timeLine) + 1).join('\n').replace(/<[^>]+>/g, '').trim();
      if (text) cues.push({ start: timeToSec(startStr), end: timeToSec(endStr), text });
    }
    return cues;
  };

  const parseVTT = (text: string): SubCue[] => {
    const cleaned = text.replace(/^WEBVTT.*\n?/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const timeToSec = (t: string) => {
      const parts = t.split(':');
      let h = 0, m = 0, s = 0;
      if (parts.length === 3) { h = parseInt(parts[0]); m = parseInt(parts[1]); s = parseFloat(parts[2].replace(',', '.')); }
      else { m = parseInt(parts[0]); s = parseFloat(parts[1].replace(',', '.')); }
      return h * 3600 + m * 60 + s;
    };
    const cues: SubCue[] = [];
    const blocks = cleaned.trim().split(/\n\s*\n/);
    for (const block of blocks) {
      const lines = block.trim().split('\n');
      const timeLine = lines.find(l => l.includes('-->'));
      if (!timeLine) continue;
      const [startStr, endStr] = timeLine.split('-->').map(s => s.trim().split(' ')[0]);
      const text = lines.slice(lines.indexOf(timeLine) + 1).join('\n').replace(/<[^>]+>/g, '').trim();
      if (text) cues.push({ start: timeToSec(startStr), end: timeToSec(endStr), text });
    }
    return cues;
  };

  // ASS/SSA parser
  const parseASS = (text: string): SubCue[] => {
    const cues: SubCue[] = [];
    const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    const toSec = (t: string) => {
      const [h, m, rest] = t.split(':');
      const [s, cs] = rest.split('.');
      return parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s) + parseInt(cs || '0') / 100;
    };
    let formatLine: string[] = [];
    for (const line of lines) {
      if (line.startsWith('Format:') && line.toLowerCase().includes('start')) {
        formatLine = line.replace('Format:', '').split(',').map(s => s.trim().toLowerCase());
      }
      if (line.startsWith('Dialogue:')) {
        const parts = line.replace('Dialogue:', '').split(',');
        const startIdx = formatLine.indexOf('start');
        const endIdx = formatLine.indexOf('end');
        const textIdx = formatLine.indexOf('text');
        if (startIdx < 0 || endIdx < 0) continue;
        const start = toSec(parts[startIdx]?.trim() || '0:00:00.00');
        const end = toSec(parts[endIdx]?.trim() || '0:00:00.00');
        const rawText = parts.slice(textIdx >= 0 ? textIdx : 9).join(',')
          .replace(/\{[^}]+\}/g, '').replace(/\\N/g, '\n').replace(/\\n/g, '\n').trim();
        if (rawText) cues.push({ start, end, text: rawText });
      }
    }
    return cues;
  };

  // MicroDVD .sub parser (frame-based, assumes 23.976 fps if no header)
  const parseSUB = (text: string): SubCue[] => {
    const cues: SubCue[] = [];
    let fps = 23.976;
    const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    for (const line of lines) {
      const fpsMatch = line.match(/^\{1\}\{1\}([\d.]+)/);
      if (fpsMatch) { fps = parseFloat(fpsMatch[1]); continue; }
      const match = line.match(/^\{(\d+)\}\{(\d+)\}(.+)/);
      if (!match) continue;
      const start = parseInt(match[1]) / fps;
      const end = parseInt(match[2]) / fps;
      const text = match[3].replace(/\|/g, '\n').replace(/\{[^}]+\}/g, '').trim();
      if (text) cues.push({ start, end, text });
    }
    return cues;
  };

  // SAMI .smi parser
  const parseSMI = (text: string): SubCue[] => {
    const cues: SubCue[] = [];
    const syncMatches = [...text.matchAll(/<SYNC[^>]+Start=["']?(\d+)["']?[^>]*>([\s\S]*?)(?=<SYNC|<\/BODY|$)/gi)];
    for (let i = 0; i < syncMatches.length; i++) {
      const start = parseInt(syncMatches[i][1]) / 1000;
      const end = i + 1 < syncMatches.length ? parseInt(syncMatches[i + 1][1]) / 1000 : start + 3;
      const raw = syncMatches[i][2].replace(/<[^>]+>/g, '').replace(/&nbsp;/gi, ' ').trim();
      if (raw && raw !== '&nbsp;') cues.push({ start, end, text: raw });
    }
    return cues;
  };

  const loadSubtitleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const ext = file.name.split('.').pop()?.toLowerCase();
      let cues: SubCue[] = [];
      if (ext === 'srt' || ext === 'txt') cues = parseSRT(text);
      else if (ext === 'vtt') cues = parseVTT(text);
      else if (ext === 'ass' || ext === 'ssa') cues = parseASS(text);
      else if (ext === 'sub') cues = parseSUB(text);
      else if (ext === 'smi') cues = parseSMI(text);
      if (cues.length > 0) {
        setSubtitleCues(cues);
        setSubtitleOffset(0);
        setShowSubtitleMenu(false);
      } else {
        alert('Could not parse subtitle file. Supported: .srt .vtt .ass .ssa .sub .smi .txt');
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  // Current subtitle cue
  const currentCue = useMemo(() => {
    if (!subtitleCues.length) return null;
    const t = currentTime + subtitleOffset;
    return subtitleCues.find(c => t >= c.start && t <= c.end) || null;
  }, [subtitleCues, currentTime, subtitleOffset]);

  // ── Screenshot ──────────────────────────────────────────────────
  const [screenshotFlash, setScreenshotFlash] = useState(false);

  const takeScreenshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const link = document.createElement('a');
    const name = playlist[currentIndex]?.name?.replace(/\.[^.]+$/, '') || 'screenshot';
    link.download = `${name}_${formatTime(currentTime).replace(/:/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setScreenshotFlash(true);
    setTimeout(() => setScreenshotFlash(false), 600);
  };

  // ── Equalizer ───────────────────────────────────────────────────
  const eqBassRef = useRef<BiquadFilterNode | null>(null);
  const eqMidRef = useRef<BiquadFilterNode | null>(null);
  const eqTrebleRef = useRef<BiquadFilterNode | null>(null);
  const [showEqMenu, setShowEqMenu] = useState(false);
  const [showEqSettings, setShowEqSettings] = useState(false);
  const eqMenuRef = useRef<HTMLDivElement>(null);
  const [eqBass, setEqBass] = useState(0);
  const [eqMid, setEqMid] = useState(0);
  const [eqTreble, setEqTreble] = useState(0);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (eqMenuRef.current && !eqMenuRef.current.contains(e.target as Node)) setShowEqMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initEqualizer = () => {
    if (!audioCtxRef.current || !gainNodeRef.current) return;
    if (eqBassRef.current) return; // already initialized
    const ctx = audioCtxRef.current;
    const bass = ctx.createBiquadFilter();
    bass.type = 'lowshelf'; bass.frequency.value = 200;
    const mid = ctx.createBiquadFilter();
    mid.type = 'peaking'; mid.frequency.value = 1000; mid.Q.value = 1;
    const treble = ctx.createBiquadFilter();
    treble.type = 'highshelf'; treble.frequency.value = 4000;
    // Reconnect: source → bass → mid → treble → gain → destination
    // We insert between gainNode and destination
    gainNodeRef.current.disconnect();
    gainNodeRef.current.connect(bass);
    bass.connect(mid);
    mid.connect(treble);
    treble.connect(ctx.destination);
    eqBassRef.current = bass;
    eqMidRef.current = mid;
    eqTrebleRef.current = treble;
  };

  const applyEq = (band: 'bass' | 'mid' | 'treble', value: number) => {
    initAudio();
    initEqualizer();
    if (band === 'bass') { setEqBass(value); if (eqBassRef.current) eqBassRef.current.gain.value = value; }
    if (band === 'mid') { setEqMid(value); if (eqMidRef.current) eqMidRef.current.gain.value = value; }
    if (band === 'treble') { setEqTreble(value); if (eqTrebleRef.current) eqTrebleRef.current.gain.value = value; }
  };

  const resetEq = () => { applyEq('bass', 0); applyEq('mid', 0); applyEq('treble', 0); };

  // ── EPG ─────────────────────────────────────────────────────────
  interface EpgProgram { start: number; end: number; title: string; desc?: string; }
  interface EpgChannel { [channelId: string]: EpgProgram[]; }
  const [epgData, setEpgData] = useState<EpgChannel>({});
  const [epgUrl, setEpgUrl] = useState(() => localStorage.getItem('doggy_epg_url') || '');
  const [epgLoading, setEpgLoading] = useState(false);
  const [showEpgPanel, setShowEpgPanel] = useState(false);
  const epgPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (epgPanelRef.current && !epgPanelRef.current.contains(e.target as Node)) setShowEpgPanel(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadEpg = async (url?: string) => {
    const target = (url || epgUrl).trim();
    if (!target) return;
    setEpgLoading(true);
    try {
      const { ipcRenderer } = (window as any).require('electron');
      const xml: string = await ipcRenderer.invoke('iptv-fetch', target);
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');
      const programmes = doc.querySelectorAll('programme');
      const data: EpgChannel = {};
      const parseTime = (s: string) => {
        // Format: 20240101120000 +0000
        const clean = s.replace(/\s.*/, '');
        const y = clean.slice(0,4), mo = clean.slice(4,6), d = clean.slice(6,8);
        const h = clean.slice(8,10), mi = clean.slice(10,12), sec = clean.slice(12,14);
        return new Date(`${y}-${mo}-${d}T${h}:${mi}:${sec}Z`).getTime() / 1000;
      };
      programmes.forEach(p => {
        const ch = p.getAttribute('channel') || '';
        const start = parseTime(p.getAttribute('start') || '0');
        const end = parseTime(p.getAttribute('stop') || '0');
        const title = p.querySelector('title')?.textContent || '';
        const desc = p.querySelector('desc')?.textContent || '';
        if (!data[ch]) data[ch] = [];
        data[ch].push({ start, end, title, desc });
      });
      setEpgData(data);
      localStorage.setItem('doggy_epg_url', target);
    } catch (e) {
      console.error('EPG load error:', e);
    } finally {
      setEpgLoading(false);
    }
  };

  // Auto-load EPG on mount if URL saved
  useEffect(() => {
    if (epgUrl) loadEpg(epgUrl);
  }, []);

  const getEpgForChannel = (channelName: string) => {
    const now = Date.now() / 1000;
    // Try to match by channel name (case-insensitive partial match)
    const key = Object.keys(epgData).find(k =>
      k.toLowerCase().includes(channelName.toLowerCase()) ||
      channelName.toLowerCase().includes(k.toLowerCase())
    );
    if (!key) return null;
    const programs = epgData[key];
    const current = programs.find(p => now >= p.start && now < p.end);
    const next = programs.find(p => p.start > now);
    return { current, next };
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
          if (e.altKey) {
            e.preventDefault();
            takeScreenshot();
          } else {
            stopVideo();
          }
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
      // ALT+scroll: zoom towards mouse cursor (no selection needed)
      if (e.altKey) {
        e.preventDefault();
        const rect = container.getBoundingClientRect();
        const mouseXPct = ((e.clientX - rect.left) / rect.width) * 100;
        const mouseYPct = ((e.clientY - rect.top) / rect.height) * 100;

        setZoomState(prev => {
          const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
          let newScale = prev.scale * zoomFactor;
          newScale = Math.max(1, Math.min(newScale, 100));

          // Zoom towards mouse position
          const vcX = (mouseXPct - prev.tx) / prev.scale;
          const vcY = (mouseYPct - prev.ty) / prev.scale;

          let newTx = mouseXPct - vcX * newScale;
          let newTy = mouseYPct - vcY * newScale;

          newTx = Math.max(100 * (1 - newScale), Math.min(newTx, 0));
          newTy = Math.max(100 * (1 - newScale), Math.min(newTy, 0));

          return { ...prev, scale: newScale, tx: newTx, ty: newTy, vcX, vcY };
        });
        return;
      }

      // Scroll without ALT: zoom only if selection exists
      if (zoomRectRef.current) {
        e.preventDefault();
        setZoomState(prev => {
          const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
          let newScale = prev.scale * zoomFactor;
          newScale = Math.max(1, Math.min(newScale, 100));

          let newTx = prev.tx + prev.vcX * (prev.scale - newScale);
          let newTy = prev.ty + prev.vcY * (prev.scale - newScale);

          newTx = Math.max(100 * (1 - newScale), Math.min(newTx, 0));
          newTy = Math.max(100 * (1 - newScale), Math.min(newTy, 0));

          return { ...prev, scale: newScale, tx: newTx, ty: newTy };
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
    const h = Math.floor(time / 3600);
    const m = Math.floor((time % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(time % 60).toString().padStart(2, '0');
    return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
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

  // Memoized filter for IPTVs arrays
  const filteredIptvItems = useMemo(() => {
    // For M3U mode, all content is in iptvStreams (no separate movies/series lists)
    // For Xtream mode, pick the right list per tab
    const list = iptvMode === 'm3u'
      ? iptvStreams
      : (iptvType === 'live' ? iptvStreams : iptvType === 'movie' ? iptvMovies : iptvSeries);

    const searchLower = iptvSearch.toLowerCase();
    
    return list.filter(s => {
      if (selectedCategoryId !== 'all') {
        if (selectedCategoryId === 'favorites') {
          if (!favorites.includes(`${iptvType}-${s.id}`)) return false;
        } else if (s.category_id !== selectedCategoryId) {
          return false;
        }
      }
      if (searchLower && !s.name.toLowerCase().includes(searchLower)) return false;
      return true;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [iptvMode, iptvType, iptvStreams, iptvMovies, iptvSeries, selectedCategoryId, favorites, iptvSearch]);

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
        onContextMenu={handleContextMenu}
      >
        {/* Series Info Overlay */}
        {selectedSeriesInfo && (
          <div className="absolute inset-0 z-50 bg-theme-bg/95 flex flex-col backdrop-blur-md">
            <div className="p-6 border-b border-theme-border flex items-center justify-between bg-theme-bg-secondary/50">
               <div className="flex items-center gap-6">
                  <button onClick={() => setSelectedSeriesInfo(null)} className="p-2 hover:bg-theme-bg-tertiary rounded-full transition-colors text-theme-accent">
                    <SkipBack size={28} />
                  </button>
                  <div className="flex flex-col">
                    <h2 className="text-2xl font-black text-white">{selectedSeriesInfo.name}</h2>
                    <p className="text-xs text-theme-text-muted uppercase tracking-widest font-bold">Series Details</p>
                  </div>
               </div>
               <button onClick={() => setSelectedSeriesInfo(null)} className="text-theme-text-muted hover:text-white transition-colors">
                  <X size={24} />
               </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
               {/* Seasons */}
               <div className="w-1/4 border-r border-theme-border flex flex-col bg-black/20">
                  <div className="p-4 text-[10px] font-black text-theme-text-muted uppercase tracking-widest">Seasons</div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {/* Assuming Season 1 for simplicity or map keys if multiple seasons */}
                     {Object.keys(selectedSeriesInfo.episodes).map(seasonNum => (
                        <div key={seasonNum} className="p-4 bg-theme-bg-secondary border border-theme-border rounded-xl text-sm font-bold text-center cursor-pointer hover:border-theme-accent transition-all">
                           Season {seasonNum}
                        </div>
                     ))}
                  </div>
               </div>

               {/* Episodes */}
               <div className="flex-1 flex flex-col">
                  <div className="p-4 text-[10px] font-black text-theme-text-muted uppercase tracking-widest">Episodes</div>
                  <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                     {(Object.values(selectedSeriesInfo.episodes)[0] as any[] || []).map((ep: any) => (
                        <div 
                          key={ep.id}
                          className="p-4 bg-theme-bg-secondary border border-theme-border rounded-xl flex items-center justify-between group hover:border-theme-accent cursor-pointer transition-all"
                          onClick={() => {
                            const baseUrl = xtreamUrl.endsWith('/') ? xtreamUrl.slice(0, -1) : xtreamUrl;
                            const newItem = {
                              id: `series-ep-${ep.id}`,
                              name: `${selectedSeriesInfo.name} - ${ep.title}`,
                              url: `${baseUrl}/series/${xtreamUser}/${xtreamPass}/${ep.id}.${ep.container_extension || 'mkv'}`
                            };
                            setPlaylist([newItem]);
                            setCurrentIndex(0);
                            setIsPlaying(true);
                            setSelectedSeriesInfo(null);
                          }}
                        >
                           <div className="flex flex-col">
                              <span className="text-sm font-bold group-hover:text-theme-accent transition-colors">{ep.title}</span>
                              <span className="text-[10px] text-theme-text-muted">Part {ep.episode_num}</span>
                           </div>
                           <Play size={18} className="text-theme-text-muted group-hover:text-theme-accent transition-colors" />
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        )}

        {!videoSrc ? (
          sidebarMode === 'iptv' && isIptvLogged ? (
            <div className="absolute inset-0 z-30 bg-theme-bg overflow-y-auto p-6 scroll-smooth">
              <div className="iptv-grid">
                {filteredIptvItems
                  .slice(0, iptvLimit)
                  .map(item => (
                    <div 
                      key={`${iptvType}-${item.id}`}
                      className="iptv-card group relative"
                      onClick={() => {
                        if (iptvType === 'series') {
                          fetchSeriesInfo(item);
                        } else {
                          const newItem = {
                            id: `iptv-${iptvType}-${item.id}`,
                            name: item.name,
                            url: item.url
                          };
                          setPlaylist([newItem]);
                          setCurrentIndex(0);
                          setIsPlaying(true);
                        }
                      }}
                    >
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(`${iptvType}-${item.id}`);
                        }}
                        className="absolute top-2 right-2 z-10 p-1.5 bg-black/50 rounded-full hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
                        title="Toggle Favorite"
                      >
                        <Heart size={16} className={favorites.includes(`${iptvType}-${item.id}`) ? "fill-theme-accent text-theme-accent" : "text-white"} />
                      </button>
                      <img 
                        src={item.icon} 
                        alt="" 
                        loading="lazy"
                        onError={(e) => { (e.target as any).src = "https://images.unsplash.com/photo-1594909122845-11baa439b7ea?w=200&h=300&fit=crop"; }}
                      />
                      <div className="iptv-card-overlay">
                        {iptvType === 'live' && <div className="iptv-live-dot mb-1" />}
                        <h3 className="iptv-card-title">{item.name}</h3>
                        {iptvType === 'live' && (() => {
                          const epg = getEpgForChannel(item.name);
                          return epg?.current ? (
                            <p className="text-[9px] text-white/70 mt-0.5 truncate">{epg.current.title}</p>
                          ) : null;
                        })()}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <div className="flex flex-col items-center max-w-md w-full mx-4 text-center">
                <div className="w-full max-w-[320px] h-auto mb-8 flex items-center justify-center opacity-80">
                  <CustomLogo size={320} className="object-contain" />
                </div>
                <p className="text-theme-text-muted mb-8 text-sm leading-relaxed px-4">
                  {t.dropFiles}
                </p>
                <label className="cursor-pointer bg-theme-accent hover:opacity-90 text-black px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 shadow-xl active:scale-95">
                  <FileVideo size={18} />
                  <span>{t.chooseFiles}</span>
                  <input type="file" accept="video/*,.mkv,.avi,.mov,.wmv,.flv,.ts,.m2ts,.vob,.rm,.rmvb,.divx,.xvid,.mpeg,.mpg" multiple className="hidden" onChange={handleFileChange} />
                </label>
              </div>
            </div>
          )
        ) : (
          <>
             {/* Smooth Channel Transition Overlay */}
            {isVideoLoading && sidebarMode === 'iptv' && (
              <div className="absolute inset-0 z-[40] flex flex-col items-center justify-center bg-black/95 backdrop-blur-3xl animate-in fade-in duration-300">
                 <div className="relative w-20 h-20 flex items-center justify-center mb-6">
                   <div className="absolute inset-0 border-4 border-theme-bg-tertiary/30 rounded-full"></div>
                   <div className="absolute inset-0 border-4 border-theme-accent border-t-transparent rounded-full animate-spin"></div>
                 </div>
                 <h2 className="text-3xl font-bold text-white mb-3 max-w-2xl text-center truncate shadow-sm">{playlist[currentIndex]?.name}</h2>
                 <p className="text-theme-accent tracking-[0.4em] uppercase text-[10px] font-black animate-pulse">Tuning Frequency...</p>
              </div>
            )}

            <video
              ref={videoRef}
              src={isHlsStream(videoSrc) ? undefined : (videoSrc || undefined)}
              muted={isMuted}
              className={`w-full h-full object-contain transition-opacity duration-300 ${isVideoLoading && sidebarMode === 'iptv' ? 'opacity-0' : 'opacity-100'}`}
              style={transformStyle}
              onCanPlay={() => setIsVideoLoading(false)}
              onPlaying={() => setIsVideoLoading(false)}
              onWaiting={() => setIsVideoLoading(true)}
              onLoadStart={() => setIsVideoLoading(true)}
              onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
              onError={(e) => {
                const video = videoRef.current;
                if (video?.error) {
                  console.error('Video error:', video.error.message, video.error.code);
                  alert('Video error: ' + video.error.message);
                }
              }}
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
                  } else {
                    nextIndex = currentIndex; // stay at same index, next item shifts down
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
            
            {/* Subtitle overlay */}
            {currentCue && (
              <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none z-40 px-4">
                <div
                  className="text-white text-center text-lg font-semibold leading-snug px-4 py-1.5 rounded-lg"
                  style={{ background: 'rgba(0,0,0,0.72)', textShadow: '0 1px 4px rgba(0,0,0,0.9)', maxWidth: '80%', whiteSpace: 'pre-line' }}
                  dangerouslySetInnerHTML={{ __html: currentCue.text.replace(/\n/g, '<br/>') }}
                />
              </div>
            )}

            {/* Selection Box */}
            {isSelecting && startPos && currentPos && (
              <div 
                className="absolute border-2 border-theme-primary bg-theme-primary/20 pointer-events-none"
                style={selectionBoxStyle}
              />
            )}

            {/* Zoom Indicator Box - only show while actively selecting */}
            {zoomRect && isSelecting && (
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

            {/* Hover trigger zone for IPTV OSD */}
            {!showIptvOverlay && sidebarMode === 'iptv' && (
               <div 
                  className="absolute top-0 left-0 bottom-16 w-12 z-[60]"
                  onMouseEnter={() => setShowIptvOverlay(true)}
               />
            )}

            {/* IPTV Overlay On-Screen Display */}
            {showIptvOverlay && sidebarMode === 'iptv' && (
               <div 
                 className="absolute top-0 left-0 bottom-16 w-3/4 max-w-[700px] min-w-[400px] bg-theme-bg/10 backdrop-blur-md border-r border-theme-border/50 z-[60] flex flex-col shadow-[20px_0_50px_rgba(0,0,0,0.8)] overflow-hidden animate-in slide-in-from-left duration-300"
                 onMouseLeave={() => setShowIptvOverlay(false)}
                 onMouseDown={(e) => e.stopPropagation()}
                 onMouseUp={(e) => e.stopPropagation()}
                 onClick={(e) => e.stopPropagation()}
                 onDoubleClick={(e) => e.stopPropagation()}
               >
                  {/* Top Bar */}
                  <div className="flex p-3 gap-2 border-b border-theme-border/50 bg-black/20 backdrop-blur-md items-center justify-between shrink-0">
                     <div className="flex gap-2 w-1/2">
                        {(['live', 'movie', 'series'] as const).map(type => (
                           <button 
                              key={type}
                              onClick={(e) => { e.stopPropagation(); setIptvType(type); }}
                              className={`flex-1 py-1.5 px-2 text-xs font-black rounded uppercase transition-all whitespace-nowrap ${iptvType === type ? 'bg-theme-accent text-black scale-105 shadow-md' : 'text-theme-text-muted hover:text-theme-text hover:bg-theme-bg-tertiary'}`}
                           >
                              {type}
                           </button>
                        ))}
                     </div>
                     <div className="relative w-1/3 min-w-[120px]">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted" />
                        <input 
                           type="text" 
                           value={iptvSearch} 
                           onChange={e => setIptvSearch(e.target.value)} 
                           onMouseDown={(e) => e.stopPropagation()} 
                           placeholder="Search..." 
                           className="w-full bg-black/20 border border-white/10 rounded-full pl-8 pr-3 py-1.5 text-xs outline-none focus:border-theme-accent text-theme-text" 
                        />
                     </div>
                     <button onClick={(e) => { e.stopPropagation(); setShowIptvOverlay(false); }} className="p-1.5 rounded-full text-theme-text-muted hover:text-white hover:bg-theme-bg-tertiary transition-colors ml-2 shrink-0">
                        <X size={18} />
                     </button>
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 overflow-hidden" onMouseDown={(e) => e.stopPropagation()}>
                     {/* Categories */}
                     <div className="w-1/3 border-r border-theme-border overflow-y-auto bg-theme-bg z-10">
                        <div 
                           onClick={(e) => { e.stopPropagation(); setSelectedCategoryId('all'); }}
                           className={`p-3 text-xs border-b border-theme-border/20 cursor-pointer font-bold ${selectedCategoryId === 'all' ? 'text-theme-accent bg-theme-accent/20 border-l-4 border-l-theme-accent shadow-inner' : 'text-theme-text/70 hover:text-theme-text hover:bg-theme-bg/40'}`}
                        >
                           All Categories
                        </div>
                        <div 
                           onClick={(e) => { e.stopPropagation(); setSelectedCategoryId('favorites'); }}
                           className={`p-3 text-xs border-b border-theme-border/20 cursor-pointer font-bold flex items-center gap-2 ${selectedCategoryId === 'favorites' ? 'text-theme-accent bg-theme-accent/20 border-l-4 border-l-theme-accent shadow-inner' : 'text-theme-text/70 hover:text-theme-text hover:bg-theme-bg/40'}`}
                        >
                           <Heart size={14} className={selectedCategoryId === 'favorites' ? "fill-red-500 text-red-500" : "text-red-500/50"} /> Favorites
                        </div>
                        {iptvCategories.map(cat => (
                           <div 
                              key={cat.id} 
                              onClick={(e) => { e.stopPropagation(); setSelectedCategoryId(cat.id); }}
                              className={`p-3 text-xs border-b border-theme-border/20 cursor-pointer transition-all ${selectedCategoryId === cat.id ? 'text-theme-accent bg-theme-bg/80 font-bold border-l-4 border-l-theme-accent shadow-inner' : 'text-theme-text/70 hover:text-theme-text hover:bg-theme-bg/40'}`}
                           >
                              {cat.name}
                           </div>
                        ))}
                     </div>
                     {/* Channels */}
                     <div className="flex-1 overflow-y-auto bg-transparent/0 relative">
                        <div className="flex flex-col p-2 gap-1.5 relative">
                           {filteredIptvItems.slice(0, iptvLimit).map(item => (
                              <div 
                                 key={item.id} 
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    if (iptvType === 'series') {
                                       fetchSeriesInfo(item);
                                    } else {
                                       const newItem = { id: `iptv-${iptvType}-${item.id}`, name: item.name, url: item.url };
                                       setPlaylist([newItem]);
                                       setCurrentIndex(0);
                                       setIsPlaying(true);
                                       // Panel stays open per user request
                                    }
                                 }} 
                                 id={`osd-channel-${btoa(item.url || '').replace(/[^a-zA-Z0-9]/g, '')}`}
                                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all border ${videoSrc === item.url ? 'bg-theme-accent/20 border-l-[3px] border-l-theme-accent shadow-lg shadow-theme-accent/20 scale-[1.02]' : 'border-transparent border-l-[3px] border-l-transparent hover:border-theme-border/30 hover:bg-white/5 backdrop-blur-sm'}`}
                               >
                                     <div className="w-12 h-8 shrink-0 bg-black/50 rounded flex items-center justify-center p-0.5 overflow-hidden">
                                     <img src={item.icon} alt="" className="max-w-full max-h-full object-contain" onError={(e) => { (e.target as any).style.display = 'none'; }} />
                                 </div>
                                 <div className="flex flex-col flex-1 min-w-0">
                                    <span className={`text-xs font-semibold truncate ${videoSrc === item.url ? 'text-theme-accent' : 'text-theme-text'}`}>{item.name}</span>
                                    {iptvType === 'live' && (() => {
                                       const epg = getEpgForChannel(item.name);
                                       return epg?.current ? (
                                          <span className="text-[10px] text-theme-text-muted truncate mt-0.5">{epg.current.title}</span>
                                       ) : null;
                                    })()}
                                 </div>
                                 <button
                                   onClick={(e) => { e.stopPropagation(); toggleFavorite(`${iptvType}-${item.id}`); }}
                                   className="p-1.5 rounded-full hover:bg-theme-bg transition-colors group/fav z-10 shrink-0"
                                   title="Toggle Favorite"
                                 >
                                     <Heart size={14} className={`transition-colors ${favorites.includes(`${iptvType}-${item.id}`) ? "fill-red-500 text-red-500" : "text-theme-text-muted/30 group-hover/fav:text-red-500/50"}`} />
                                 </button>
                                 {videoSrc === item.url && <div className="w-1.5 h-1.5 shrink-0 rounded-full bg-theme-accent ml-1 shadow-[0_0_8px_rgba(var(--theme-accent),0.8)]" />}
                              </div>
                           ))}
                           {filteredIptvItems.length === 0 && (
                              <div className="p-8 flex flex-col items-center justify-center text-theme-text-muted text-center h-full">
                                <Monitor size={32} className="mb-4 opacity-20" />
                                <p className="text-sm">No channels found</p>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
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
                src={isHlsStream(videoSrc) ? undefined : (videoSrc || undefined)}
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
            {/* Network Status */}
            <div className="relative flex items-center group/network">
              <button className="text-theme-text hover:text-theme-accent transition-colors" title="Network Status">
                <Activity size={20} />
              </button>
              
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-[280px] bg-theme-bg/40 backdrop-blur-xl border border-white/10 rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 opacity-0 pointer-events-none group-hover/network:opacity-100 group-hover/network:pointer-events-auto transition-all duration-300 translate-y-2 group-hover/network:translate-y-0 p-5">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-1.5 bg-theme-accent/20 rounded-md">
                     <Activity size={18} className="text-theme-accent" />
                  </div>
                  <span className="font-bold text-white text-[15px] tracking-wide">Network Status</span>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Latency</span>
                  <span className="text-sm font-bold text-theme-accent">{networkPing} ms</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-800 rounded-full mb-6 overflow-hidden">
                  <div className="h-full bg-theme-accent transition-all duration-500 ease-out shadow-[0_0_10px_var(--theme-accent)]" style={{ width: `${Math.max(10, 100 - (networkPing * 1.5))}%` }}></div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-1 bg-black/40 rounded-xl p-3 border border-white/5 flex flex-col justify-center shadow-inner">
                    <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1 drop-shadow-sm">Download</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-white leading-none">{((navigator as any).connection?.downlink || 142).toFixed(0)}</span>
                      <span className="text-[10px] text-neutral-400 font-semibold">Mbps</span>
                    </div>
                  </div>
                  <div className="flex-1 bg-black/40 rounded-xl p-3 border border-white/5 flex flex-col justify-center shadow-inner">
                    <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1 drop-shadow-sm">Type</span>
                    <span className="text-sm font-bold text-white leading-none capitalize truncate">{networkType}</span>
                  </div>
                </div>
              </div>
            </div>

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

            {/* Screenshot button */}
            <button
              onClick={takeScreenshot}
              className={`transition-colors hover:text-theme-accent relative ${screenshotFlash ? 'text-theme-accent' : 'text-theme-text'}`}
              title="Screenshot"
            >
              <Camera size={20} />
            </button>

            {/* Subtitle button */}
            <div className="relative flex items-center" ref={subtitleMenuRef}>
              <button
                onClick={() => setShowSubtitleMenu(p => !p)}
                className={`transition-colors ${subtitleCues.length > 0 ? 'text-theme-accent' : 'text-theme-text hover:text-theme-accent'}`}
                title="Subtitles"
              >
                <Captions size={20} />
              </button>

              {showSubtitleMenu && (
                <div className="absolute bottom-10 right-0 w-72 bg-theme-bg border border-theme-border rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-3 border-b border-theme-border flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-widest text-theme-text-muted">Subtitles</span>
                    {subtitleCues.length > 0 && (
                      <button onClick={() => { setSubtitleCues([]); setSubtitleOffset(0); }} className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase">Remove</button>
                    )}
                  </div>

                  {/* Load file */}
                  <label className="flex items-center gap-3 px-4 py-3 hover:bg-theme-bg-tertiary cursor-pointer transition-colors border-b border-theme-border">
                    <Upload size={16} className="text-theme-accent shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-theme-text">Load subtitle file</p>
                      <p className="text-[10px] text-theme-text-muted">.srt .vtt .ass .ssa .sub .smi .txt</p>
                    </div>
                    <input
                      type="file"
                      accept=".srt,.vtt,.ass,.ssa,.sub,.smi,.txt"
                      className="hidden"
                      onChange={(e) => { if (e.target.files?.[0]) loadSubtitleFile(e.target.files[0]); }}
                    />
                  </label>

                  {/* Status */}
                  <div className="px-4 py-3 border-b border-theme-border">
                    <p className="text-[10px] text-theme-text-muted uppercase font-black tracking-widest mb-1">Status</p>
                    {subtitleCues.length > 0 ? (
                      <p className="text-xs text-theme-accent font-bold">✓ {subtitleCues.length} cues loaded</p>
                    ) : (
                      <p className="text-xs text-theme-text-muted">No subtitles loaded</p>
                    )}
                  </div>

                  {/* Sync offset */}
                  {subtitleCues.length > 0 && (
                    <div className="px-4 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] text-theme-text-muted uppercase font-black tracking-widest">Sync offset</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-theme-accent font-bold">{subtitleOffset > 0 ? '+' : ''}{subtitleOffset.toFixed(1)}s</span>
                          {subtitleOffset !== 0 && (
                            <button onClick={() => setSubtitleOffset(0)} className="text-[10px] text-theme-text-muted hover:text-white uppercase font-bold">Reset</button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSubtitleOffset(p => Math.max(-30, parseFloat((p - 0.5).toFixed(1))))} className="w-8 h-8 rounded-lg bg-theme-bg-tertiary hover:bg-theme-border text-theme-text font-bold text-sm transition-colors flex items-center justify-center">−</button>
                        <input
                          type="range"
                          min="-30"
                          max="30"
                          step="0.1"
                          value={subtitleOffset}
                          onChange={(e) => setSubtitleOffset(parseFloat(e.target.value))}
                          className="flex-1 h-1 accent-theme-accent cursor-pointer"
                        />
                        <button onClick={() => setSubtitleOffset(p => Math.min(30, parseFloat((p + 0.5).toFixed(1))))} className="w-8 h-8 rounded-lg bg-theme-bg-tertiary hover:bg-theme-border text-theme-text font-bold text-sm transition-colors flex items-center justify-center">+</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quality selector - only show for HLS streams with multiple levels */}
            {hlsLevels.length > 1 && (
              <div className="relative flex items-center" ref={qualityMenuRef}>
                <button
                  onClick={() => setShowQualityMenu(p => !p)}
                  className={`transition-colors text-xs font-black px-2 py-1 rounded border ${hlsQuality === -1 ? 'border-theme-border text-theme-text-muted hover:text-theme-accent hover:border-theme-accent' : 'border-theme-accent text-theme-accent'}`}
                  title="Quality"
                >
                  {hlsQuality === -1
                    ? `Auto${hlsCurrentLevel >= 0 ? ` · ${qualityLabel(hlsCurrentLevel)}` : ''}`
                    : qualityLabel(hlsQuality)}
                </button>

                {showQualityMenu && (
                  <div className="absolute bottom-10 right-0 w-44 bg-theme-bg border border-theme-border rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-3 border-b border-theme-border">
                      <span className="text-[10px] font-black uppercase tracking-widest text-theme-text-muted">Quality</span>
                    </div>
                    {/* Auto */}
                    <button
                      onClick={() => applyQuality(-1)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-xs hover:bg-theme-bg-tertiary transition-colors ${hlsQuality === -1 ? 'text-theme-accent font-black' : 'text-theme-text'}`}
                    >
                      <span>Auto</span>
                      {hlsQuality === -1 && hlsCurrentLevel >= 0 && (
                        <span className="text-[10px] text-theme-text-muted">{qualityLabel(hlsCurrentLevel)}</span>
                      )}
                      {hlsQuality === -1 && <span className="text-theme-accent text-[10px]">✓</span>}
                    </button>
                    {/* Levels sorted highest first */}
                    {[...hlsLevels.map((l, i) => ({ ...l, i }))].reverse().map(({ height, bitrate, i }) => (
                      <button
                        key={i}
                        onClick={() => applyQuality(i)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-xs hover:bg-theme-bg-tertiary transition-colors ${hlsQuality === i ? 'text-theme-accent font-black' : 'text-theme-text'}`}
                      >
                        <span>{height > 0 ? `${height}p` : `Level ${i}`}</span>
                        <span className="text-[10px] text-theme-text-muted">{Math.round(bitrate / 1000)}k</span>
                        {hlsQuality === i && <span className="text-theme-accent text-[10px]">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {isIptvLogged && sidebarMode === 'iptv' && (
              <button 
                onClick={() => setShowIptvOverlay(!showIptvOverlay)} 
                className={`transition-colors ${showIptvOverlay ? 'text-theme-accent' : 'text-theme-text hover:text-theme-accent'}`}
                title="Browse IPTV (OSD)"
              >
                <Grid size={20} />
              </button>
            )}

            <button 
              onClick={() => setShowPlaylist(!showPlaylist)} 
              className={`transition-colors ${showPlaylist ? 'text-theme-primary hover:text-theme-accent' : 'text-theme-text hover:text-theme-accent'}`}
              title={t.togglePlaylist}
            >
              <ListVideo size={20} />
            </button>

            {/* EPG button - only show when IPTV live is active */}
            {isIptvLogged && iptvType === 'live' && (
              <div className="relative flex items-center" ref={epgPanelRef}>
                <button
                  onClick={() => setShowEpgPanel(p => !p)}
                  className={`transition-colors ${Object.keys(epgData).length > 0 ? 'text-theme-accent' : 'text-theme-text hover:text-theme-accent'}`}
                  title={t.epg}
                >
                  <Tv2 size={20} />
                </button>
                {showEpgPanel && (
                  <div className="absolute bottom-10 right-0 w-80 bg-theme-bg border border-theme-border rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-3 border-b border-theme-border flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-widest text-theme-text-muted">{t.epg}</span>
                      {epgLoading && <div className="w-3 h-3 border-2 border-theme-accent/30 border-t-theme-accent rounded-full animate-spin" />}
                    </div>
                    {/* EPG URL input */}
                    <div className="p-3 border-b border-theme-border space-y-2">
                      <p className="text-[10px] text-theme-text-muted uppercase font-black tracking-widest">{t.epgUrl}</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={epgUrl}
                          onChange={(e) => setEpgUrl(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') loadEpg(); }}
                          placeholder="http://server.com/epg.xml"
                          className="flex-1 bg-theme-bg-tertiary border border-theme-border rounded-lg px-2 py-1.5 text-xs text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-accent"
                        />
                        <button onClick={() => loadEpg()} className="bg-theme-accent text-black text-xs font-black px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap">
                          Load
                        </button>
                      </div>
                    </div>
                    {/* Current channel EPG */}
                    {playlist[currentIndex] && (() => {
                      const epg = getEpgForChannel(playlist[currentIndex].name);
                      return (
                        <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                          {!epg ? (
                            <p className="text-xs text-theme-text-muted text-center py-4">{Object.keys(epgData).length === 0 ? t.epgNoData : 'No data for this channel'}</p>
                          ) : (
                            <>
                              {epg.current && (
                                <div className="bg-theme-bg-tertiary rounded-lg p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-black uppercase text-red-400">{t.epgNow}</span>
                                  </div>
                                  <p className="text-sm font-bold text-theme-text">{epg.current.title}</p>
                                  {epg.current.desc && <p className="text-[10px] text-theme-text-muted mt-1 line-clamp-2">{epg.current.desc}</p>}
                                  <p className="text-[10px] text-theme-text-muted mt-1">
                                    {new Date(epg.current.start * 1000).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})} – {new Date(epg.current.end * 1000).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
                                  </p>
                                </div>
                              )}
                              {epg.next && (
                                <div className="bg-theme-bg-secondary rounded-lg p-3">
                                  <span className="text-[10px] font-black uppercase text-theme-text-muted">{t.epgNext}</span>
                                  <p className="text-sm font-bold text-theme-text mt-1">{epg.next.title}</p>
                                  <p className="text-[10px] text-theme-text-muted mt-1">
                                    {new Date(epg.next.start * 1000).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})} – {new Date(epg.next.end * 1000).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
                                  </p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
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
      
      {/* Playlist & IPTV Sidebar (Redesigned) */}
      <div className={`bg-theme-bg-secondary/40 backdrop-blur-xl flex shrink-0 z-20 transition-all duration-300 ease-in-out overflow-hidden ${(showPlaylist && !isFullscreen) ? 'w-[320px] border-l border-theme-border' : 'w-0 border-none'}`}>
        
        {/* Pro Sidebar - Vertical icon bar */}
        <div className="w-16 border-r border-theme-border flex flex-col items-center py-6 gap-6 bg-theme-bg/40 backdrop-blur-md shrink-0">
          <div 
            onClick={() => {
              if (sidebarMode === 'files' && showPlaylist) setShowPlaylist(false);
              else {
                setSidebarMode('files');
                setShowPlaylist(true);
              }
            }}
            className={`cursor-pointer transition-colors p-2 rounded-lg ${sidebarMode === 'files' ? 'text-theme-accent bg-white/5 backdrop-blur-sm' : 'text-theme-text-muted hover:text-theme-text'}`}
            title={t.files}
          >
            <FileVideo size={24} />
          </div>
          <div 
            onClick={() => {
              if (sidebarMode === 'iptv' && showPlaylist) setShowPlaylist(false);
              else {
                setSidebarMode('iptv');
                setShowPlaylist(true);
              }
            }}
            className={`cursor-pointer transition-colors p-2 rounded-lg ${sidebarMode === 'iptv' ? 'text-theme-accent bg-white/5 backdrop-blur-sm' : 'text-theme-text-muted hover:text-theme-text'}`}
            title={t.iptv}
          >
            <Monitor size={24} />
          </div>
          <div className="mt-auto mb-2">
             {isIptvLogged && (
               <button onClick={handleLogoutIptv} className="text-theme-text-muted hover:text-red-400 p-2" title={t.logout}>
                 <LogOut size={22} />
               </button>
             )}
          </div>
        </div>

        {/* Categories / Playlist Column */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-theme-border flex items-center justify-between bg-theme-bg-secondary/50">
             <h2 className="text-sm font-black uppercase tracking-widest text-theme-text-muted">
                {sidebarMode === 'files' ? t.playlist : t.iptv}
             </h2>
          </div>


          <div className="flex-1 overflow-hidden flex flex-col">
            {sidebarMode === 'files' ? (
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
                        setZoomRect(null);
                        setZoomState({ scale: 1, tx: 0, ty: 0, vcX: 50, vcY: 50 });
                      }}
                      className={`p-3 rounded-lg cursor-pointer text-sm truncate transition-all flex items-center gap-3 group ${idx === currentIndex && sidebarMode === 'files' ? 'bg-theme-primary text-theme-primary-text font-medium shadow-md' : 'hover:bg-white/5 backdrop-blur-sm text-theme-text-muted'}`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs ${idx === currentIndex && sidebarMode === 'files' ? 'bg-black/20' : 'bg-white/5 backdrop-blur-sm group-hover:bg-theme-border'}`}>
                        {idx === currentIndex && sidebarMode === 'files' && isPlaying ? <Play size={10} className="ml-0.5" /> : idx + 1}
                      </div>
                      <span className="truncate">{item.name}</span>
                    </div>
                  ))
                )}
              </div>
            ) : (
              // IPTV MODE - Categories & Types Redesigned
              <div className="flex-1 flex flex-col overflow-hidden bg-theme-bg-secondary/40">
                {!isIptvLogged ? (
                  <div className="p-4 space-y-4 overflow-y-auto flex-1">
                    {/* Tab bar: Code / Xtream / M3U */}
      <div className={`bg-theme-bg-secondary/40 backdrop-blur-xl flex shrink-0 z-20 transition-all duration-300 ease-in-out overflow-hidden ${(showPlaylist && !isFullscreen) ? 'w-[320px] border-l border-theme-border' : 'w-0 border-none'}`}>
        
        {/* Pro Sidebar - Vertical icon bar */}
        <div className="w-16 border-r border-theme-border flex flex-col items-center py-6 gap-6 bg-theme-bg/40 backdrop-blur-md shrink-0">
          <div 
            onClick={() => {
              if (sidebarMode === 'files' && showPlaylist) setShowPlaylist(false);
              else {
                setSidebarMode('files');
                setShowPlaylist(true);
              }
            }}
            className={`cursor-pointer transition-colors p-2 rounded-lg ${sidebarMode === 'files' ? 'text-theme-accent bg-white/5 backdrop-blur-sm' : 'text-theme-text-muted hover:text-theme-text'}`}
            title={t.files}
          >
            <FileVideo size={24} />
          </div>
          <div 
            onClick={() => {
              if (sidebarMode === 'iptv' && showPlaylist) setShowPlaylist(false);
              else {
                setSidebarMode('iptv');
                setShowPlaylist(true);
              }
            }}
            className={`cursor-pointer transition-colors p-2 rounded-lg ${sidebarMode === 'iptv' ? 'text-theme-accent bg-white/5 backdrop-blur-sm' : 'text-theme-text-muted hover:text-theme-text'}`}
            title={t.iptv}
          >
            <Monitor size={24} />
          </div>
          <div className="mt-auto mb-2">
             {isIptvLogged && (
               <button onClick={handleLogoutIptv} className="text-theme-text-muted hover:text-red-400 p-2" title={t.logout}>
                 <LogOut size={22} />
               </button>
             )}
          </div>
        </div>

        {/* Categories / Playlist Column */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-theme-border flex items-center justify-between bg-theme-bg-secondary/50">
             <h2 className="text-sm font-black uppercase tracking-widest text-theme-text-muted">
                {sidebarMode === 'files' ? t.playlist : t.iptv}
             </h2>
          </div>


          <div className="flex-1 overflow-hidden flex flex-col">
            {sidebarMode === 'files' ? (
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
                        setZoomRect(null);
                        setZoomState({ scale: 1, tx: 0, ty: 0, vcX: 50, vcY: 50 });
                      }}
                      className={`p-3 rounded-lg cursor-pointer text-sm truncate transition-all flex items-center gap-3 group ${idx === currentIndex && sidebarMode === 'files' ? 'bg-theme-primary text-theme-primary-text font-medium shadow-md' : 'hover:bg-white/5 backdrop-blur-sm text-theme-text-muted'}`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs ${idx === currentIndex && sidebarMode === 'files' ? 'bg-black/20' : 'bg-white/5 backdrop-blur-sm group-hover:bg-theme-border'}`}>
                        {idx === currentIndex && sidebarMode === 'files' && isPlaying ? <Play size={10} className="ml-0.5" /> : idx + 1}
                      </div>
                      <span className="truncate">{item.name}</span>
                    </div>
                  ))
                )}
              </div>
            ) : (
              // IPTV MODE - Categories & Types Redesigned
              <div className="flex-1 flex flex-col overflow-hidden bg-theme-bg-secondary/40">
                {!isIptvLogged ? (
                  <div className="p-4 space-y-4 overflow-y-auto flex-1">
                    {/* Tab bar: Code / Xtream / M3U */}
                    <div className="flex bg-theme-bg border border-theme-border rounded-xl p-1">
                      {(['code', 'xtream', 'm3u'] as const).map(mode => (
                        <button
                          key={mode}
                          onClick={() => setIptvMode(mode)}
                          className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${iptvMode === mode ? 'bg-theme-accent text-black shadow-sm' : 'text-theme-text-muted hover:text-theme-text hover:bg-white/5 backdrop-blur-sm'}`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>

                    {/* ── CODE ── */}
                    {iptvMode === 'code' && (
                      <div className="space-y-4 pt-2">
                        <p className="text-center text-[10px] font-black text-theme-text-muted uppercase tracking-widest">{t.activationCodeTitle}</p>
                        <div className="flex justify-center">
                          <input
                            type="text"
                            maxLength={4}
                            placeholder="0000"
                            value={activationCode}
                            onChange={(e) => setActivationCode(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleActivationLogin(); }}
                            className="w-32 bg-theme-bg border border-theme-border rounded-lg px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] text-theme-accent focus:ring-2 focus:ring-theme-accent outline-none uppercase placeholder:text-neutral-700 hover:border-theme-accent transition-colors"
                          />
                        </div>
                        <button onClick={handleActivationLogin} className="w-full bg-theme-accent hover:opacity-90 text-black font-black py-3 rounded-xl active:scale-95 transition-all text-sm uppercase shadow-lg shadow-theme-accent/20">
                          {isIptvLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                              {t.searching}
                            </span>
                          ) : t.activateAndLogin}
                        </button>
                      </div>
                    )}

                    {/* ── XTREAM ── */}
                    {iptvMode === 'xtream' && (
                      <div className="space-y-3 pt-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-theme-text-muted tracking-widest">Server URL</label>
                          <input type="text" placeholder="http://server.com:8080" value={xtreamUrl} onChange={(e) => setXtreamUrl(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleXtreamLogin(); }} className="w-full bg-theme-bg border border-theme-border rounded-lg px-3 py-2.5 text-xs text-theme-text focus:ring-1 focus:ring-theme-accent outline-none hover:border-theme-accent transition-colors" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-theme-text-muted tracking-widest">Username</label>
                          <input type="text" placeholder="username" value={xtreamUser} onChange={(e) => setXtreamUser(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleXtreamLogin(); }} className="w-full bg-theme-bg border border-theme-border rounded-lg px-3 py-2.5 text-xs text-theme-text focus:ring-1 focus:ring-theme-accent outline-none hover:border-theme-accent transition-colors" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-theme-text-muted tracking-widest">Password</label>
                          <input type="password" placeholder="••••••••" value={xtreamPass} onChange={(e) => setXtreamPass(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleXtreamLogin(); }} className="w-full bg-theme-bg border border-theme-border rounded-lg px-3 py-2.5 text-xs text-theme-text focus:ring-1 focus:ring-theme-accent outline-none hover:border-theme-accent transition-colors" />
                        </div>
                        <button onClick={() => handleXtreamLogin()} className="w-full bg-theme-accent hover:opacity-90 text-black font-black py-2.5 rounded-lg active:scale-95 transition-all text-xs uppercase mt-1">
                          {isIptvLoading ? t.searching : t.connect}
                        </button>
                      </div>
                    )}

                    {/* ── M3U ── */}
                    {iptvMode === 'm3u' && (
                      <div className="space-y-3 pt-2">
                        {/* Sub-tab: Playlist / Stream URL */}
                        <div className="flex bg-theme-bg border border-theme-border rounded-lg p-0.5">
                          <button
                            onClick={() => setM3uSubMode('playlist')}
                            className={`flex-1 py-2 text-[10px] font-black uppercase rounded-md transition-all ${m3uSubMode === 'playlist' ? 'bg-white/5 backdrop-blur-sm text-theme-text shadow-sm' : 'text-theme-text-muted hover:text-theme-text'}`}
                          >
                            📋 Playlist
                          </button>
                          <button
                            onClick={() => setM3uSubMode('stream')}
                            className={`flex-1 py-2 text-[10px] font-black uppercase rounded-md transition-all ${m3uSubMode === 'stream' ? 'bg-white/5 backdrop-blur-sm text-theme-text shadow-sm' : 'text-theme-text-muted hover:text-theme-text'}`}
                          >
                            ▶ Stream URL
                          </button>
                        </div>

                        {m3uSubMode === 'playlist' ? (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-black uppercase text-theme-text-muted tracking-widest">M3U Playlist URL</label>
                              <p className="text-[10px] text-theme-text-muted">A playlist file containing multiple channels in #EXTINF format.</p>
                              <input type="text" placeholder="http://server.com/playlist.m3u" value={m3uUrl} onChange={(e) => setM3uUrl(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleM3ULogin(); }} className="w-full bg-theme-bg border border-theme-border rounded-lg px-3 py-2.5 text-xs text-theme-text focus:ring-1 focus:ring-theme-accent outline-none hover:border-theme-accent transition-colors" />
                            </div>
                            <button onClick={() => handleM3ULogin()} className="w-full bg-theme-accent hover:opacity-90 text-black font-black py-2.5 rounded-lg active:scale-95 transition-all text-xs uppercase">
                              {isIptvLoading ? t.searching : 'Load Playlist'}
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-black uppercase text-theme-text-muted tracking-widest">Stream URL</label>
                              <p className="text-[10px] text-theme-text-muted">A direct link to a video or live stream (.m3u8, .mp4, etc.)</p>
                              <input
                                type="text"
                                placeholder="https://example.com/stream.m3u8"
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleOpenUrl(); }}
                                className="w-full bg-theme-bg border border-theme-border rounded-lg px-3 py-2.5 text-xs text-theme-text focus:ring-1 focus:ring-theme-accent outline-none hover:border-theme-accent transition-colors"
                              />
                            </div>
                            <button onClick={handleOpenUrl} className="w-full bg-theme-accent hover:opacity-90 text-black font-black py-2.5 rounded-lg active:scale-95 transition-all text-xs uppercase">
                              ▶ Play Stream
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Mode Types */}
                    <div className="flex gap-1 p-2 bg-theme-bg/30 border-b border-theme-border">
                      {(['live', 'movie', 'series'] as const).map(type => (
                        <button 
                          key={type}
                          onClick={() => setIptvType(type)}
                          className={`flex-1 py-2 text-[10px] font-black rounded uppercase transition-all ${iptvType === type ? 'bg-theme-accent text-black shadow-lg scale-105' : 'bg-white/5 backdrop-blur-sm text-theme-text-muted hover:text-theme-text'}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>



                    <div className="p-3 bg-theme-bg/10">
                       <div className="relative mb-3">
                         <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted" />
                         <input 
                            type="text" 
                            placeholder={t.searchPlaceholder}
                            value={iptvSearch}
                            onChange={(e) => setIptvSearch(e.target.value)}
                            className="w-full bg-theme-bg border border-theme-border rounded-lg pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-theme-accent outline-none"
                         />
                       </div>

                       <div className="flex items-center justify-between px-1">
                          <span className="text-[10px] font-black text-theme-text-muted uppercase tracking-tighter">{t.renderLimit}</span>
                          <select 
                             value={iptvLimit}
                             onChange={(e) => setIptvLimit(parseInt(e.target.value))}
                             className="bg-theme-bg border border-theme-border rounded text-[10px] px-1.5 py-0.5 outline-none font-bold"
                          >
                             {[50, 100, 200, 500, 1000].map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                       </div>
                    </div>

                     <div className="flex-1 overflow-y-auto px-2 space-y-0.5 scroll-smooth py-2">
                        {/* Favorites accordion */}
                        <div 
                           onClick={() => setSelectedCategoryId(selectedCategoryId === 'favorites' ? '' : 'favorites')}
                           className={`iptv-category-item flex items-center justify-between ${selectedCategoryId === 'favorites' ? 'active' : ''}`}
                        >
                           <span className="flex items-center gap-2"><Heart size={12} className={selectedCategoryId === 'favorites' ? "fill-red-500 text-red-500" : "text-red-400"} /> {t.favoritesLabel}</span>
                           <ChevronDown size={12} className={`transition-transform ${selectedCategoryId === 'favorites' ? 'rotate-180' : ''}`} />
                        </div>

                         {selectedCategoryId === 'favorites' && (
                          <div className="ml-2 mb-1 space-y-0.5 border-l-2 border-red-500/30 pl-2 py-2">
                             <div className="flex items-center justify-between px-2 mb-2 pb-2 border-b border-white/5">
                                <span className="text-[9px] font-black text-red-500/60 uppercase tracking-widest">{t.favoritesLabel}</span>
                                <button onClick={createFavoriteFolder} className="p-1 hover:bg-white/5 rounded text-theme-text-muted hover:text-white transition-colors" title={t.newCategoryLabel}>
                                  <FolderPlus size={14} />
                                </button>
                             </div>

                             {/* Allmänna favoriter */}
                             {favorites.length > 0 && (
                               <div className="mb-4">
                                 <div className="text-[9px] text-theme-text-muted px-2 py-1 font-black uppercase tracking-widest opacity-40 mb-1">{t.standardLabel}</div>
                                 {iptvStreams.concat(iptvMovies).concat(iptvSeries).filter(item => favorites.includes(`${iptvType}-${item.id}`)).map(item => (
                                   <div key={item.id} onClick={() => { if (iptvType==='series') fetchSeriesInfo(item); else { setPlaylist([{id:`iptv-${iptvType}-${item.id}`,name:item.name,url:item.url}]); setCurrentIndex(0); setIsPlaying(true); } }}
                                     className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-[11px] transition-all group ${videoSrc===item.url ? 'bg-theme-accent/20 text-theme-accent font-semibold' : 'text-theme-text/70 hover:text-theme-text hover:bg-white/5'}`}>
                                     <img src={item.icon} alt="" className="w-6 h-4 object-contain shrink-0 rounded" onError={(e)=>{ (e.target as any).style.display='none'; }} />
                                     <span className="truncate flex-1">{item.name}</span>
                                     <button onClick={(e)=>{ e.stopPropagation(); toggleFavorite(`${iptvType}-${item.id}`); }} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                       <Heart size={10} className="fill-red-500 text-red-500" />
                                     </button>
                                   </div>
                                 ))}
                               </div>
                             )}

                             {/* Egna Kategorier */}
                             {favoriteFolders.map((folder, fIdx) => (
                               <div key={folder.name} className="mb-4">
                                 <div className="flex items-center justify-between group/f px-2 py-1 mb-1 border-b border-white/5">
                                   <div className="flex items-center gap-1.5 text-[9px] font-black text-theme-accent uppercase tracking-widest truncate">
                                     <FolderOpen size={11} className="text-theme-accent/70" /> {folder.name}
                                   </div>
                                   <div className="flex items-center gap-1 opacity-0 group-hover/f:opacity-100 transition-opacity">
                                      <button onClick={(e) => { e.stopPropagation(); renameFavoriteFolder(folder.name); }} className="p-0.5 hover:text-white text-theme-text-muted transition-colors"><Edit3 size={11} /></button>
                                      <button onClick={(e) => { e.stopPropagation(); deleteFavoriteFolder(folder.name); }} className="p-0.5 hover:text-red-400 text-theme-text-muted transition-colors"><Trash2 size={11} /></button>
                                   </div>
                                 </div>
                                 {iptvStreams.concat(iptvMovies).concat(iptvSeries).filter(item => folder.items.includes(`${iptvType}-${item.id}`)).map(item => (
                                   <div key={item.id} onClick={() => { if (iptvType==='series') fetchSeriesInfo(item); else { setPlaylist([{id:`iptv-${iptvType}-${item.id}`,name:item.name,url:item.url}]); setCurrentIndex(0); setIsPlaying(true); } }}
                                     className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-[11px] transition-all group ${videoSrc===item.url ? 'bg-theme-accent/20 text-theme-accent font-semibold' : 'text-theme-text/70 hover:text-theme-text hover:bg-white/5'}`}>
                                     <img src={item.icon} alt="" className="w-6 h-4 object-contain shrink-0 rounded" onError={(e)=>{ (e.target as any).style.display='none'; }} />
                                     <span className="truncate flex-1">{item.name}</span>
                                     <button onClick={(e)=>{ e.stopPropagation(); toggleItemInFolder(`${iptvType}-${item.id}`, folder.name); }} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                       <Heart size={10} className="fill-theme-accent text-theme-accent" />
                                     </button>
                                   </div>
                                 ))}
                                 {folder.items.length === 0 && <p className="text-[9px] text-theme-text-muted/40 px-2 italic">{t.emptyCategory}</p>}
                               </div>
                             ))}
                             
                             {favorites.length === 0 && favoriteFolders.length === 0 && (
                               <p className="text-[10px] text-theme-text-muted px-2 py-4 italic text-center">{t.noFavorites}</p>
                             )}
                          </div>
                        )}

                        {/* Per-category accordions */}
                        {iptvCategories.map(cat => {
                          const isOpen = selectedCategoryId === cat.id;
                          const list = iptvMode==='m3u' ? iptvStreams : (iptvType==='live' ? iptvStreams : iptvType==='movie' ? iptvMovies : iptvSeries);
                          const catItems = list.filter(s => s.category_id===cat.id && (!iptvSearch || s.name.toLowerCase().includes(iptvSearch.toLowerCase()))).sort((a,b)=>a.name.localeCompare(b.name));
                          return (
                            <div key={cat.id}>
                              <div onClick={() => setSelectedCategoryId(isOpen ? '' : cat.id)}
                                className={`iptv-category-item flex items-center justify-between ${isOpen ? 'active' : ''}`}>
                                <span className="truncate">{cat.name}</span>
                                <span className="flex items-center gap-1.5 shrink-0 ml-1">
                                  {catItems.length > 0 && <span className="text-[9px] bg-white/5 backdrop-blur-sm rounded-full px-1.5 py-0.5 font-bold text-theme-text-muted">{catItems.length}</span>}
                                  <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                </span>
                              </div>
                              {isOpen && (
                                <div className="ml-2 mb-1 space-y-0.5 border-l-2 border-theme-accent/30 pl-2 max-h-96 overflow-y-auto">
                                  {catItems.length === 0
                                    ? <p className="text-[10px] text-theme-text-muted px-2 py-2 italic">{t.noChannels}</p>
                                    : catItems.slice(0, iptvLimit).map(item => (
                                      <div key={item.id} onClick={() => { if (iptvType==='series') fetchSeriesInfo(item); else { setPlaylist([{id:`iptv-${iptvType}-${item.id}`,name:item.name,url:item.url}]); setCurrentIndex(0); setIsPlaying(true); } }}
                                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-[11px] transition-all group ${videoSrc===item.url ? 'bg-theme-accent/20 text-theme-accent font-semibold' : 'text-theme-text/70 hover:text-theme-text hover:bg-white/5 backdrop-blur-sm'}`}>
                                        <img src={item.icon} alt="" className="w-6 h-4 object-contain shrink-0 rounded" onError={(e)=>{ (e.target as any).style.display='none'; }} />
                                        <span className="truncate flex-1">{item.name}</span>
                                        <button onClick={(e)=>{ e.stopPropagation(); toggleFavorite(`${iptvType}-${item.id}`); }} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                          <Heart size={10} className={favorites.includes(`${iptvType}-${item.id}`) ? "fill-red-500 text-red-500" : "text-white/40 hover:text-red-400"} />
                                        </button>
                                        <button onClick={(e)=>{ e.stopPropagation(); setMoveMenu({ id: `${iptvType}-${item.id}`, x: e.clientX, y: e.clientY }); }} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
                                          <FolderPlus size={10} className="text-white/40 hover:text-theme-accent shadow-sm" />
                                        </button>
                                      </div>
                                    ))
                                  }
                                </div>
                              )}
                            </div>
                          );
                        })}
                     </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Update notifications */}
      {updateAvailable && (
        <div className="fixed bottom-6 right-6 z-[80] bg-theme-bg border border-theme-border rounded-xl shadow-2xl p-4 flex items-center gap-4 max-w-sm">
          <div className="flex-1">
            <p className="text-sm font-semibold text-theme-text">{t.updateAvailableTitle}</p>
            <p className="text-xs text-theme-text-muted mt-0.5">{t.downloadingUpdate}</p>
          </div>
          <button onClick={() => setUpdateAvailable(false)} className="text-theme-text-muted hover:text-theme-text transition-colors"><X size={16} /></button>
        </div>
      )}

      {updateDownloaded && (
        <div className="fixed bottom-6 right-6 z-[80] bg-theme-bg border border-theme-primary rounded-xl shadow-2xl p-4 flex items-center gap-4 max-w-sm">
          <div className="flex-1">
            <p className="text-sm font-semibold text-theme-text">{t.updateReadyTitle}</p>
            <p className="text-xs text-theme-text-muted mt-0.5">{t.restartToUpdate}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                try {
                  const { ipcRenderer } = (window as any).require('electron');
                  ipcRenderer.send('restart-and-install');
                } catch { }
              }}
              className="bg-theme-primary hover:bg-theme-hover text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
              Starta om
            </button>
            <button onClick={() => setUpdateDownloaded(false)} className="text-theme-text-muted hover:text-theme-text transition-colors"><X size={16} /></button>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          isPlaying={isPlaying}
          isFullscreen={isFullscreen}
          hasMultipleVideos={playlist.length > 1}
          t={t}
          onClose={() => setContextMenu(null)}
          onPlayPause={togglePlay}
          onStop={stopVideo}
          onPrevious={() => setCurrentIndex(i => Math.max(0, i - 1))}
          onNext={() => setCurrentIndex(i => Math.min(playlist.length - 1, i + 1))}
          onSettings={() => setShowSettingsModal(true)}
          onPlaylist={() => setShowPlaylist(p => !p)}
          onFullscreen={toggleFullscreen}
          onExit={() => {
            try {
              const { ipcRenderer } = (window as any).require('electron');
              ipcRenderer.send('quit-app');
            } catch {
              console.warn('Exit: not in Electron');
            }
          }}
        />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onKeyDown={(e) => { if (e.key === 'Escape') setShowSettingsModal(false); }}
          tabIndex={-1}
          ref={(el) => el?.focus()}
        >
          <div className="bg-theme-bg-secondary rounded-xl w-full max-w-md border border-theme-border shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-theme-border shrink-0">
              <h2 className="text-xl font-semibold text-theme-text">{t.settings}</h2>
              <button onClick={() => setShowSettingsModal(false)} className="text-theme-text-muted hover:text-theme-text transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 space-y-6 overflow-y-auto flex-1">
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

              {/* IPTV */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-theme-text">IPTV</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-theme-text">{t.iptvQuality}</span>
                    <p className="text-[11px] text-theme-text-muted mt-0.5">{t.iptvQualityAuto}</p>
                  </div>
                  <div className="relative w-36">
                    <select
                      value={defaultHlsQuality}
                      onChange={(e) => setDefaultHlsQuality(parseInt(e.target.value))}
                      className="w-full appearance-none bg-theme-bg border border-theme-border text-theme-text text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary/50 cursor-pointer"
                    >
                      <option value={-1} className="bg-theme-bg">Auto ✦</option>
                      <option value={0} className="bg-theme-bg">144p</option>
                      <option value={1} className="bg-theme-bg">240p</option>
                      <option value={2} className="bg-theme-bg">360p</option>
                      <option value={3} className="bg-theme-bg">480p</option>
                      <option value={4} className="bg-theme-bg">720p</option>
                      <option value={5} className="bg-theme-bg">1080p</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-text-muted pointer-events-none" />
                  </div>
                </div>
                <p className="text-[11px] text-theme-text-muted bg-theme-bg-tertiary rounded-lg px-3 py-2">
                  ℹ️ Auto adjusts quality based on your connection speed. Manual selection applies when the stream supports that resolution.
                </p>
                <div className="space-y-1">
                  <span className="text-sm text-theme-text">{t.epgUrl}</span>
                  <p className="text-[11px] text-theme-text-muted">XML EPG URL for TV guide data (optional)</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={epgUrl}
                      onChange={(e) => setEpgUrl(e.target.value)}
                      placeholder="http://server.com/epg.xml"
                      className="flex-1 bg-theme-bg border border-theme-border rounded-lg px-3 py-2 text-xs text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-accent"
                    />
                    <button onClick={() => { loadEpg(); setShowSettingsModal(false); }} className="bg-theme-accent text-black text-xs font-black px-3 py-2 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap">
                      Load
                    </button>
                  </div>
                  {Object.keys(epgData).length > 0 && (
                    <p className="text-[11px] text-theme-accent">✓ {Object.keys(epgData).length} channels loaded</p>
                  )}
                </div>
              </div>

              {/* Equalizer */}
              <div className="border border-theme-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowEqSettings(p => !p)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-theme-bg-tertiary transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-theme-text">{t.equalizer}</span>
                    {(eqBass !== 0 || eqMid !== 0 || eqTreble !== 0) && (
                      <span className="text-[10px] bg-theme-accent text-black font-black px-1.5 py-0.5 rounded-full">ON</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {(eqBass !== 0 || eqMid !== 0 || eqTreble !== 0) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); resetEq(); }}
                        className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase"
                      >Reset</button>
                    )}
                    <ChevronDown size={16} className={`text-theme-text-muted transition-transform ${showEqSettings ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                {showEqSettings && (
                  <div className="px-4 pb-4 pt-2 space-y-4 border-t border-theme-border bg-theme-bg/30">
                    {([
                      { label: 'Bass', key: 'bass' as const, value: eqBass, freq: '200Hz' },
                      { label: 'Mid', key: 'mid' as const, value: eqMid, freq: '1kHz' },
                      { label: 'Treble', key: 'treble' as const, value: eqTreble, freq: '4kHz' },
                    ]).map(({ label, key, value, freq }) => (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm text-theme-text">{label}</span>
                          <span className="text-xs text-theme-text-muted">{freq} · <span className={value !== 0 ? 'text-theme-accent font-bold' : ''}>{value > 0 ? '+' : ''}{value}dB</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-theme-text-muted w-6">-12</span>
                          <input
                            type="range" min="-12" max="12" step="1" value={value}
                            onChange={(e) => { initAudio(); applyEq(key, parseInt(e.target.value)); }}
                            className="flex-1 h-1 accent-theme-accent cursor-pointer"
                          />
                          <span className="text-[10px] text-theme-text-muted w-5">+12</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
              <div className="text-xs text-theme-text-muted">{t.about} • {t.version} {(typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.1.35')}</div>
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
                  { keys: ['Alt', '+', 'S'], desc: t.scScreenshot },
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

      {/* Code Generation Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-theme-bg border border-theme-border rounded-2xl w-full max-w-sm overflow-hidden flex flex-col relative shadow-2xl">
             <div className="p-4 border-b border-theme-border flex items-center justify-between bg-theme-bg-secondary">
               <h2 className="text-sm font-black uppercase text-theme-text-muted">{t.createActivationCode}</h2>
               <button onClick={() => setShowCodeModal(false)} className="text-theme-text-muted hover:text-theme-text"><X size={18}/></button>
             </div>
             <div className="p-6 space-y-4">
                 <p className="text-xs text-theme-text-muted">{t.shareCodeInfo}</p>
                 <div className="flex justify-center">
                    <input 
                      type="text" 
                      maxLength={4} 
                      placeholder="0000" 
                      value={generateCode} 
                      onChange={(e) => setGenerateCode(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-32 bg-theme-bg-secondary border border-theme-border rounded-lg px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] text-theme-accent focus:ring-2 focus:ring-theme-accent outline-none" 
                    />
                 </div>
                 <button onClick={handleCreateCode} disabled={isGenerating || generateCode.length !== 4} className="w-full bg-theme-accent hover:bg-emerald-400 text-black font-black py-3 rounded-xl active:scale-95 transition-all text-sm uppercase disabled:opacity-50 disabled:active:scale-100">
                    {isGenerating ? t.loading : t.saveCode}
                 </button>
             </div>
          </div>
        </div>
      )}

      {/* Move to Folder Menu */}
      {moveMenu && (
        <div 
          className="fixed inset-0 z-[100]" 
          onClick={() => setMoveMenu(null)}
          onContextMenu={(e) => { e.preventDefault(); setMoveMenu(null); }}
        >
          <div 
            className="absolute bg-theme-bg border border-theme-border rounded-lg shadow-2xl py-2 min-w-[200px] animate-in zoom-in-95 duration-150"
            style={{ left: Math.min(moveMenu.x, window.innerWidth - 220), top: Math.min(moveMenu.y, window.innerHeight - 250) }}
          >
            <div className="px-4 py-2 border-b border-theme-border mb-1">
              <span className="text-[10px] font-black text-theme-text-muted uppercase tracking-widest">{t.categories}</span>
            </div>
            {favoriteFolders.length === 0 && (
              <div className="px-4 py-3 text-[10px] text-theme-text-muted italic">{t.noCategoriesCreated}</div>
            )}
            <div className="max-h-60 overflow-y-auto">
              {favoriteFolders.map(folder => {
                const isInFolder = folder.items.includes(moveMenu.id);
                return (
                  <button
                    key={folder.name}
                    onClick={(e) => { e.stopPropagation(); toggleItemInFolder(moveMenu.id, folder.name); setMoveMenu(null); }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-theme-accent hover:text-black transition-colors flex items-center justify-between group"
                  >
                    <span className="flex items-center gap-2 truncate pr-2"><FolderOpen size={14} className="opacity-50 group-hover:opacity-100 shrink-0" /> {folder.name}</span>
                    {isInFolder && <Check size={14} className="shrink-0" />}
                  </button>
                );
              })}
            </div>
            <div className="border-t border-theme-border mt-1 pt-1">
               <button
                  onClick={(e) => { e.stopPropagation(); setMoveMenu(null); createFavoriteFolder(); }}
                  className="w-full text-left px-4 py-2 text-xs text-theme-accent hover:bg-theme-accent/10 transition-colors flex items-center gap-2"
               >
                 <FolderPlus size={14} /> Ny kategori...
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}