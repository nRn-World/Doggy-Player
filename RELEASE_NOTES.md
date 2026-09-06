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

---

# Doggy Player v1.1.64

This release fixes lag when seeking on large/long videos and adds professional hold-to-seek controls.

## What's Changed

- **Smooth seeking on large files:** Timeline scrubbing is now debounced, uses `fastSeek` to the nearest keyframe and shows a subtle spinner instead of a black flash.
- **Faster local streaming (Electron):** Stream server now serves `32 MB` chunks with `512 KB` `highWaterMark`, proper `Content-Range` handling and MIME detection for instant seeks on 4K/long videos.
- **New seek steps:** `Arrow Left/Right` is now `5s` (was `10s`), `Shift + Arrow` = `15s`, `Ctrl + Arrow` = `20s`.
- **Hold to seek:** Hold `Arrow Left/Right` (or `Ctrl`/`Shift` + arrow) to continuously seek until you release.
- **Improved shortcuts:** Keyboard Shortcuts modal now lists `5s` / `15s` / `20s` and hold behavior in English, Swedish and Turkish.
- **Auto-update for all platforms:** Windows (`latest.yml`), macOS (`latest-mac.yml`) and Linux (`latest-linux.yml`) are published to GitHub Releases.

## Upgrade

Existing Doggy Player installations will receive v1.1.64 automatically via the built-in updater after the release assets have finished building and publishing.

---

# Doggy Player v1.1.63

This release adds non-destructive video brightness controls, clear percentage feedback, keyboard shortcuts, and per-video brightness locking.

## What's Changed

- Adjust the active video between 50% and 150% brightness without modifying the original file.
- See the current brightness percentage directly in the player controls and in an on-video indicator while adjusting.
- Use `Ctrl + Arrow Up` and `Ctrl + Arrow Down` to change brightness in 5% steps.
- Lock a brightness value for an individual video and automatically restore it whenever that video is opened again.
- Toggle the per-video lock from the on-video indicator or the brightness menu.
- Reset brightness to 100% at any time.
- Brightness controls and lock labels are available in English, Swedish, and Turkish.

## Upgrade

Existing Doggy Player installations will receive this update through the built-in updater after the release assets have finished building and publishing.
