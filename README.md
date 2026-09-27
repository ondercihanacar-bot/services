# Sanayi Servis Pro 🚗⚙️
### Çoklu Firma (SaaS) Oto Servis, Araç Takip & Yedek Parça Stok Yönetim Sistemi

Sanayi sitelerindeki tamirhaneler, mekanikçiler, elektrikçiler ve yedek parçacılar için özel olarak tasarlanmış modern, web tabanlı kurumsal yönetim platformu.

---

## 🌟 Öne Çıkan Özellikler

### 1. 🚗 Araç Takibi & Servis İş Emirleri
- **Hızlı Plaka Arama:** Türk plakası biçimli arama motoru ile saniyeler içinde araca, geçmişine ve sahibine ulaşma.
- **Canlı İş Emri Süreci:**
  - `Sırada / Beklemede` ➡️ `Teşhis & Ekspertiz` ➡️ `Parça Bekleniyor` ➡️ `Tamirde / Liftte` ➡️ `Test Sürüşü` ➡️ `Hazır (Teslim Bekliyor)` ➡️ `Teslim Edildi`.
- **Otomatik Stok Düşümü:** İş emrine yedek parça eklendiğinde dükkan deposundaki stok miktarı anında otomatik olarak düşer.
- **Gelecek Bakım Takibi:** Giriş kilometresine göre bir sonraki bakım hedef KM ve tarihi otomatik hesaplanır.
- **WhatsApp Entegrasyonu:** Tek tıkla araç sahibine WhatsApp üzerinden servis durumu ve fiyat bilgilendirme mesajı gönderme.
- **Yazdırılabilir Resmi Servis Fişi (A4):** Teklif, iş emri veya teslim tutanağı olarak antetli, garantili ve imzalı A4 servis dökümü.

### 2. 📦 Yedek Parça & Depo Stok Yönetimi
- **OEM & Barkod Takibi:** Orijinal parça kodları, barkod ve parça isimleriyle anında filtreleme.
- **Raf & Kutu Konumları:** Parçanın atölyede hangi rafta veya kutuda durduğunu tek bakışta görme.
- **Kritik Stok Uyarı Sistemi:** Emniyet stok seviyesinin altına düşen parçalar için kırmızı canlı bildirim ve tek tıkla toptan sipariş/ekleme.
- **Hızlı Stok Güncelleme:** Sayım fazlası/eksiği veya toptancıdan irsaliyeli girişler için `+1`, `+5`, `-1` tek tık hızlı butonlar.

### 3. 🏢 Çoklu Firma / SaaS (Tenant) Mimarisi
- Farklı sanayi dükkanları ve şubeler kendi verilerini bağımsız olarak yönetebilir.
- Dükkanlar arası tek tıkla geçiş yapabilme veya yeni şube/dükkan açabilme.

### 4. 📊 Finans & Kasa
- Tahsil edilen ciro ve açık hesap (veresiye/cari alacak) takibi.
- Parça ve işçilik bazlı KDV ve iskonto hesaplamaları.

---

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js (v18 veya üzeri)
- npm

### Adımlar

1. Depoyu klonlayın:
```bash
git clone https://github.com/mgokseninclk-design/services.git
cd services
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Geliştirici sunucusunu başlatın:
```bash
npm run dev
```

4. Tarayıcınızda açın:
```
http://localhost:3000
```

---

## 🛠️ Teknoloji Mimarisi

- **Framework:** Next.js 16 (App Router)
- **Frontend:** React 19, Tailwind CSS v4, Lucide Icons
- **Dil:** TypeScript
- **Veri Depolama:** `data/db.json` (Kurulum gerektirmeyen, taşınabilir ve kalıcı JSON veri motoru)
