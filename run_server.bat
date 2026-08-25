@echo off
chcp 65001 > nul
echo =========================================================================
echo   GRABRIDE POWERSHELL SERVER LAUNCHER (PORT 5000)
echo =========================================================================
echo.
echo Dang mo trang web dong bo SQL Server ngai tren trinh duyet...
start http://localhost:5000/sql_management.html
echo.
powershell -ExecutionPolicy Bypass -File "server.ps1"
pause
