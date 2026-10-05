# Contributing to Doggy Player 🐶

First off, thank you for considering contributing to Doggy Player! It's people like you that make Doggy Player such a great tool.

By taking part in this project you agree to follow our [**Code of Conduct**](CODE_OF_CONDUCT.md). Please read it before you post or comment.

## How Can I Contribute?

### Asking Questions
* Use [GitHub Discussions](https://github.com/nRn-World/Doggy-Player/discussions) for questions, setup help, and open-ended ideas.
* Use the **Issues** tab only for concrete bugs and feature requests so reports stay actionable.

### Reporting Bugs
* Check the [Issues tab](https://github.com/nRn-World/Doggy-Player/issues) to see if the bug has already been reported.
* If not, open a new issue using the **Bug Report** template. Clearly describe the problem, including steps to reproduce it and your system information.
* Please include your Doggy Player version (`1.1.75` or newer) and, when the bug is about playback, the container/codec of the file that fails.

### Suggesting Enhancements
* Open a new issue using the **Feature Request** template.
* Include the tag `enhancement` in your suggestion.
* Explain why this feature would be useful and how you imagine it working.

### Reporting Security Issues
* Never report a vulnerability in a public issue. Follow the [Security Policy](SECURITY.md) and e-mail **bynrnworld@gmail.com** instead.

### Pull Requests
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/amazing-feature`).
3. Make your changes.
4. Run `npm run lint` to ensure there are no TypeScript errors.
5. Commit your changes (`git commit -m 'Add some amazing feature'`).
6. Push to the branch (`git push origin feature/amazing-feature`).
7. Open a Pull Request and fill out the provided template.

Keep each pull request focused on a single change, and describe how you tested it. Maintainers may ask for changes before merging.

## Local Development Setup

To get the project running locally, follow these steps:

1. **Clone the repo:**
   ```bash
   git clone https://github.com/nRn-World/Doggy-Player.git
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start development mode (Electron + Vite):**
   ```bash
   npm run dev:electron
   ```

### Useful commands

| Command | What it does |
| ------- | ------------ |
| `npm run dev:electron` | Start the app in development mode (Vite + Electron) |
| `npm run lint` | TypeScript type check (`tsc --noEmit`) — required before a PR |
| `npm run build` | Build the renderer (`dist/`) without packaging |
| `npm run build:electron` | Package the Windows installer into `release/` |

Builds are unsigned, so a locally packaged installer may trigger a SmartScreen warning on Windows. That is expected.

## Coding Standards
* Use TypeScript for all new components.
* Follow the existing project structure (`src/` for React, `electron/` for main process).
* Keep the existing UI language and design language; new strings should follow the patterns already used in the app.
* Ensure your code is clean and commented where necessary.

---

By contributing, you agree that your contributions will be licensed under the project's [Non-Commercial License](LICENSE.txt).
