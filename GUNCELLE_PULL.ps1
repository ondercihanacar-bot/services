[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "Services - GitHub Proje Guncelleme (Pull)"

$gitPath = "C:\Users\Onder\AppData\Local\Programs\Git\cmd;C:\Users\Onder\AppData\Local\Programs\Git\mingw64\bin;"
if ($env:Path -notlike "*$gitPath*") {
    $env:Path = $gitPath + $env:Path
}

Set-Location "C:\Users\Onder\Desktop\Services"

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "         SERVICES - GITHUB GUNCELLEME (PULL)          " -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Depo: https://github.com/mgokseninclk-design/services" -ForegroundColor Gray
Write-Host "Guncellemeler kontrol ediliyor ve cekiliyor..." -ForegroundColor Yellow
Write-Host ""

git pull origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "======================================================" -ForegroundColor Green
    Write-Host " [BASARILI] Dosyalar basariyla cekildi ve guncellendi!" -ForegroundColor Green
    Write-Host "======================================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "======================================================" -ForegroundColor Red
    Write-Host " [BILGI / HATA] Islem tamamlanamadi." -ForegroundColor Red
    Write-Host " Eger GitHub oturum acma penceresi geldiyse onaylayin." -ForegroundColor Yellow
    Write-Host "======================================================" -ForegroundColor Red
}

Write-Host ""
Write-Host "Kapatmak icin herhangi bir tusa basin..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
