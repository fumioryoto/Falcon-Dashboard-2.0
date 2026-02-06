**Falcon Dashboard**

Quick guide to set up, run and deploy the Falcon Dashboard (React + Tailwind) on Windows.

**Requirements:**

- Node.js (16+ recommended)
- npm (bundled with Node.js)

**Install**

- Open PowerShell or Command Prompt in the project root (where `package.json` is).
- Install dependencies:

```bash
npm install
```

**Run (development)**

- Start the dev server (fast, with hot reload):

```bash
npm start
```

The app will be served at `http://localhost:3000` by default.

**Build (production)**

- Create an optimized production build:

```bash
npm run build
```

The static build output is in the `build/` folder. You can serve it with a static server such as `serve`:

```bash
npm install -g serve
serve -s build
```

**Windows: Run at Startup (two options)**

- Option A — Run dev server at login
  1. Create a `.bat` file (example below) and update the path to your project root.
  2. Place a shortcut to the `.bat` in your Startup folder: `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup`.

Example `start-dev.bat`:

```bat
@echo off
cd /d "D:\path\to\your\project"
start /min cmd /c "npm start"
exit
```

- Option B — Serve production build at login
  1. Run `npm run build` once to create `build/`.
  2. Install `serve` globally: `npm i -g serve`.
  3. Create a `start-serve.bat` pointing to `serve -s build` and add a shortcut to the Startup folder.

Example `start-serve.bat`:

```bat
@echo off
cd /d "D:\path\to\your\project"
start /min cmd /c "serve -s build --listen 3000"
start "" http://localhost:3000
exit
```

Note: The included `to-do.bat` is an example that launches `npm start` and opens the browser — update its path before using.

**Key files / components**

- [public/index.html](public/index.html): page title and favicon.
- [public/falcon-logo.svg](public/falcon-logo.svg): transparent Falcon SVG used as logo and favicon.
- [src/App.js](src/App.js): main application component (task UI, toolbar, export/import, theme toggle).
- [src/index.css](src/index.css): global styles and light-mode overrides.
- `tailwind.config.js`, `postcss.config.js`: Tailwind / PostCSS config.

**Notable features**

- Persistent tasks saved to `localStorage` (`myTodos`, `removedTodos`, `streak`, `achievements`).
- Export / Import JSON backup & restore from `src/App.js` (download and upload).
- Global web shortcuts toolbar (Translate, WhatsApp, Telegram, Discord) and per-task action buttons.
- Light / Dark theme toggle with persisted preference.

**Troubleshooting**

- If you encounter build syntax errors, ensure config files (`tailwind.config.js`, `postcss.config.js`) are valid JavaScript and there are no stray JSX characters in components (for example `</>` must be escaped inside text).
- If `npm run build` fails, run `npm install` again and check Node version.

**Development tips**

- Use `Ctrl+N` to focus the task input in the app.
- Use `Ctrl+S` to save tasks to `localStorage` (the app autosaves on change).

If you want, I can also add a small `start-dev.bat` and `start-serve.bat` into the repo with the correct paths filled for your environment.
