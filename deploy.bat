@echo off
setlocal

set ZIP="c:\Program Files\7-Zip\7z.exe"
set ARCHIVE=deploy_%date:~6,4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%.zip
set ARCHIVE=%ARCHIVE: =0%

if /i "%1"=="full" (
  echo [FULL] Creating %ARCHIVE%...
  %ZIP% a -tzip %ARCHIVE% ^
    css ^
    js ^
    php ^
    images ^
    videos ^
    prompt.txt ^
    robots.txt ^
    *.html ^
    -xr!*.bat ^
    -xr!*.zip ^
    -xr!*debug.txt ^
    -xr!*amo_log.txt ^
    -xr!amo\tokens.txt ^
    -xr!wp-content\cache ^
    -xr!wp-content\backups-dup-lite ^
    -xr!wp-content\backups-dup-pro ^
    -xr!wp-content\docket-cache-data ^
    -xr!wp-content\wpo-cache ^
    -xr!wp-content\upgrade ^
    -xr!wp-content\upgrade-temp-backup
) else (
  echo [DEFAULT] Creating %ARCHIVE%...
  %ZIP% a -tzip %ARCHIVE% ^
    css ^
    js ^
    php ^
    prompt.txt ^
    robots.txt ^
    *.html ^
    -xr!*.bat ^
    -xr!*.zip ^
    -xr!*debug.txt ^
    -xr!*amo_log.txt ^
    -xr!amo\tokens.txt
)

echo Done: %ARCHIVE%
pause
