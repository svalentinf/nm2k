@echo off
setlocal EnableDelayedExpansion
title NMEA2000 Server

REM ================= CONFIG =================
set REPO_OWNER=svalentinf
set REPO_NAME=nm2k
set INSTALL_DIR=%~dp0app
set NODE_ENTRY=server\listener.js
set EXTRACTED_FOLDER=%REPO_NAME%-main
set MARKER_FILE=%INSTALL_DIR%\.last_update
REM ==========================================
echo.
echo === Starting server launcher ===
echo.

REM ===== CHECK NODE =====
where node >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed. Download from: https://nodejs.org/en/download
    pause
    exit /b 1
)

REM ===== PREP DIR =====
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"
cd /d "%INSTALL_DIR%"

REM ===== CHECK IF UPDATE IS NEEDED =====
set UPDATE_NEEDED=1

REM Build full path to extracted folder
set "FULL_EXTRACTED_PATH=%INSTALL_DIR%\%EXTRACTED_FOLDER%"

REM Check if extracted folder exists
if exist "%FULL_EXTRACTED_PATH%" (
    REM Check if marker file exists and is recent
    if exist "%MARKER_FILE%" (
        REM Use PowerShell to check if marker file is less than 30 days old
        powershell -NoProfile -Command "$lastWrite = (Get-Item '%MARKER_FILE%').LastWriteTime; $age = (Get-Date) - $lastWrite; if ($age.TotalDays -lt 30) { exit 0 } else { exit 1 }"
        if !errorlevel! == 0 (
            set UPDATE_NEEDED=0
            echo Installation is recent (less than 30 days old)
        ) else (
            echo Installation is older than 30 days, updating...
        )
    ) else (
        echo Marker file not found, updating...
    )
) else (
    echo Installation not found, downloading...
)

REM ===== UPDATE IF NEEDED =====
if %UPDATE_NEEDED% == 1 (
    REM Clean up old installation if exists
    if exist "%FULL_EXTRACTED_PATH%" rmdir /s /q "%FULL_EXTRACTED_PATH%"
    if exist "%INSTALL_DIR%\main.zip" del "%INSTALL_DIR%\main.zip"

    REM ===== DOWNLOAD MAIN ZIP =====
    echo Downloading main branch...

    powershell -NoProfile -Command "Invoke-WebRequest 'https://github.com/%REPO_OWNER%/%REPO_NAME%/archive/refs/heads/main.zip' -OutFile '%INSTALL_DIR%\main.zip'"

    if errorlevel 1 (
        echo.
        echo *** DOWNLOAD FAILED ***
        pause
        exit /b 1
    )

    REM ===== EXTRACT =====
    echo Extracting...
    powershell -NoProfile -Command "Expand-Archive -Force '%INSTALL_DIR%\main.zip' '%INSTALL_DIR%'; Remove-Item '%INSTALL_DIR%\main.zip'"

    if errorlevel 1 (
        echo.
        echo *** EXTRACTION FAILED ***
        pause
        exit /b 1
    )

    REM Create/update marker file
    echo Update completed at: %date% %time% > "%MARKER_FILE%"


    REM ===== ENTER EXTRACTED FOLDER =====
    if not exist "%FULL_EXTRACTED_PATH%" (
        echo ERROR: Extracted folder not found: %FULL_EXTRACTED_PATH%
        pause
        exit /b 1
    )
    cd /d "%FULL_EXTRACTED_PATH%"

    REM ===== ENSURE EXECUTION POLICY (User scope - no admin needed) =====
    echo Checking execution policy...
    powershell -NoProfile -Command "if ((Get-ExecutionPolicy -Scope CurrentUser) -ne 'RemoteSigned') { Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force }"

    REM ===== INSTALL/UPDATE DEPS =====
    if exist package.json (
        echo Checking dependencies...
        npm install
        if errorlevel 1 (
            echo.
            echo *** NPM INSTALL FAILED ***
            pause
            exit /b 1
        )
    )
)
REM ===== START SERVER AND OPEN HTML FILE =====
echo.
echo Starting server and opening index.html...
echo.

REM Start server in background
start "NMEA2000 Server" node %NODE_ENTRY%

REM Wait 2 seconds for server to initialize
timeout /t 2 /nobreak >nul

REM Get the full path to public/index.html and open it
set "HTML_PATH=%FULL_EXTRACTED_PATH%\public\index.html"

REM Check if the file exists
if exist "%HTML_PATH%" (
    echo Opening: %HTML_PATH%
    start "" "%HTML_PATH%"
) else (
    echo WARNING: File not found - %HTML_PATH%
    dir "%FULL_EXTRACTED_PATH%\public" 2>nul || echo Public folder not found
)

echo.
echo === Server is running - press Ctrl+C in the server window to stop ===
echo.
echo The HTML interface should have opened in your browser.
echo If not, navigate to:
echo   %HTML_PATH%


REM ===== START SERVER =====
echo.
echo Starting server...
echo.

node %FULL_EXTRACTED_PATH%\%NODE_ENTRY%

echo.

echo ========================================
:confirm_exit
choice /c X /n /m "Press X to close: "
if errorlevel 2 goto confirm_exit

echo === Server stopped ===
pause