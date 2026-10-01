@echo off
title Agentic Essence — Cyberdeck Console v3.0
color 0b
echo ========================================================
echo   AGENTIC ESSENCE — Autonomous Cyberdeck Console v3.0
echo   Windows Desktop Edition (Fast, Native, Zero Bloat)
echo ========================================================
echo.

REM Check if Python 3 is available
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    where py >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo [OK] Using Python Launcher (py)...
        py launcher.py
        goto :EOF
    )
    echo [ERROR] Python 3 was not found on your system.
    echo Please install Python 3 from https://www.python.org/downloads/
    echo (Make sure to check "Add python.exe to PATH" during installation)
    echo.
    pause
    exit /b 1
)

echo [OK] Launching Agentic Essence Desktop Cyberdeck...
python launcher.py
