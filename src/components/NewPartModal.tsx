'use client';

import React, { useState } from 'react';
import { Package, X, AlertCircle } from 'lucide-react';

interface NewPartModalProps {
  onClose: () => void;
  onSubmit: (partData: any) => Promise<void>;
}

export default function NewPartModal({ onClose, onSubmit }: NewPartModalProps) {
  const [code, setCode] = useState('');
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('Bosch');
  const [category, setCategory] = useState('Fren Sistemi');
  const [shelfLocation, setShelfLocation] = useState('');
  const [unit, setUnit] = useState<'Adet' | 'Litre' | 'Takım' | 'Metre'>('Adet');
  const [purchasePrice, setPurchasePrice] = useState<number | ''>(500);
  const [salePrice, setSalePrice] = useState<number | ''>(950);
  const [vatRate, setVatRate] = useState(20);
  const [stockQuantity, setStockQuantity] = useState<number | ''>(10);
  const [minStockLevel, setMinStockLevel] = useState<number | ''>(3);
  const [compatibleVehicles, setCompatibleVehicles] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      setError('Lütfen parça OEM kodunu ve parça adını eksiksiz girin.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        code: code.trim().toUpperCase(),
        barcode: barcode.trim() || undefined,
        name: name.trim(),
        brand: brand.trim(),
        category,
        shelfLocation: shelfLocation.trim() || 'Belirtilmedi',
        unit,
        purchasePrice: Number(purchasePrice) || 0,
        salePrice: Number(salePrice) || 0,
        vatRate: Number(vatRate) || 20,
        stockQuantity: Number(stockQuantity) || 0,
        minStockLevel: Number(minStockLevel) || 3,
        compatibleVehicles: compatibleVehicles.trim() || undefined
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Parça eklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto text-slate-100">
        
        {/* Başlık */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">Yeni Yedek Parça Kartı</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Parça / OEM Kodu *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Örn: 7701479159"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Barkod (Opsiyonel)</label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="86900..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Parça Adı *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Ön Fren Balata Takımı"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Marka / Üretici</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Bosch, Valeo, Castrol..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Fren Sistemi">Fren Sistemi</option>
                <option value="Filtre Grubu">Filtre Grubu</option>
                <option value="Motor Yağları & Sıvılar">Motor Yağları & Sıvılar</option>
                <option value="Ateşleme Sistemi">Ateşleme Sistemi</option>
                <option value="Şanzıman & Debriyaj">Şanzıman & Debriyaj</option>
                <option value="Süspansiyon & Direksiyon">Süspansiyon & Direksiyon</option>
                <option value="Elektrik & Aydınlatma">Elektrik & Aydınlatma</option>
                <option value="Diğer">Diğer</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Raf / Kutu Konumu</label>
              <input
                type="text"
                value={shelfLocation}
                onChange={(e) => setShelfLocation(e.target.value)}
                placeholder="Örn: Raf B-2, Kutu 14"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Birim</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Adet">Adet</option>
                <option value="Takım">Takım</option>
                <option value="Litre">Litre</option>
                <option value="Metre">Metre</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div>
              <label className="text-slate-400 block mb-1">Alış Fiyatı (TL)</label>
              <input
                type="number"
                min="0"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-white font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Satış Fiyatı (TL) *</label>
              <input
                type="number"
                min="0"
                required
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-white font-mono font-bold focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">KDV Oranı (%)</label>
              <input
                type="number"
                value={vatRate}
                onChange={(e) => setVatRate(Number(e.target.value))}
                className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-white font-mono focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Başlangıç Stoğu *</label>
              <input
                type="number"
                min="0"
                required
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Kritik Stok Uyarısı (Adet)</label>
              <input
                type="number"
                min="0"
                value={minStockLevel}
                onChange={(e) => setMinStockLevel(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Uyumlu Araçlar (Opsiyonel)</label>
            <input
              type="text"
              value={compatibleVehicles}
              onChange={(e) => setCompatibleVehicles(e.target.value)}
              placeholder="Örn: Renault Megane 4, Clio 5, Dacia Duster 1.5 dCi"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Butonlar */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold rounded-lg shadow-md shadow-amber-500/20 text-xs sm:text-sm transition-all disabled:opacity-50"
            >
              {loading ? 'Ekleniyor...' : 'Parçayı Kaydet'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
