@echo off
cd /d "%~dp0"
set "PATH=C:\Users\Onder\AppData\Local\Programs\nodejs;C:\Users\Onder\AppData\Local\Programs\Git\cmd;%PATH%"
title Services - Servis Takip Otomasyonu
echo ========================================================
echo   SERVICES - SERVIS TAKIP OTOMASYONU BASLATILIYOR...
echo ========================================================
echo.
echo Tarayici aciliyor: http://localhost:3000
start "" http://localhost:3000
echo.
echo Uygulama baslatiliyor...
echo Kapatmak icin bu pencereyi kapatabilirsiniz.
echo.
call npm run dev
pause
