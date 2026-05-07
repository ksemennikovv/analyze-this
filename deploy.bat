@echo off
setlocal

set ZIP="c:\Program Files\7-Zip\7z.exe"
set ARCHIVE=deploy_%date:~6,4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%.zip
set ARCHIVE=%ARCHIVE: =0%

if /i "%1"=="full" (
  echo [FULL] Creating %ARCHIVE%...
  %ZIP% a -tzip %ARCHIVE% ^
    assets ^
    includes ^
    pages ^
    api ^
    config ^
    src ^
    prompts ^
    database ^
    images ^
    videos ^
    storage ^
    robots.txt ^
    .htaccess ^
    sitemap.xml ^
    *.php ^
    -xr!*.bat ^
    -xr!*.zip ^
    -xr!*debug.txt ^
    -xr!storage\logs\*.log
) else (
  echo [DEFAULT] Creating %ARCHIVE%...
  %ZIP% a -tzip %ARCHIVE% ^
    assets ^
    includes ^
    pages ^
    api ^
    config ^
    src ^
    prompts ^
    database ^
    robots.txt ^
    .htaccess ^
    sitemap.xml ^
    *.php ^
    -xr!*.bat ^
    -xr!*.zip ^
    -xr!*debug.txt ^
    -xr!storage\logs\*.log
)

echo Done: %ARCHIVE%
pause
