@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Install a current Node.js runtime, then run this file again.
  pause
  exit /b 1
)
start "" /b node server.mjs
timeout /t 1 /nobreak >nul
start "Battle Heroes Local Co-op Prototype" "http://localhost:4173"
exit /b 0
