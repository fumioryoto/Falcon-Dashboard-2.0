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

**Windows: Run at Startup (included .bat files)**

Two startup scripts are provided in the repo root:

1. **`start-dev.bat`** — Run dev server at login
   - Starts the development server with hot reload.
   - Opens browser at `http://localhost:3000`.
   - Usage: Create a shortcut and place it in `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup`.

   Contents:

   ```bat
   @echo off
   cd /d "D:\Falcon-Dashboard-2.0"
   start "" http://localhost:3000
   start /min cmd /c "npm start"
   exit
   ```

2. **`start-serve.bat`** — Serve production build at login
   - First run `npm run build` to generate the production bundle.
   - Install serve globally: `npm i -g serve`.
   - Starts the static production server.
   - Opens browser at `http://localhost:3000`.
   - Usage: Create a shortcut and place it in `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup`.

   Contents:

   ```bat
   @echo off
   cd /d "D:\Falcon-Dashboard-2.0"
   start /min cmd /c "serve -s build --listen 3000"
   start "" http://localhost:3000
   exit
   ```

**Quick Setup for Auto-Start:**

```powershell
# To run at login, create shortcuts to either .bat file and place them in:
# %APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
# Or use this PowerShell command to create a shortcut automatically (replace USERNAME):

$shortcut = New-Object -ComObject WScript.Shell
$link = $shortcut.CreateShortCut("$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup\Falcon-Dashboard.lnk")
$link.TargetPath = "D:\codes\start-dev.bat"
$link.Save()
```

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
