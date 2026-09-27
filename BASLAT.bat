@echo off
cd /d "%~dp0"
title Sanayi Servis Pro
echo ========================================================
echo   SANAYI SERVIS PRO BASLATILIYOR...
echo ========================================================
echo.
echo Tarayici aciliyor: http://localhost:3000
start "" http://localhost:3000
echo.
echo Uygulama baslatiliyor...
echo Kapatmak icin bu pencereyi kapatabilirsiniz.
echo.
npm run dev
pause
