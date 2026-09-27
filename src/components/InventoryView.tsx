'use client';

import React, { useState } from 'react';
import { Part } from '@/types';
import { formatCurrency } from '@/lib/utils';
import {
  Package,
  Search,
  Plus,
  AlertTriangle,
  MapPin,
  Tag,
  ArrowUpDown,
  CheckCircle2,
  Edit2
} from 'lucide-react';

interface InventoryViewProps {
  parts: Part[];
  onOpenNewPart: () => void;
  onOpenQuickStock: (part: Part) => void;
  onQuickAdjust: (partId: string, delta: number) => Promise<void>;
}

const CATEGORIES = [
  'Tümü',
  'Fren Sistemi',
  'Filtre Grubu',
  'Motor Yağları & Sıvılar',
  'Ateşleme Sistemi',
  'Şanzıman & Debriyaj',
  'Süspansiyon & Direksiyon',
  'Elektrik & Aydınlatma',
  'Diğer'
];

export default function InventoryView({
  parts,
  onOpenNewPart,
  onOpenQuickStock,
  onQuickAdjust
}: InventoryViewProps) {
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const filteredParts = parts.filter((part) => {
    if (showLowStockOnly && part.stockQuantity > part.minStockLevel) {
      return false;
    }
    if (selectedCategory !== 'Tümü' && part.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
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
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-amber-400" />
            Yedek Parça & Stok Takibi
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Dükkandaki parçalar, raf konumları, kritik stok uyarıları ve alış/satış fiyatları.
          </p>
        </div>

        <button
          onClick={onOpenNewPart}
          className="self-start sm:self-auto px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold rounded-lg shadow-md shadow-amber-500/20 text-sm flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Yeni Parça Kartı Ekle
        </button>
      </div>

      {/* Arama & Filtre Paneli */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Arama Çubuğu */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Parça Adı, OEM Kodu, Marka veya Raf No ile ara..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Kritik Stok Toggle Butonu */}
          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shrink-0 border transition-all ${
              showLowStockOnly
                ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${showLowStockOnly ? 'text-white' : 'text-rose-400'}`} />
            Kritik Stoklar
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
              showLowStockOnly ? 'bg-rose-700 text-white' : 'bg-rose-500/20 text-rose-300'
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
              className={`px-3 py-1 text-xs font-semibold rounded-lg shrink-0 transition-colors ${
                selectedCategory === cat
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Parçalar Tablosu */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Parça / OEM Kodu</th>
                <th className="py-3 px-4">Parça Adı & Marka</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Raf / Konum</th>
                <th className="py-3 px-4 text-center">Mevcut Stok</th>
                <th className="py-3 px-4 text-right">Alış Fiyatı</th>
                <th className="py-3 px-4 text-right">Satış Fiyatı</th>
                <th className="py-3 px-4 text-center">Hızlı Stok</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Kriterlerinize uygun parça bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredParts.map((part) => {
                  const isLowStock = part.stockQuantity <= part.minStockLevel;
                  const profit = part.salePrice - part.purchasePrice;
                  const profitMargin = part.purchasePrice > 0 ? Math.round((profit / part.purchasePrice) * 100) : 0;

                  return (
                    <tr key={part.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Kod & Barkod */}
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">
                        {part.code}
                        {part.barcode && (
                          <span className="block font-sans font-normal text-[10px] text-slate-500">
                            Barkod: {part.barcode}
                          </span>
                        )}
                      </td>

                      {/* Parça Adı & Marka & Uyum */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{part.name}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="text-amber-500/90 font-medium">{part.brand}</span>
                          {part.compatibleVehicles && (
                            <span className="text-slate-500 truncate max-w-[200px]" title={part.compatibleVehicles}>
                              • {part.compatibleVehicles}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Kategori */}
                      <td className="py-3 px-4 text-slate-400 text-xs">
                        <span className="inline-flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          <Tag className="w-3 h-3 text-slate-500" />
                          {part.category}
                        </span>
                      </td>

                      {/* Raf / Kutu Yeri */}
                      <td className="py-3 px-4 text-slate-300 font-medium text-xs">
                        <span className="inline-flex items-center gap-1 text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-amber-500/70" />
                          {part.shelfLocation || 'Konum Yok'}
                        </span>
                      </td>

                      {/* Stok Miktarı & Rozet */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-block">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-xs ${
                              isLowStock
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {isLowStock && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                            {part.stockQuantity} {part.unit}
                          </span>
                          <span className="block text-[10px] text-slate-500 mt-0.5">
                            Kritik: {part.minStockLevel}
                          </span>
                        </div>
                      </td>

                      {/* Alış Fiyatı */}
                      <td className="py-3 px-4 text-right text-slate-400 font-mono">
                        {formatCurrency(part.purchasePrice)}
                      </td>

                      {/* Satış Fiyatı & Kâr */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-white">
                        {formatCurrency(part.salePrice)}
                        <span className="block font-sans font-normal text-[10px] text-emerald-400">
                          +%{profitMargin} kâr
                        </span>
                      </td>

                      {/* Hızlı Stok Artırma / Azaltma */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                          <button
                            onClick={() => onQuickAdjust(part.id, -1)}
                            disabled={part.stockQuantity <= 0}
                            className="w-6 h-6 rounded flex items-center justify-center font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-800"
                            title="Stoktan 1 Azalt"
                          >
                            -
                          </button>
                          <button
                            onClick={() => onQuickAdjust(part.id, 1)}
                            className="w-6 h-6 rounded flex items-center justify-center font-bold text-xs bg-slate-800 hover:bg-slate-700 text-emerald-400"
                            title="Stoğa 1 Ekle"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => onQuickAdjust(part.id, 5)}
                            className="px-1.5 h-6 rounded flex items-center justify-center font-bold text-[10px] bg-slate-800 hover:bg-slate-700 text-blue-400"
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
