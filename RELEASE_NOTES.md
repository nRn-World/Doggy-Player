# Doggy Player v1.1.66

This release fixes freeze-on-seek for large/HQ videos when using arrow keys or the timeline.

## What's Changed

- **FFmpeg scrub preview:** While holding ←/→ or dragging the timeline on local files, Doggy Player shows live JPEG frames from FFmpeg instead of freezing the `<video>` decoder.
- **One real seek on release:** The video element seeks only when you release the keys/mouse — no more stacked decode stalls on big files.
- **fastSeek without pause-first:** Single seeks use keyframe-fast seeking and no longer pause first (which made freezes more visible in v1.1.65).
- **Auto-update for all platforms:** Windows (`latest.yml`), macOS (`latest-mac.yml`) and Linux (`latest-linux.yml`) are published to GitHub Releases.

## Upgrade

Existing Doggy Player installations will receive v1.1.66 automatically via the built-in updater after the release assets have finished building and publishing.

---

# Doggy Player v1.1.65

This release fixes freeze-on-seek for large and high-quality videos so scrubbing stays responsive across formats and file sizes.

## What's Changed

- **No more freeze when seeking:** Playback pauses briefly during seek, then resumes — the decoder is no longer overloaded on big/HQ files.
- **Direct disk playback for common formats:** Local mp4/mkv/mov/webm and similar files now use `file://` instead of HTTP Range streaming for much faster seeks.
- **Smarter seek queue:** Rapid scrubbing and hold-to-seek coalesce into one in-flight seek (last-wins) instead of stacking decode jobs.
- **Smoother timeline & arrow scrub:** UI time updates immediately; media seeks less often while you drag or hold ←/→.
- **Transcoded formats (avi, ts, …):** Debounced FFmpeg restarts and cleanup of previous processes so seeks no longer pile up.
- **Auto-update for all platforms:** Windows (`latest.yml`), macOS (`latest-mac.yml`) and Linux (`latest-linux.yml`) are published to GitHub Releases.

## Upgrade

Existing Doggy Player installations will receive v1.1.65 automatically via the built-in updater after the release assets have finished building and publishing.
