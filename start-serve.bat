@echo off
REM Serve the production build for Falcon Dashboard.
REM Install 'serve' globally first: npm i -g serve
cd /d "D:\codes"
REM Run serve in a minimized terminal and open the browser
start /min cmd /c "serve -s build --listen 3000"
start "" http://localhost:3000
exit
