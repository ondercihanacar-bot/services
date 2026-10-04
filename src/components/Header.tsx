'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Shop, Vehicle, Customer, User } from '@/types/index';
import {
  Plus,
  PackagePlus,
  Building2,
  Search,
  Car,
  User as UserIcon,
  ArrowRight,
  LogOut,
  Settings,
  ShieldCheck,
  ChevronDown,
  Lock
} from 'lucide-react';


interface HeaderProps {
  shops: Shop[];
  activeShopId: string;
  vehicles: (Vehicle & { customer?: Customer })[];
  currentUser: User | null;
  onSelectShop: (shopId: string) => void;
  onOpenNewOrder: () => void;
  onOpenNewPart: () => void;
  onOpenNewShop: () => void;
  onSearchPlate: (plate: string) => void;
  onSelectVehicle: (vehicle: Vehicle & { customer?: Customer }) => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onNavigateToSettings: () => void;
}

export default function Header({
  shops,
  activeShopId,
  vehicles,
  currentUser,
  onSelectShop,
  onOpenNewOrder,
  onOpenNewPart,
  onOpenNewShop,
  onSearchPlate,
  onSelectVehicle,
  onOpenLogin,
  onLogout,
  onNavigateToSettings
}: HeaderProps) {

  const [plateQuery, setPlateQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

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

  // Dışarı tıklandığında açılır listeleri kapat
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
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
    <header className="no-print bg-[#07172c] border-b border-cyan-500/25 sticky top-0 z-30 shadow-[0_4px_24px_rgba(7,21,38,0.4)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo & Branding - Tam Hizalı ve Kusursuz */}
          <div className="flex items-center gap-3.5 select-none shrink-0">
            <div className="relative group cursor-pointer flex items-center">
              {/* Logo arkasında mavi neon ışıltı */}
              <div className="absolute -inset-1 rounded-2xl bg-cyan-400 blur-md opacity-40 group-hover:opacity-80 transition-all duration-300"></div>
              <img
                src="/logo.png"
                alt="Services Logo"
                className="relative h-12 sm:h-13 w-auto object-contain transition-transform duration-200 group-hover:scale-105 drop-shadow-[0_4px_12px_rgba(0,210,255,0.4)]"
              />
            </div>

            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <span className="font-black text-2xl tracking-wider text-white font-sans leading-none">SERVICES</span>
                <span className="px-2 py-0.5 text-[9px] font-black tracking-widest uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                  PRO
                </span>
              </div>
              <span className="text-[12px] sm:text-[13px] font-bold text-cyan-400 tracking-wide mt-1.5 leading-none">
                Servis Takip Otomasyonu
              </span>
            </div>
          </div>

          {/* Hızlı Plaka Arama (Kompakt Boyut) */}
          <div ref={containerRef} className="relative w-52 sm:w-60 md:w-64 mx-2 shrink-0">
            <form onSubmit={handleSearch} className="relative flex items-center">
              {/* TR Plate Flag Badge */}
              <div className="absolute left-1.5 top-1 bottom-1 w-6 bg-gradient-to-b from-[#1c4e7c] to-[#0c243f] border border-cyan-400/50 rounded-md flex flex-col items-center justify-center text-[8px] font-black text-cyan-300 pointer-events-none select-none shadow-2xs">
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
                placeholder="Plaka Ara (34 AB 1234)"
                className="w-full pl-9 pr-7 py-1.5 bg-[#0b2440]/90 border border-cyan-500/35 rounded-xl text-white font-mono font-bold tracking-wider placeholder:text-slate-400 placeholder:font-sans placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 focus:bg-[#0c2847] text-xs sm:text-sm transition-all shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-2 text-slate-400 hover:text-cyan-300 transition-colors p-1 cursor-pointer"
                title="Plakayı Ara"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Canlı Açılır Plaka Öneri Listesi (Tek Satır ve Sağa-Sola Genişleyen) */}
            {isOpen && cleanQuery.length > 0 && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-[520px] sm:w-[620px] max-w-[92vw] mt-2 bg-white border border-slate-200/90 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-150 ring-1 ring-cyan-500/20">
                <div className="px-4 py-2 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between border-b border-slate-100">
                  <span>Eşleşen Araçlar ({matchedVehicles.length})</span>
                  <span className="text-[10px] lowercase text-cyan-600 font-semibold">seçmek için tıklayın</span>
                </div>

                {matchedVehicles.length > 0 ? (
                  matchedVehicles.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => handleSelectVehicleItem(v)}
                      className="px-4 py-3 hover:bg-cyan-50/70 cursor-pointer transition-colors flex items-center justify-between gap-4 group text-left whitespace-nowrap text-slate-900"
                    >
                      {/* Sol Taraf: TR Plaka + Araç Marka/Model (Tek Satır) */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative inline-flex items-center bg-white text-slate-950 border border-slate-300 rounded-lg px-2.5 py-0.5 font-mono font-black text-xs shrink-0 shadow-2xs group-hover:border-cyan-500">
                          <span className="w-3.5 text-center bg-[#0c243f] text-cyan-300 text-[7px] font-bold py-0.2 px-0.5 rounded-2xs mr-1.5 -ml-1">TR</span>
                          {v.plate}
                        </div>

                        <div className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-cyan-700 truncate">
                          {v.brand} {v.model} <span className="text-slate-500 font-normal">({v.year})</span>
                        </div>
                      </div>

                      {/* Sağ Taraf: Müşteri + KM + İlerleme Oku (Tek Satır) */}
                      <div className="flex items-center gap-3 sm:gap-4 shrink-0 text-xs">
                        <div className="hidden sm:flex items-center gap-1.5 text-slate-500">
                          <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium text-slate-700">{v.customer?.fullName || 'Müşteri Belirtilmedi'}</span>
                          {v.customer?.phone && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="font-mono text-slate-500">{v.customer.phone}</span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 font-bold text-cyan-700 font-mono">
                          <span>{v.currentKm.toLocaleString()} KM</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-cyan-600" />
                        </div>
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
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-bold rounded-xl transition-colors border border-cyan-200 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Bu Plaka İçin Yeni İş Emri Aç
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Şube Seçici & Mavi Neon Işıklı Butonlar */}
          <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
            
            {/* Şube Seçici */}
            <div className="flex items-center bg-[#0b2440] border border-cyan-500/35 rounded-xl p-1 shadow-inner">
              <Building2 className="w-4 h-4 text-cyan-400 ml-2 mr-1 hidden sm:inline" />
              <select
                value={activeShopId}
                onChange={(e) => {
                  if (e.target.value === 'NEW') {
                    onOpenNewShop();
                  } else {
                    onSelectShop(e.target.value);
                  }
                }}
                className="bg-transparent text-xs sm:text-sm font-bold text-white focus:outline-none cursor-pointer pr-2 py-1 max-w-[140px] sm:max-w-[190px] truncate"
              >
                {shops.map((shop) => (
                  <option key={shop.id} value={shop.id} className="bg-[#0b2440] text-white font-medium">
                    {shop.name}
                  </option>
                ))}
                <option value="NEW" className="bg-[#0b2440] text-cyan-300 font-bold">
                  + Yeni Servis Şubesi Aç
                </option>
              </select>
            </div>

            {/* Hızlı Parça Ekle (Mavi Neon Efektli) */}
            <button
              onClick={onOpenNewPart}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold bg-[#0b2440] hover:bg-[#0f2e54] text-cyan-300 border border-cyan-500/35 rounded-xl transition-all shadow-[0_0_12px_rgba(6,182,212,0.15)] cursor-pointer"
              title="Yeni Stok Parçası Ekle"
            >
              <PackagePlus className="w-4 h-4 text-cyan-400" />
              <span>Parça Ekle</span>
            </button>

            {/* Yeni İş Emri Aç (Mavi Neon Işıklı) */}
            <button
              onClick={onOpenNewOrder}
              className="neon-btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold cursor-pointer"
            >
              <Car className="w-4 h-4 text-cyan-300 stroke-[2.5]" />
              <span className="hidden sm:inline">İş Emri Aç</span>
              <span className="sm:hidden">Kabul</span>
            </button>

            {/* Kullanıcı Profili & Giriş / Çıkış Menüsü */}
            <div ref={userMenuRef} className="relative">
              {currentUser ? (
                <div>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1 sm:px-3 sm:py-1.5 bg-[#0b2440] hover:bg-[#0f2e54] border border-cyan-500/35 rounded-xl transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-black text-xs shrink-0 shadow-2xs">
                      {currentUser.fullName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="hidden lg:flex flex-col text-left">
                      <span className="text-xs font-bold text-white max-w-[120px] truncate leading-tight">
                        {currentUser.fullName}
                      </span>
                      <span className="text-[10px] text-cyan-300 font-semibold leading-tight">
                        {currentUser.role === 'ADMIN' ? '👑 Yönetici' : '🔧 Personel'}
                      </span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-cyan-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-[#07172c] border border-cyan-500/30 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 divide-y divide-cyan-500/20">
                      <div className="p-3">
                        <div className="text-xs font-black text-white">{currentUser.fullName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">@{currentUser.username}</div>
                        <div className="mt-2 flex items-center gap-2">
                          {currentUser.role === 'ADMIN' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                              👑 Yönetici
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-400/40">
                              🔧 Personel
                            </span>
                          )}

                          {currentUser.twoFactorEnabled ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                              <ShieldCheck className="w-3 h-3" />
                              <span>2FA Aktif</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400">
                              2FA Pasif
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-1 space-y-1">
                        {currentUser.role === 'ADMIN' && (
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              onNavigateToSettings();
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-200 hover:text-cyan-300 hover:bg-[#0c2847] rounded-xl transition-colors cursor-pointer"
                          >
                            <Settings className="w-4 h-4 text-cyan-400" />
                            <span>Yönetici Ayarları</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onLogout();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-300 hover:text-rose-200 hover:bg-rose-500/15 rounded-xl transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Oturumu Kapat</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onOpenLogin}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Giriş Yap</span>
                </button>
              )}
            </div>

          </div>


        </div>
      </div>
    </header>
  );
}
