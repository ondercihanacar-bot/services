@echo off
chcp 65001 >nul
title Sanayi Servis Pro - Oto Servis ve Stok Takip
cd /d "%~dp0"

echo ======================================================================
echo    SANAYİ SERVİS PRO - OTO SERVİS VE PARÇA STOK TAKİP SİSTEMİ
echo ======================================================================
echo.

:: Node.js kontrolü
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [HATA] Node.js bilgisayarınızda bulunamadı!
    echo Lütfen https://nodejs.org adresinden Node.js kurun.
    echo.
    pause
    exit /b
)

:: Paketlerin kontrolü
if not exist "node_modules" (
    echo [BİLGİ] Gerekli paketler yükleniyor, lütfen bekleyin...
    call npm install
    echo.
)

:: Tarayıcıyı otomatik aç
echo [BİLGİ] Web arayüzü tarayıcınızda açılıyor: http://localhost:3000
timeout /t 2 /nobreak >nul
start "" http://localhost:3000

echo.
echo ======================================================================
echo    Uygulama aktif! Kapatmak istediğinizde bu pencereyi kapatabilirsiniz.
echo ======================================================================
echo.

call npm run dev
pause
