@echo off
setlocal
cd /d "%~dp0"
set "OPEN_BROWSER=1"
if /I "%~1"=="--no-open" set "OPEN_BROWSER=0"

echo [1/4] checking npm...
where npm >nul 2>nul
if errorlevel 1 (
  echo npm is not found in PATH.
  echo Please install Node.js and reopen this script.
  pause
  exit /b 1
)

echo [2/4] building offline dist...
call npm run build:offline
if errorlevel 1 (
  echo build failed.
  pause
  exit /b 1
)

echo [3/4] opening browser...
if "%OPEN_BROWSER%"=="1" (
  start "" "http://localhost:4173/quant-dashboard/"
)

echo [4/4] starting local preview server on port 4173...
echo Keep this window open while using the app.
call npm run preview -- --host --port 4173

endlocal
