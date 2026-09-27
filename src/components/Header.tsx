'use client';

import React, { useState } from 'react';
import { Shop } from '@/types';
import { Wrench, Plus, PackagePlus, Building2, Search, Car } from 'lucide-react';

interface HeaderProps {
  shops: Shop[];
  activeShopId: string;
  onSelectShop: (shopId: string) => void;
  onOpenNewOrder: () => void;
  onOpenNewPart: () => void;
  onOpenNewShop: () => void;
  onSearchPlate: (plate: string) => void;
}

export default function Header({
  shops,
  activeShopId,
  onSelectShop,
  onOpenNewOrder,
  onOpenNewPart,
  onOpenNewShop,
  onSearchPlate
}: HeaderProps) {
  const [plateQuery, setPlateQuery] = useState('');
  const activeShop = shops.find((s) => s.id === activeShopId) || shops[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (plateQuery.trim()) {
      onSearchPlate(plateQuery.trim());
    }
  };

  return (
    <header className="no-print bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-orange-500/20 text-slate-950 font-black">
              <Wrench className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">SANAYİ SERVİS</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded">SaaS</span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Oto Servis & Parça Stok Yönetimi</p>
            </div>
          </div>

          {/* Hızlı Plaka Arama (Turkish License Plate Box) */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-2">
            <div className="relative flex items-center">
              {/* TR Plate Flag Badge */}
              <div className="absolute left-1.5 top-1.5 bottom-1.5 w-7 bg-blue-700 rounded flex flex-col items-center justify-center text-[9px] font-black text-white pointer-events-none select-none">
                <span>TR</span>
              </div>
              <input
                type="text"
                value={plateQuery}
                onChange={(e) => setPlateQuery(e.target.value.toUpperCase())}
                placeholder="HIZLI PLAKA SORGULA (Örn: 34 AB 1234)"
                className="w-full pl-11 pr-10 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono font-bold tracking-wider placeholder:text-slate-500 placeholder:font-sans placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 text-slate-400 hover:text-amber-400 transition-colors p-1"
                title="Plakayı Ara"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Dükkan / Şube Seçici & Eylemler */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Shop Switcher */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1">
              <Building2 className="w-4 h-4 text-slate-400 ml-2 mr-1 hidden sm:inline" />
              <select
                value={activeShopId}
                onChange={(e) => {
                  if (e.target.value === 'NEW') {
                    onOpenNewShop();
                  } else {
                    onSelectShop(e.target.value);
                  }
                }}
                className="bg-transparent text-xs sm:text-sm font-medium text-slate-200 focus:outline-none cursor-pointer pr-2 py-1 max-w-[140px] sm:max-w-[200px] truncate"
              >
                {shops.map((shop) => (
                  <option key={shop.id} value={shop.id} className="bg-slate-900 text-white">
                    {shop.name}
                  </option>
                ))}
                <option value="NEW" className="bg-slate-900 text-amber-400 font-semibold">
                  + Yeni Dükkan / Şube Aç
                </option>
              </select>
            </div>

            {/* Quick Action: Yeni Parça Ekle */}
            <button
              onClick={onOpenNewPart}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all"
              title="Yeni Stok Parçası Ekle"
            >
              <PackagePlus className="w-4 h-4 text-amber-400" />
              <span>Parça Ekle</span>
            </button>

            {/* Quick Action: Yeni İş Emri Aç */}
            <button
              onClick={onOpenNewOrder}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Car className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">İş Emri Aç</span>
              <span className="sm:hidden">Kabul</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
