@echo off
chcp 65001 > nul
echo =========================================================================
echo   GRABRIDE POWERSHELL SERVER LAUNCHER (PORT 5000)
echo =========================================================================
echo.
powershell -ExecutionPolicy Bypass -File "server.ps1"
pause
