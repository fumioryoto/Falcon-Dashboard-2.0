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

---

## **macOS: Setup & Run Guide**

### **Prerequisites (macOS)**

Before running the Falcon Dashboard on Mac, ensure you have the following installed:

1. **Xcode Command Line Tools** — Required for compiling native modules

   ```bash
   xcode-select --install
   ```

2. **Homebrew** (optional but recommended) — Package manager for Mac

   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

3. **Node.js & npm** — Install via Homebrew or from [nodejs.org](https://nodejs.org)

   ```bash
   # Using Homebrew
   brew install node

   # Or download from nodejs.org (16+ recommended)
   ```

   Verify installation:

   ```bash
   node --version
   npm --version
   ```

### **Installation (macOS)**

1. Navigate to your project directory:

   ```bash
   cd /path/to/falcon-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### **Run (Development Mode)**

Start the development server with hot reload:

```bash
npm start
```

The app will open automatically at `http://localhost:3000`.

**Or use the provided shell script:**

Create `start-dev.sh` in the project root:

```bash
#!/bin/bash
cd "$(dirname "$0")"
open http://localhost:3000
npm start
```

Make it executable and run:

```bash
chmod +x start-dev.sh
./start-dev.sh
```

### **Build (Production)**

Create an optimized production build:

```bash
npm run build
```

Output is in the `build/` folder.

**Serve the production build locally:**

```bash
# Install serve globally (one-time only)
npm install -g serve

# Serve the build
serve -s build

# Or specify a custom port
serve -s build -p 3000
```

**Or use the provided shell script:**

Create `start-serve.sh` in the project root:

```bash
#!/bin/bash
cd "$(dirname "$0")"
serve -s build --listen 3000 &
sleep 2
open http://localhost:3000
```

Make it executable and run:

```bash
chmod +x start-serve.sh
./start-serve.sh
```

### **Run at Startup (macOS)**

To automatically run the Falcon Dashboard when you log in, use **LaunchAgent**:

**Option 1: Development mode at startup**

1. Create a LaunchAgent plist file:

   ```bash
   nano ~/Library/LaunchAgents/com.falcon-dashboard.dev.plist
   ```

2. Paste this content (replace `/path/to` with your actual project path):

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
   <plist version="1.0">
   <dict>
       <key>Label</key>
       <string>com.falcon-dashboard.dev</string>
       <key>ProgramArguments</key>
       <array>
           <string>/bin/bash</string>
           <string>/path/to/falcon-dashboard/start-dev.sh</string>
       </array>
       <key>RunAtLoad</key>
       <true/>
       <key>StandardOutPath</key>
       <string>/tmp/falcon-dev.log</string>
       <key>StandardErrorPath</key>
       <string>/tmp/falcon-dev-error.log</string>
   </dict>
   </plist>
   ```

3. Load the agent:
   ```bash
   launchctl load ~/Library/LaunchAgents/com.falcon-dashboard.dev.plist
   ```

**Option 2: Production mode at startup**

1. First, build the project:

   ```bash
   npm run build
   npm install -g serve
   ```

2. Create a LaunchAgent plist file:

   ```bash
   nano ~/Library/LaunchAgents/com.falcon-dashboard.prod.plist
   ```

3. Paste this content:

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
   <plist version="1.0">
   <dict>
       <key>Label</key>
       <string>com.falcon-dashboard.prod</string>
       <key>ProgramArguments</key>
       <array>
           <string>/bin/bash</string>
           <string>/path/to/falcon-dashboard/start-serve.sh</string>
       </array>
       <key>RunAtLoad</key>
       <true/>
       <key>StandardOutPath</key>
       <string>/tmp/falcon-prod.log</string>
       <key>StandardErrorPath</key>
       <string>/tmp/falcon-prod-error.log</string>
   </dict>
   </plist>
   ```

4. Load the agent:
   ```bash
   launchctl load ~/Library/LaunchAgents/com.falcon-dashboard.prod.plist
   ```

**To unload/stop the service:**

```bash
launchctl unload ~/Library/LaunchAgents/com.falcon-dashboard.dev.plist
launchctl unload ~/Library/LaunchAgents/com.falcon-dashboard.prod.plist
```

**View logs:**

```bash
tail -f /tmp/falcon-dev.log
tail -f /tmp/falcon-prod.log
```

---

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
