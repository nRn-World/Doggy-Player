import React, { useRef, useEffect, useLayoutEffect, useState } from 'react';

export interface ContextMenuProps {
  x: number;
  y: number;
  isPlaying: boolean;
  hasMultipleVideos: boolean;
  t: {
    play: string;
    pause: string;
    stop: string;
    previous: string;
    nextVideo: string;
    settings: string;
    playlist: string;
    exitApp: string;
  };
  onClose: () => void;
  onPlayPause: () => void;
  onStop: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSettings: () => void;
  onPlaylist: () => void;
  onExit: () => void;
}

export function ContextMenu({
  x,
  y,
  isPlaying,
  hasMultipleVideos,
  t,
  onClose,
  onPlayPause,
  onStop,
  onPrevious,
  onNext,
  onSettings,
  onPlaylist,
  onExit,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLUListElement>(null);
  const [pos, setPos] = useState({ x, y });

  // Clamp to viewport after mount so we know the menu's rendered size
  useLayoutEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const clampedX = Math.min(x, window.innerWidth - width - 4);
    const clampedY = Math.min(y, window.innerHeight - height - 4);
    setPos({ x: Math.max(0, clampedX), y: Math.max(0, clampedY) });
  }, [x, y]);

  // Close on outside mousedown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const item = (label: string, action: () => void) => (
    <li key={label}>
      <button
        className="w-full text-left px-4 py-1.5 text-sm hover:bg-theme-bg-tertiary transition-colors whitespace-nowrap"
        onMouseDown={(e) => {
          e.stopPropagation(); // prevent outside-click handler from firing
          action();
          onClose();
        }}
      >
        {label}
      </button>
    </li>
  );

  const separator = (
    <li key="sep" role="separator">
      <hr className="border-theme-border my-1" />
    </li>
  );

  const menuItems: React.ReactNode[] = [
    item(isPlaying ? t.pause : t.play, onPlayPause),
    item(t.stop, onStop),
  ];

  if (hasMultipleVideos) {
    menuItems.push(separator);
    menuItems.push(item(t.previous, onPrevious));
    menuItems.push(item(t.nextVideo, onNext));
    menuItems.push(item(t.playlist, onPlaylist));
  }

  menuItems.push(
    <li key="sep2" role="separator">
      <hr className="border-theme-border my-1" />
    </li>
  );
  menuItems.push(item(t.settings, onSettings));
  menuItems.push(item(t.exitApp, onExit));

  return (
    <ul
      ref={menuRef}
      data-testid="context-menu"
      className="fixed z-[70] min-w-[160px] bg-theme-bg border border-theme-border rounded-md shadow-xl py-1 text-theme-text"
      style={{ left: pos.x, top: pos.y }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {menuItems}
    </ul>
  );
}
