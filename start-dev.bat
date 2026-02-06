@echo off
REM Start dev server for Falcon Dashboard (adjust path if needed)
cd /d "D:\codes"
REM open browser and start npm start in a minimized terminal
start "" http://localhost:3000
start /min cmd /c "npm start"
exit
