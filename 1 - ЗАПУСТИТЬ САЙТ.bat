@echo off
cd /d "%~dp0"

curl.exe --silent --fail http://127.0.0.1:4174/ >nul 2>nul
if not errorlevel 1 (
  echo MARGINS is already running at http://127.0.0.1:4174
  if not defined MARGINS_NO_BROWSER start "" http://127.0.0.1:4174
  exit /b 0
)

python --version >nul 2>nul
if not errorlevel 1 (
  set "PYTHON_CMD=python"
  goto launch
)

py -3 --version >nul 2>nul
if not errorlevel 1 (
  set "PYTHON_CMD=py -3"
  goto launch
)

echo Python was not found.
echo Install Python 3 and run this file again.
pause
exit /b 1

:launch
echo MARGINS is available at http://127.0.0.1:4174
echo Keep this window open while using the website.
if not defined MARGINS_NO_BROWSER start "" http://127.0.0.1:4174
%PYTHON_CMD% -m http.server 4174 --bind 127.0.0.1
