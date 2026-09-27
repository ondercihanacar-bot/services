'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Shop, Vehicle, Customer } from '@/types/index';
import { Wrench, Plus, PackagePlus, Building2, Search, Car, User, ArrowRight } from 'lucide-react';

interface HeaderProps {
  shops: Shop[];
  activeShopId: string;
  vehicles: (Vehicle & { customer?: Customer })[];
  onSelectShop: (shopId: string) => void;
  onOpenNewOrder: () => void;
  onOpenNewPart: () => void;
  onOpenNewShop: () => void;
  onSearchPlate: (plate: string) => void;
  onSelectVehicle: (vehicle: Vehicle & { customer?: Customer }) => void;
}

export default function Header({
  shops,
  activeShopId,
  vehicles,
  onSelectShop,
  onOpenNewOrder,
  onOpenNewPart,
  onOpenNewShop,
  onSearchPlate,
  onSelectVehicle
}: HeaderProps) {
  const [plateQuery, setPlateQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeShop = shops.find((s) => s.id === activeShopId) || shops[0];

  // Arama sorgusuna göre eşleşen araçları filtrele
  const cleanQuery = plateQuery.trim().toUpperCase().replace(/\s+/g, '');
  const matchedVehicles = cleanQuery
    ? vehicles.filter((v) => {
        const p = v.plate.replace(/\s+/g, '').toUpperCase();
        const brandModel = `${v.brand} ${v.model}`.toUpperCase();
        const customer = (v.customer?.fullName || '').toUpperCase();
        return p.includes(cleanQuery) || brandModel.includes(cleanQuery) || customer.includes(cleanQuery);
      })
    : [];

  // Dışarı tıklandığında açılır listeyi kapat
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (plateQuery.trim()) {
      if (matchedVehicles.length > 0) {
        onSelectVehicle(matchedVehicles[0]);
        setIsOpen(false);
        setPlateQuery(matchedVehicles[0].plate);
      } else {
        onSearchPlate(plateQuery.trim());
        setIsOpen(false);
      }
    }
  };

  const handleSelectVehicleItem = (vehicle: Vehicle & { customer?: Customer }) => {
    setPlateQuery(vehicle.plate);
    setIsOpen(false);
    onSelectVehicle(vehicle);
  };

  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-black">
              <Wrench className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">SANAYİ SERVİS</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-blue-50 text-blue-700 border border-blue-200 rounded">SaaS</span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Oto Servis & Parça Stok Yönetimi</p>
            </div>
          </div>

          {/* Hızlı Plaka Arama (Turkish License Plate Box & Canlı Otomatik Tamamlama) */}
          <div ref={containerRef} className="relative flex-1 max-w-md mx-2">
            <form onSubmit={handleSearch} className="relative flex items-center">
              {/* TR Plate Flag Badge */}
              <div className="absolute left-1.5 top-1.5 bottom-1.5 w-7 bg-blue-600 rounded flex flex-col items-center justify-center text-[9px] font-black text-white pointer-events-none select-none">
                <span>TR</span>
              </div>
              <input
                type="text"
                value={plateQuery}
                onFocus={() => setIsOpen(true)}
                onChange={(e) => {
                  setPlateQuery(e.target.value.toUpperCase());
                  setIsOpen(true);
                }}
                placeholder="HIZLI PLAKA SORGULA (Örn: 34 AB 1234)"
                className="w-full pl-11 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold tracking-wider placeholder:text-slate-400 placeholder:font-sans placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-white text-sm transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 text-slate-400 hover:text-blue-600 transition-colors p-1"
                title="Plakayı Ara"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Canlı Açılır Plaka Öneri Listesi (Dropdown Autocomplete) */}
            {isOpen && cleanQuery.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3 py-1.5 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Eşleşen Araçlar ({matchedVehicles.length})</span>
                  <span className="text-[10px] lowercase text-slate-400">seçmek için tıklayın</span>
                </div>

                {matchedVehicles.length > 0 ? (
                  matchedVehicles.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => handleSelectVehicleItem(v)}
                      className="p-3 hover:bg-blue-50/80 cursor-pointer transition-colors flex items-center justify-between gap-3 group text-left"
                    >
                      <div className="flex items-center gap-3">
                        {/* Küçük TR Plaka Rozeti */}
                        <div className="relative inline-flex items-center bg-white text-slate-950 border border-slate-400 rounded px-2 py-0.5 font-mono font-black text-xs shrink-0 shadow-2xs group-hover:border-blue-500">
                          <span className="w-3.5 text-center bg-blue-600 text-white text-[7px] font-bold py-0.2 px-0.5 rounded-2xs mr-1 -ml-1">TR</span>
                          {v.plate}
                        </div>

                        <div>
                          <div className="font-bold text-xs text-slate-900 group-hover:text-blue-700">
                            {v.brand} {v.model} ({v.year})
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>{v.customer?.fullName || 'Müşteri Belirtilmedi'}</span>
                            <span>•</span>
                            <span>{v.customer?.phone || '-'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex items-center gap-1.5 text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                        <span className="font-mono text-slate-600 font-normal text-[11px]">{v.currentKm.toLocaleString()} KM</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500 space-y-2">
                    <p>
                      <strong>"{plateQuery}"</strong> ile eşleşen kayıtlı araç bulunamadı.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        onOpenNewOrder();
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-colors border border-blue-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Bu Plaka İçin Yeni İş Emri Aç
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dükkan / Şube Seçici & Eylemler */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Shop Switcher */}
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-1">
              <Building2 className="w-4 h-4 text-slate-500 ml-2 mr-1 hidden sm:inline" />
              <select
                value={activeShopId}
                onChange={(e) => {
                  if (e.target.value === 'NEW') {
                    onOpenNewShop();
                  } else {
                    onSelectShop(e.target.value);
                  }
                }}
                className="bg-transparent text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none cursor-pointer pr-2 py-1 max-w-[140px] sm:max-w-[200px] truncate"
              >
                {shops.map((shop) => (
                  <option key={shop.id} value={shop.id} className="bg-white text-slate-800">
                    {shop.name}
                  </option>
                ))}
                <option value="NEW" className="bg-white text-blue-600 font-bold">
                  + Yeni Dükkan / Şube Aç
                </option>
              </select>
            </div>

            {/* Quick Action: Yeni Parça Ekle */}
            <button
              onClick={onOpenNewPart}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-all"
              title="Yeni Stok Parçası Ekle"
            >
              <PackagePlus className="w-4 h-4 text-blue-600" />
              <span>Parça Ekle</span>
            </button>

            {/* Quick Action: Yeni İş Emri Aç */}
            <button
              onClick={onOpenNewOrder}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
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
