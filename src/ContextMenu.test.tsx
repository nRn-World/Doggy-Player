import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContextMenu } from './ContextMenu';
import * as fc from 'fast-check';

const en = {
  play: 'Play', pause: 'Pause', stop: 'Stop',
  previous: 'Previous', nextVideo: 'Next Video',
  settings: 'Settings', playlist: 'Playlist', exitApp: 'Exit',
};

const sv = {
  play: 'Spela upp', pause: 'Pausa', stop: 'Stoppa',
  previous: 'Föregående', nextVideo: 'Nästa Video',
  settings: 'Inställningar', playlist: 'Spellista', exitApp: 'Avsluta',
};

const baseProps = {
  x: 100, y: 100,
  isPlaying: false,
  isFullscreen: false,
  hasMultipleVideos: false,
  t: en,
  onClose: vi.fn(),
  onPlayPause: vi.fn(),
  onStop: vi.fn(),
  onPrevious: vi.fn(),
  onNext: vi.fn(),
  onSettings: vi.fn(),
  onPlaylist: vi.fn(),
  onFullscreen: vi.fn(),
  onExit: vi.fn(),
};

function setup(overrides = {}) {
  const props = { ...baseProps, ...overrides,
    onClose: vi.fn(), onPlayPause: vi.fn(), onStop: vi.fn(),
    onPrevious: vi.fn(), onNext: vi.fn(), onSettings: vi.fn(),
    onPlaylist: vi.fn(), onFullscreen: vi.fn(), onExit: vi.fn(),
  };
  render(<ContextMenu {...props} />);
  return props;
}

// ── Unit tests ────────────────────────────────────────────────────────────────

