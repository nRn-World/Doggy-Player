# Doggy Player v1.1.67

Hotfix: removes the FFmpeg scrub-preview overlay that could freeze the picture while audio kept playing.

## What's Changed

- **Removed stuck image overlay:** The v1.1.66 JPEG preview could remain on top of the video after seeking — picture frozen, audio still playing. That overlay is gone.
- **Reliable resume after seek:** Playback is forced to resume after seek completes so video and audio stay in sync.
- **Simpler seek path:** Debounced / last-wins seeking without covering the `<video>` element.
- **Auto-update for all platforms:** Windows (`latest.yml`), macOS (`latest-mac.yml`) and Linux (`latest-linux.yml`) are published to GitHub Releases.

## Upgrade

Existing Doggy Player installations will receive v1.1.67 automatically via the built-in updater after the release assets have finished building and publishing.

---

# Doggy Player v1.1.66

This release attempted FFmpeg scrub previews for large-file seeking (superseded by v1.1.67).

## Upgrade

Please update to v1.1.67.
