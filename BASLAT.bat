@echo off
chcp 65001 >nul
cd /d "%~dp0"
set "PATH=C:\Users\Onder\AppData\Local\Programs\nodejs;C:\Users\Onder\AppData\Local\Programs\Git\cmd;%PATH%"
title Services - Servis Takip Otomasyonu

echo ========================================================
echo   SERVICES - OTO SERVIS TAKIP OTOMASYONU
echo ========================================================
echo.

netstat -ano | findstr :3000 | findstr LISTENING >nul
if %ERRORLEVEL% equ 0 (
    echo [BILGI] Uygulama sunucusu zaten calisiyor.
    echo Tarayici aciliyor: http://localhost:3000
    start "" http://localhost:3000
    timeout /t 3 >nul
    exit /b 0
)

echo Tarayici aciliyor: http://localhost:3000
start "" http://localhost:3000
echo.
echo Sunucu baslatiliyor (Next.js)...
echo (Kapatmak istediginizde bu pencereyi kapatabilirsiniz)
echo.

call npm run dev
pause
