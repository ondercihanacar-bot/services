'use client';

import React, { useState } from 'react';
import { Part } from '@/types/index';
import { formatCurrency } from '@/lib/utils';
import {
  Package,
  Search,
  Plus,
  AlertTriangle,
  Tag,
  MapPin
} from 'lucide-react';

interface InventoryViewProps {
  parts: Part[];
  onOpenNewPart: () => void;
  onOpenQuickStock: (part: Part) => void;
  onQuickAdjust: (partId: string, delta: number) => void;
}

const CATEGORIES = [
  'Tümü',
  'Fren Sistemi',
  'Filtre & Bakım',
  'Motor & Mekanik',
  'Ön Takım & Süspansiyon',
  'Ateşleme & Elektrik',
  'Sıvı & Yağlar'
];

export default function InventoryView({
  parts,
  onOpenNewPart,
  onQuickAdjust
}: InventoryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Filtreleme
  const filteredParts = parts.filter((part) => {
    // Kategori
    if (selectedCategory !== 'Tümü' && part.category !== selectedCategory) {
      return false;
    }
    // Kritik Stok
    if (showLowStockOnly && part.stockQuantity > part.minStockLevel) {
      return false;
    }
    // Arama
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        part.name.toLowerCase().includes(q) ||
        part.code.toLowerCase().includes(q) ||
        part.brand.toLowerCase().includes(q) ||
        (part.shelfLocation && part.shelfLocation.toLowerCase().includes(q)) ||
        (part.barcode && part.barcode.includes(q))
      );
    }
    return true;
  });

  const lowStockCount = parts.filter((p) => p.stockQuantity <= p.minStockLevel).length;

  return (
    <div className="space-y-6">
      
      {/* Başlık & Yeni Parça Butonu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0c243f] flex items-center gap-2">
            <Package className="w-6 h-6 text-cyan-600" />
            Parça & Stok Takibi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Servis deposundaki parçalar, raf konumları, kritik stok uyarıları ve alış/satış fiyatları.
          </p>
        </div>

        <button
          onClick={onOpenNewPart}
          className="btn-tech-primary self-start sm:self-auto px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-cyan-300 stroke-[3]" />
          Yeni Parça Kartı Ekle
        </button>
      </div>

      {/* Arama & Filtre Paneli */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Arama Çubuğu */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Parça Adı, OEM Kodu, Marka veya Raf No ile ara..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:bg-white transition-all"
            />
          </div>

          {/* Kritik Stok Toggle Butonu */}
          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 border transition-all cursor-pointer ${
              showLowStockOnly
                ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${showLowStockOnly ? 'text-white' : 'text-rose-500'}`} />
            Kritik Stoklar
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
              showLowStockOnly ? 'bg-rose-800 text-white' : 'bg-rose-100 text-rose-700'
            }`}>
              {lowStockCount}
            </span>
          </button>
        </div>

        {/* Kategori Butonları */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'btn-tech-active-tab'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-cyan-50 hover:text-cyan-700 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Parçalar Tablosu */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3.5 px-4">Parça / OEM Kodu</th>
                <th className="py-3.5 px-4">Parça Adı & Marka</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Raf / Konum</th>
                <th className="py-3.5 px-4 text-center">Mevcut Stok</th>
                <th className="py-3.5 px-4 text-right">Alış Fiyatı</th>
                <th className="py-3.5 px-4 text-right">Satış Fiyatı</th>
                <th className="py-3.5 px-4 text-center">Hızlı Stok</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Kriterlerinize uygun parça bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredParts.map((part) => {
                  const isLowStock = part.stockQuantity <= part.minStockLevel;
                  const profit = part.salePrice - part.purchasePrice;
                  const profitMargin = part.purchasePrice > 0 ? Math.round((profit / part.purchasePrice) * 100) : 0;

                  return (
                    <tr key={part.id} className="hover:bg-cyan-50/30 transition-colors">
                      {/* Kod & Barkod */}
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-800">
                        {part.code}
                        {part.barcode && (
                          <span className="block font-sans font-normal text-[10px] text-slate-400">
                            Barkod: {part.barcode}
                          </span>
                        )}
                      </td>

                      {/* Parça Adı & Marka & Uyum */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{part.name}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="text-cyan-700 font-semibold">{part.brand}</span>
                          {part.compatibleVehicles && (
                            <span className="text-slate-400 truncate max-w-[200px]" title={part.compatibleVehicles}>
                              • {part.compatibleVehicles}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Kategori */}
                      <td className="py-3.5 px-4 text-slate-600 text-xs">
                        <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 font-medium">
                          <Tag className="w-3 h-3 text-slate-400" />
                          {part.category}
                        </span>
                      </td>

                      {/* Raf / Kutu Yeri */}
                      <td className="py-3.5 px-4 text-slate-700 font-medium text-xs">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-cyan-600" />
                          {part.shelfLocation || 'Konum Yok'}
                        </span>
                      </td>

                      {/* Stok Miktarı & Rozet */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-block">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-xs ${
                              isLowStock
                                ? 'bg-rose-50 text-rose-700 border border-rose-200 font-extrabold'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {isLowStock && <AlertTriangle className="w-3 h-3 text-rose-500" />}
                            {part.stockQuantity} {part.unit}
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">
                            Kritik Sınır: {part.minStockLevel}
                          </span>
                        </div>
                      </td>

                      {/* Alış Fiyatı */}
                      <td className="py-3.5 px-4 text-right text-slate-500 font-mono">
                        {formatCurrency(part.purchasePrice)}
                      </td>

                      {/* Satış Fiyatı & Kâr */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(part.salePrice)}
                        <span className="block font-sans font-normal text-[10px] text-emerald-600">
                          +%{profitMargin} kâr
                        </span>
                      </td>

                      {/* Hızlı Stok Artırma / Azaltma */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                          <button
                            onClick={() => onQuickAdjust(part.id, -1)}
                            disabled={part.stockQuantity <= 0}
                            className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs bg-white hover:bg-slate-200 text-slate-700 shadow-2xs disabled:opacity-40 cursor-pointer"
                            title="Stoktan 1 Azalt"
                          >
                            -
                          </button>
                          <button
                            onClick={() => onQuickAdjust(part.id, 1)}
                            className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs bg-white hover:bg-cyan-50 text-cyan-700 shadow-2xs cursor-pointer"
                            title="Stoğa 1 Ekle"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => onQuickAdjust(part.id, 5)}
                            className="px-1.5 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] btn-tech-primary cursor-pointer"
                            title="Stoğa 5 Ekle (Toptan)"
                          >
                            +5
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
