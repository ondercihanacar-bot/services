'use client';

import React, { useState } from 'react';
import { EnrichedServiceOrder } from '@/lib/db';
import { Shop } from '@/types/index';
import { formatDate, FUEL_LEVEL_LABELS } from '@/lib/utils';
import { Camera, X, Gauge, AlertCircle, ShieldAlert, Fuel, CheckCircle2, Printer } from 'lucide-react';

interface VehicleIntakeModalProps {
  order: EnrichedServiceOrder;
  shop: Shop;
  onClose: () => void;
}

export default function VehicleIntakeModal({
  order,
  shop,
  onClose
}: VehicleIntakeModalProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const fuelLevel = order.fuelLevel || 'HALF';
  const fuelText = FUEL_LEVEL_LABELS[fuelLevel] || 'Yarım Depo';

  // Yakıt seviyesi yüzdesi
  const fuelPercent = {
    EMPTY: 10,
    QUARTER: 25,
    HALF: 50,
    THREE_QUARTERS: 75,
    FULL: 100
  }[fuelLevel] || 50;

  // Örnek görseller (eğer intakePhotos boşsa bile gerçekçi araç kabul şablonu sunar)
  const photos = order.intakePhotos && order.intakePhotos.length > 0
    ? order.intakePhotos
    : [
        'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80'
      ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[94vh] overflow-y-auto text-slate-900 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Başlık Çubuğu */}
        <div className="no-print p-4 sm:p-5 bg-[#07172c] text-white rounded-t-2xl flex items-center justify-between border-b border-cyan-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 text-cyan-300 rounded-xl border border-cyan-400/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide flex items-center gap-2">
                <span>Fotoğraflı Araç Kabul & Hasar Kaydı</span>
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 rounded-full">
                  Ekspertiz
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Araç servise girdiği andaki kaporta, çizik, yakıt ve kilometre tespit tutanağı
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Yazdır</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Yazdırılabilir İçerik Alanı */}
        <div className="p-6 space-y-6">
          
          {/* Araç & Kabul Bilgileri */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Plaka:</span>
              <span className="font-mono font-black text-slate-900 text-base">
                {order.vehicle?.plate || '-'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Marka / Model:</span>
              <span className="font-bold text-slate-900">
                {order.vehicle?.brand} {order.vehicle?.model}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Giriş Kilometresi:</span>
              <span className="font-mono font-bold text-cyan-700 text-sm">
                {order.kmAtEntry.toLocaleString()} KM
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Kabul Tarihi:</span>
              <span className="font-semibold text-slate-800">
                {formatDate(order.entryDate)}
              </span>
            </div>
          </div>

          {/* Yakıt Depo Seviyesi & Göstergesi */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Fuel className="w-4 h-4 text-amber-500" />
                Giriş Anındaki Yakıt Depo Durumu
              </span>
              <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {fuelText}
              </span>
            </div>
            
            {/* Görsel Yakıt Çubuğu */}
            <div className="w-full bg-slate-100 rounded-full h-3.5 p-0.5 border border-slate-200 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  fuelPercent <= 25
                    ? 'bg-rose-500'
                    : fuelPercent <= 50
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${fuelPercent}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-400 font-mono">
              <span>E (Boş)</span>
              <span>1/4</span>
              <span>1/2</span>
              <span>3/4</span>
              <span>F (Dolu)</span>
            </div>
          </div>

          {/* Kaporta, Çizik & Mevcut Hasar Notları */}
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Giriş Hasar / Kaporta Çizik Tespiti (Servis Öncesi Mevcut Durum):</span>
            </div>
            <p className="text-xs text-slate-800 leading-relaxed font-medium bg-white p-3 rounded-lg border border-amber-100 shadow-2xs">
              {order.damageNotes || 'Araç girişinde kaportada belirgin çizik veya hasar tespit edilmemiştir.'}
            </p>
            <p className="text-[11px] text-amber-700 italic">
              * Bu tutanak müşteri kabulü sırasında aracın mevcut fiziksel durumunu belgelemek için kayıt altına alınmıştır.
            </p>
          </div>

          {/* Çekilen Kabul Fotoğrafları */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-cyan-600" />
                <span>Araç Kabul Fotoğrafları ({photos.length})</span>
              </h3>
              <span className="text-[11px] text-slate-500">Büyütmek için fotoğrafa tıklayın</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photos.map((src, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedPhoto(src)}
                  className="relative group aspect-4/3 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer shadow-2xs hover:shadow-md hover:border-cyan-400 transition-all"
                >
                  <img
                    src={src}
                    alt={`Araç Hasar Fotoğrafı ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-slate-900 text-[10px] font-bold px-2 py-1 rounded-md shadow-sm transition-opacity">
                      Büyüt
                    </span>
                  </div>
                  <div className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[9px] font-mono px-1.5 py-0.5 rounded backdrop-blur-xs">
                    Foto {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* İmzalar */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <span className="font-bold text-slate-700 block mb-8">Araç Kabul Sorumlusu (Usta)</span>
              <div className="border-t border-dashed border-slate-300 pt-1 text-[11px] text-slate-500">
                {order.assignedTechnician || 'Servis Danışmanı'} / İmza
              </div>
            </div>
            <div>
              <span className="font-bold text-slate-700 block mb-8">Araç Sahibi / Teslim Eden</span>
              <div className="border-t border-dashed border-slate-300 pt-1 text-[11px] text-slate-500">
                {order.customer?.fullName} / İmza
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Fotoğraf Büyütme Modalı */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={selectedPhoto}
              alt="Büyütülmüş Fotoğraf"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-3 -right-3 bg-white text-slate-900 p-2 rounded-full shadow-lg font-bold hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
