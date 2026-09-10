# Doggy Player v1.1.69

Fixes settings dropdowns that closed immediately so you could not change default speed or IPTV default quality.

## What's Changed

- **Settings menus stay open:** Replaced fragile native `<select>` controls with custom menus for language, default speed, and IPTV default quality.
- **Focus trap fixed:** Settings overlay no longer steals focus on every video time update (which closed open dropdowns instantly).
- **Auto-update for all platforms:** Windows (`latest.yml`), macOS (`latest-mac.yml`) and Linux (`latest-linux.yml`) are published to GitHub Releases.

## Upgrade

Existing Doggy Player installations will receive v1.1.69 automatically via the built-in updater after the release assets have finished building and publishing.