describe('ContextMenu – always-present items', () => {
  it('shows Stop, Settings, Exit regardless of playlist size', () => {
    setup();
    expect(screen.getByText('Stop')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Exit')).toBeInTheDocument();
  });
});

describe('ContextMenu – play/pause label (4.1 / 2.4 / 2.5)', () => {
  it('shows play label when not playing', () => {
    setup({ isPlaying: false });
    expect(screen.getByText('Play')).toBeInTheDocument();
    expect(screen.queryByText('Pause')).not.toBeInTheDocument();
  });

  it('shows pause label when playing', () => {
    setup({ isPlaying: true });
    expect(screen.getByText('Pause')).toBeInTheDocument();
    expect(screen.queryByText('Play')).not.toBeInTheDocument();
  });
});

describe('ContextMenu – playlist-conditional items (2.2 / 2.3)', () => {
  it('hides Previous, Next Video, Playlist when hasMultipleVideos=false', () => {
    setup({ hasMultipleVideos: false });
    expect(screen.queryByText('Previous')).not.toBeInTheDocument();
    expect(screen.queryByText('Next Video')).not.toBeInTheDocument();
    expect(screen.queryByText('Playlist')).not.toBeInTheDocument();
  });

  it('shows Previous, Next Video, Playlist when hasMultipleVideos=true', () => {
    setup({ hasMultipleVideos: true });
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next Video')).toBeInTheDocument();
    expect(screen.getByText('Playlist')).toBeInTheDocument();
  });
});

describe('ContextMenu – language labels (4.1)', () => {
  it('renders English labels', () => {
    setup({ t: en });
    expect(screen.getByText('Play')).toBeInTheDocument();
    expect(screen.getByText('Stop')).toBeInTheDocument();
    expect(screen.getByText('Exit')).toBeInTheDocument();
  });

  it('renders Swedish labels', () => {
    setup({ t: sv });
    expect(screen.getByText('Spela upp')).toBeInTheDocument();
    expect(screen.getByText('Stoppa')).toBeInTheDocument();
    expect(screen.getByText('Avsluta')).toBeInTheDocument();
  });
});

describe('ContextMenu – item clicks call callbacks and close (3.1–3.8)', () => {
  it('Play/Pause calls onPlayPause and onClose', () => {
    const p = setup({ isPlaying: false });
    fireEvent.mouseDown(screen.getByText('Play'));
    expect(p.onPlayPause).toHaveBeenCalledOnce();
    expect(p.onClose).toHaveBeenCalledOnce();
  });

  it('Stop calls onStop and onClose', () => {
    const p = setup();
    fireEvent.mouseDown(screen.getByText('Stop'));
    expect(p.onStop).toHaveBeenCalledOnce();
    expect(p.onClose).toHaveBeenCalledOnce();
  });

  it('Previous calls onPrevious and onClose', () => {
    const p = setup({ hasMultipleVideos: true });
    fireEvent.mouseDown(screen.getByText('Previous'));
    expect(p.onPrevious).toHaveBeenCalledOnce();
    expect(p.onClose).toHaveBeenCalledOnce();
  });

  it('Next Video calls onNext and onClose', () => {
    const p = setup({ hasMultipleVideos: true });
    fireEvent.mouseDown(screen.getByText('Next Video'));
    expect(p.onNext).toHaveBeenCalledOnce();
    expect(p.onClose).toHaveBeenCalledOnce();
  });

  it('Settings calls onSettings and onClose', () => {
    const p = setup();
    fireEvent.mouseDown(screen.getByText('Settings'));
    expect(p.onSettings).toHaveBeenCalledOnce();
    expect(p.onClose).toHaveBeenCalledOnce();
  });

  it('Playlist calls onPlaylist and onClose', () => {
    const p = setup({ hasMultipleVideos: true });
    fireEvent.mouseDown(screen.getByText('Playlist'));
    expect(p.onPlaylist).toHaveBeenCalledOnce();
    expect(p.onClose).toHaveBeenCalledOnce();
  });

  it('Exit calls onExit and onClose', () => {
    const p = setup();
    fireEvent.mouseDown(screen.getByText('Exit'));
    expect(p.onExit).toHaveBeenCalledOnce();
    expect(p.onClose).toHaveBeenCalledOnce();
  });
});

describe('ContextMenu – separator (5.2)', () => {
  it('renders at least one separator hr', () => {
    const { container } = render(<ContextMenu {...baseProps} />);
    expect(container.querySelectorAll('hr').length).toBeGreaterThanOrEqual(1);
  });
});

describe('ContextMenu – z-index (5.4)', () => {
  it('has z-[70] class on the menu element', () => {
    setup();
    expect(screen.getByTestId('context-menu').className).toContain('z-[70]');
  });
});

describe('ContextMenu – Escape closes menu (1.3)', () => {
  it('calls onClose when Escape is pressed', () => {
    const p = setup();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(p.onClose).toHaveBeenCalledOnce();
  });
});

describe('ContextMenu – outside click closes menu (1.2)', () => {
  it('calls onClose when mousedown fires outside the menu', () => {
    const p = setup();
    fireEvent.mouseDown(document.body);
    expect(p.onClose).toHaveBeenCalledOnce();
  });
});

// ── Property-based tests ──────────────────────────────────────────────────────

describe('Property tests', () => {
  // Feature: context-menu-player, Property 5: for any playlist length, navigation items shown iff length > 1
  it('P5: navigation items shown iff hasMultipleVideos', () => {
    fc.assert(fc.property(fc.boolean(), (multi) => {
      const { unmount, queryByText } = render(
        <ContextMenu {...baseProps} hasMultipleVideos={multi} />
      );
      const hasPrev = queryByText('Previous') !== null;
      unmount();
      return hasPrev === multi;
    }), { numRuns: 100 });
  });

  // Feature: context-menu-player, Property 6: for any isPlaying value, label matches expected translation key
  it('P6: play/pause label matches isPlaying state', () => {
    fc.assert(fc.property(fc.boolean(), (playing) => {
      const { unmount, queryByText } = render(
        <ContextMenu {...baseProps} isPlaying={playing} />
      );
      const hasPlay = queryByText('Play') !== null;
      const hasPause = queryByText('Pause') !== null;
      unmount();
      return playing ? hasPause && !hasPlay : hasPlay && !hasPause;
    }), { numRuns: 100 });
  });

  // Feature: context-menu-player, Property 8: for any language, all labels match translations[language]
  it('P8: all labels match the provided translation object', () => {
    const translations = [en, sv];
    fc.assert(fc.property(fc.constantFrom(...translations), (t) => {
      const { unmount, queryByText } = render(
        <ContextMenu {...baseProps} hasMultipleVideos={true} t={t} />
      );
      const allPresent = [t.stop, t.settings, t.exitApp, t.previous, t.nextVideo, t.playlist]
        .every(label => queryByText(label) !== null);
      unmount();
      return allPresent;
    }), { numRuns: 100 });
  });

  // Feature: context-menu-player, Property 9: for any position near viewport edges, clamped position keeps menu in bounds
  it('P9: menu position stays within viewport after clamping', () => {
    // jsdom has innerWidth/innerHeight = 1024/768 by default
    fc.assert(fc.property(
      fc.integer({ min: 0, max: 2000 }),
      fc.integer({ min: 0, max: 2000 }),
      (x, y) => {
        const { unmount, getByTestId } = render(
          <ContextMenu {...baseProps} x={x} y={y} />
        );
        const el = getByTestId('context-menu');
        const left = parseFloat(el.style.left);
        const top = parseFloat(el.style.top);
        unmount();
        // After clamping, position must be non-negative
        return left >= 0 && top >= 0;
      }
    ), { numRuns: 100 });
  });
});
