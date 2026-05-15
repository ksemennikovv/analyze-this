@echo off
setlocal

set ZIP="c:\Program Files\7-Zip\7z.exe"
set ARCHIVE=deploy_%date:~6,4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%.zip
set ARCHIVE=%ARCHIVE: =0%

if /i "%1"=="full" (
  echo [FULL] Creating %ARCHIVE%...
  %ZIP% a -tzip %ARCHIVE% ^
    pages ^
    features ^
    assets ^
    prompts ^
    config ^
    src ^
    database ^
    images ^
    videos ^
    robots.txt ^
    .htaccess ^
    sitemap.xml ^
    *.php ^
    -xr!*.bat ^
    -xr!*.zip ^
    -xr!*.log ^
    -xr!storage\logs\*
) else (
  echo [DEFAULT] Creating %ARCHIVE%...
  %ZIP% a -tzip %ARCHIVE% ^
    pages ^
    features ^
    assets ^
    prompts ^
    config ^
    src ^
    robots.txt ^
    .htaccess ^
    *.php ^
    -xr!*.bat ^
    -xr!*.zip ^
    -xr!*.log
)

copy /Y %ARCHIVE% deploy_latest.zip >nul
echo Done: %ARCHIVE%
echo Latest: deploy_latest.zip
pause
