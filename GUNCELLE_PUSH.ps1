[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "Services - GitHub Proje Gonder (Push)"

$gitPath = "C:\Users\Onder\AppData\Local\Programs\Git\cmd;C:\Users\Onder\AppData\Local\Programs\Git\mingw64\bin;"
if ($env:Path -notlike "*$gitPath*") {
    $env:Path = $gitPath + $env:Path
}

Set-Location "C:\Users\Onder\Desktop\Services"

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "         SERVICES - GITHUB PROJE GONDER (PUSH)        " -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Depo: https://github.com/mgokseninclk-design/services" -ForegroundColor Gray
Write-Host "Degisiklikler GitHub'a yukleniyor (git push origin main)..." -ForegroundColor Yellow
Write-Host ""

git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "======================================================" -ForegroundColor Green
    Write-Host " [BASARILI] Proje GitHub'a basariyla gonderildi (Push)!" -ForegroundColor Green
    Write-Host "======================================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "======================================================" -ForegroundColor Red
    Write-Host " [BILGI / HATA] Gonderim tamamlanamadi." -ForegroundColor Red
    Write-Host " Eger GitHub oturum acma penceresi geldiyse onaylayin." -ForegroundColor Yellow
    Write-Host "======================================================" -ForegroundColor Red
}

Write-Host ""
Write-Host "Kapatmak icin herhangi bir tusa basin..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
