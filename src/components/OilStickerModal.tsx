'use client';

import React from 'react';
import { Shop } from '@/types/index';
import { EnrichedServiceOrder } from '@/lib/db';
import { formatDateOnly } from '@/lib/utils';
import { Printer, X, Droplet, Calendar, Gauge, Car, ShieldCheck } from 'lucide-react';

interface OilStickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: EnrichedServiceOrder | null;
  shop: Shop;
}

export default function OilStickerModal({
  isOpen,
  onClose,
  order,
  shop
}: OilStickerModalProps) {
  if (!isOpen || !order) return null;

  // Yağ parçası tespit et
  const oilPart = order.items.find(
    (i) => i.name.toLowerCase().includes('yağ') || i.name.toLowerCase().includes('oil') || i.name.toLowerCase().includes('5w')
  );

  const oilName = oilPart ? oilPart.name : 'Castrol Edge 5W-30 LL';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Üst Başlık (Baskıda Gizlenir) */}
        <div className="no-print bg-[#0c243f] text-white px-5 py-3.5 flex items-center justify-between border-b border-cyan-500/20">
          <div className="flex items-center gap-2.5">
            <Droplet className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Kapı Direği Yağ Değişim Kartı</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="neon-btn-primary px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-300" />
              <span>Yazdır</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Yazdırılabilir Kart (Kompakt Kapı Etiketi Standardında: 8cm x 10cm) */}
        <div className="p-6 bg-slate-100 flex items-center justify-center">
          <div className="w-[300px] bg-white border-2 border-slate-900 rounded-xl p-4 shadow-md text-slate-900 font-sans print:border-black print:shadow-none">
            
            {/* Kart Başlığı */}
            <div className="text-center border-b-2 border-slate-900 pb-2">
              <h2 className="font-black text-sm uppercase tracking-wider text-[#0c243f]">{shop.name}</h2>
              <p className="text-[10px] text-slate-600 font-bold">PERİYODİK BAKIM & YAĞ DEĞİŞİM KARTI</p>
              <p className="text-[10px] font-mono font-bold text-cyan-800">Tel: {shop.phone}</p>
            </div>

            {/* Plaka */}
            <div className="text-center my-2.5">
              <span className="inline-block px-3 py-1 bg-slate-950 text-white font-mono font-black text-sm rounded tracking-widest">
                {order.vehicle?.plate || 'PLAKA'}
              </span>
            </div>

            {/* Bilgi Izgarası */}
            <div className="space-y-2 text-xs divide-y divide-slate-200">
              
              <div className="pt-1 flex items-center justify-between">
                <span className="text-slate-500 font-bold text-[11px]">Son Değişim Tarihi:</span>
                <span className="font-mono font-bold">{formatDateOnly(order.entryDate)}</span>
              </div>

              <div className="pt-1 flex items-center justify-between">
                <span className="text-slate-500 font-bold text-[11px]">Son Değişim KM:</span>
                <span className="font-mono font-black text-cyan-900">{order.kmAtEntry.toLocaleString()} KM</span>
              </div>

              <div className="pt-1 flex items-center justify-between bg-cyan-50/70 p-1 rounded">
                <span className="text-cyan-900 font-black text-[11px]">Gelecek Bakım KM:</span>
                <span className="font-mono font-black text-cyan-700 text-sm">
                  {order.nextMaintenanceKm ? `${order.nextMaintenanceKm.toLocaleString()} KM` : `${(order.kmAtEntry + 10000).toLocaleString()} KM`}
                </span>
              </div>

              <div className="pt-1 flex items-center justify-between">
                <span className="text-slate-500 font-bold text-[11px]">Gelecek Bakım Tarihi:</span>
                <span className="font-mono font-bold text-slate-800">
                  {order.nextMaintenanceDate ? formatDateOnly(order.nextMaintenanceDate) : '1 Yıl Sonra'}
                </span>
              </div>

              <div className="pt-1">
                <span className="text-slate-500 block text-[10px] font-bold">Kullanılan Motor Yağı:</span>
                <span className="font-bold text-[11px] text-slate-900 line-clamp-1">{oilName}</span>
              </div>

            </div>

            {/* Değişen Filtreler Checkbox'ları */}
            <div className="mt-3 pt-2 border-t border-slate-200 grid grid-cols-2 gap-1 text-[10px] font-bold">
              <span className="flex items-center gap-1">☑ Yağ Filtresi</span>
              <span className="flex items-center gap-1">☑ Hava Filtresi</span>
              <span className="flex items-center gap-1">☑ Polen Filtresi</span>
              <span className="flex items-center gap-1">☐ Yakıt / Mazot</span>
            </div>

            {/* Alt Uyarı */}
            <div className="mt-3 pt-1.5 border-t border-slate-900 text-center text-[9px] text-slate-500 leading-tight">
              Lütfen periyodik bakım aralıklarına uyunuz. Bir sonraki bakımda görüşmek üzere!
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
