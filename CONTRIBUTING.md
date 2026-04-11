# Contributing to Doggy Player 🐶

First off, thank you for considering contributing to Doggy Player! It's people like you that make Doggy Player such a great tool.

## How Can I Contribute?

### Reporting Bugs
* Check the [Issues tab](https://github.com/nRn-World/Doggy-Player/issues) to see if the bug has already been reported.
* If not, open a new issue using the **Bug Report** template. Clearly describe the problem, including steps to reproduce it and your system information.

### Suggesting Enhancements
* Open a new issue using the **Feature Request** template.
* Include the tag `enhancement` in your suggestion.
* Explain why this feature would be useful and how you imagine it working.

### Pull Requests
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/amazing-feature`).
3. Make your changes.
4. Run `npm run lint` to ensure there are no TypeScript errors.
5. Commit your changes (`git commit -m 'Add some amazing feature'`).
6. Push to the branch (`git push origin feature/amazing-feature`).
7. Open a Pull Request and fill out the provided template.

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

## Coding Standards
* Use TypeScript for all new components.
* Follow the existing project structure (`src/` for React, `electron/` for main process).
* Ensure your code is clean and commented where necessary.

---

By contributing, you agree that your contributions will be licensed under the project's [Non-Commercial License](LICENSE).
