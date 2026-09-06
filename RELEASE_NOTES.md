# Doggy Player v1.1.68

Fixes 1-second seek freezes on files that look like `.mp4` but are actually MPEG-TS (or other unseekable containers).

## What's Changed

- **Detect real container format:** Probes files with FFmpeg instead of trusting the file extension.
- **Auto-remux for smooth seeking:** MPEG-TS and similar containers are stream-copied once to a real MP4 with `faststart` (keeps quality, ~a few seconds for ~1.5GB) and cached for next time.
- **Example:** `AvratbazAbi14.mp4` was MPEG-TS with an `.mp4` name — Chromium froze ~1s on every seek. After remux it seeks like a normal MP4.
- **Auto-update for all platforms:** Windows (`latest.yml`), macOS (`latest-mac.yml`) and Linux (`latest-linux.yml`) are published to GitHub Releases.

## Upgrade

Existing Doggy Player installations will receive v1.1.68 automatically via the built-in updater after the release assets have finished building and publishing.
