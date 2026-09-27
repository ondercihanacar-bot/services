'use client';

import React, { useState } from 'react';
import { Vehicle, Customer } from '@/types';
import { EnrichedServiceOrder } from '@/lib/db';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Car,
  User,
  Phone,
  Search,
  Plus,
  History,
  Fuel,
  Gauge,
  Calendar,
  Wrench
} from 'lucide-react';

interface VehiclesViewProps {
  vehicles: (Vehicle & { customer?: Customer })[];
  orders: EnrichedServiceOrder[];
  onOpenNewVehicle: () => void;
  onOpenNewOrderForVehicle: (vehicle: Vehicle) => void;
}

export default function VehiclesView({
  vehicles,
  orders,
  onOpenNewVehicle,
  onOpenNewOrderForVehicle
}: VehiclesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<(Vehicle & { customer?: Customer }) | null>(null);

  const filteredVehicles = vehicles.filter((v) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().replace(/\s+/g, '');
    const plate = v.plate.toLowerCase().replace(/\s+/g, '');
    const brandModel = `${v.brand} ${v.model}`.toLowerCase();
    const customer = v.customer?.fullName.toLowerCase() || '';
    const phone = v.customer?.phone || '';
    return plate.includes(q) || brandModel.includes(q) || customer.includes(q) || phone.includes(q);
  });

  const vehicleHistory = selectedVehicle
    ? orders.filter((o) => o.vehicleId === selectedVehicle.id)
    : [];

  return (
    <div className="space-y-6">
      
      {/* Üst Başlık & Eylemler */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Car className="w-6 h-6 text-amber-400" />
            Araçlar & Müşteri Rehberi
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Dükkana kayıtlı araçlar, müşteri iletişimleri ve araçların servis geçmişi.
          </p>
        </div>

        <button
          onClick={onOpenNewVehicle}
          className="self-start sm:self-auto px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold rounded-lg shadow-md shadow-amber-500/20 text-sm flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Yeni Araç & Müşteri Kaydet
        </button>
      </div>

      {/* Arama */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Plaka, Araç Marka/Model, Müşteri Adı veya Telefon ile ara..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* İki Bölüm: Sol Liste, Sağ Detay */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Araç Kartları Listesi */}
        <div className="lg:col-span-2 space-y-3">
          {filteredVehicles.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
              Kayıtlı araç bulunamadı.
            </div>
          ) : (
            filteredVehicles.map((vehicle) => {
              const orderCount = orders.filter((o) => o.vehicleId === vehicle.id).length;
              const isSelected = selectedVehicle?.id === vehicle.id;

              return (
                <div
                  key={vehicle.id}
                  onClick={() => setSelectedVehicle(vehicle)}
                  className={`bg-slate-900 border rounded-xl p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-amber-500 shadow-md shadow-amber-500/10 bg-slate-800/80'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    {/* Sol: Plaka & Model */}
                    <div className="flex items-center gap-3">
                      <div className="relative inline-flex items-center bg-white text-slate-950 border-2 border-slate-400 rounded px-2.5 py-1 font-mono font-black text-sm tracking-wider shadow-sm shrink-0">
                        <span className="w-4 text-center bg-blue-700 text-white text-[8px] font-bold py-0.5 px-0.5 rounded-sm mr-1.5 -ml-1">TR</span>
                        {vehicle.plate}
                      </div>

                      <div>
                        <h3 className="font-bold text-white text-sm">
                          {vehicle.brand} {vehicle.model}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Gauge className="w-3.5 h-3.5 text-slate-500" />
                            {vehicle.currentKm.toLocaleString()} KM
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            {vehicle.year}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Fuel className="w-3.5 h-3.5 text-slate-500" />
                            {vehicle.fuelType}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Sağ: Müşteri & İşlem Butonu */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                      <div className="text-left sm:text-right">
                        <div className="flex items-center gap-1 text-xs font-semibold text-slate-300">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          {vehicle.customer?.fullName || 'Müşteri Belirtilmedi'}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center sm:justify-end gap-1 mt-0.5">
                          <Phone className="w-3 h-3" />
                          {vehicle.customer?.phone || '-'}
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenNewOrderForVehicle(vehicle);
                        }}
                        className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-lg border border-amber-500/40 transition-colors"
                      >
                        + İş Emri Aç
                      </button>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sağ Panel: Seçilen Aracın Detayları & Geçmiş Servis Kayıtları */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 self-start sticky top-20 shadow-sm">
          {selectedVehicle ? (
            <div className="space-y-4">
              
              {/* Seçilen Araç Başlığı */}
              <div className="border-b border-slate-800 pb-3">
                <div className="flex items-center justify-between">
                  <div className="relative inline-flex items-center bg-white text-slate-950 border-2 border-slate-400 rounded px-2 py-0.5 font-mono font-black text-xs tracking-wider shadow-sm">
                    <span className="w-4 text-center bg-blue-700 text-white text-[8px] font-bold py-0.5 px-0.5 rounded-sm mr-1 -ml-1">TR</span>
                    {selectedVehicle.plate}
                  </div>
                  <button
                    onClick={() => onOpenNewOrderForVehicle(selectedVehicle)}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300"
                  >
                    + Yeni Bakım Aç
                  </button>
                </div>
                <h3 className="text-base font-bold text-white mt-2">
                  {selectedVehicle.brand} {selectedVehicle.model} ({selectedVehicle.year})
                </h3>
              </div>

              {/* Teknik Detaylar */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                <div>
                  <span className="text-slate-500 block">Güncel KM:</span>
                  <span className="text-slate-200 font-bold">{selectedVehicle.currentKm.toLocaleString()} KM</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Şanzıman:</span>
                  <span className="text-slate-200">{selectedVehicle.transmission}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Yakıt Türü:</span>
                  <span className="text-slate-200">{selectedVehicle.fuelType}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Şasi No (VIN):</span>
                  <span className="text-slate-200 font-mono text-[11px] truncate block" title={selectedVehicle.chassisNo}>
                    {selectedVehicle.chassisNo || '-'}
                  </span>
                </div>
              </div>

              {/* Müşteri Bilgileri */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-xs">
                <span className="text-slate-500 block mb-1 font-semibold uppercase text-[10px]">Araç Sahibi:</span>
                <p className="text-slate-200 font-bold">{selectedVehicle.customer?.fullName}</p>
                <p className="text-slate-400 mt-0.5 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-500" />
                  {selectedVehicle.customer?.phone}
                </p>
                {selectedVehicle.customer?.address && (
                  <p className="text-slate-500 text-[11px] mt-1">{selectedVehicle.customer.address}</p>
                )}
              </div>

              {/* Geçmiş Servis Kayıtları */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-amber-400" />
                  Servis Geçmişi ({vehicleHistory.length})
                </h4>

                {vehicleHistory.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">Bu araca ait geçmiş servis kaydı yok.</p>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {vehicleHistory.map((hist) => (
                      <div key={hist.id} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-amber-400">{hist.orderNo}</span>
                          <span className="text-slate-500 text-[10px]">{formatDate(hist.entryDate)}</span>
                        </div>
                        <p className="text-slate-300 font-medium mt-1 line-clamp-1">{hist.customerComplaint}</p>
                        <div className="flex items-center justify-between text-slate-400 mt-1.5 text-[11px]">
                          <span>{hist.items.length} Kalem İşlem</span>
                          <span className="font-bold text-white">{formatCurrency(hist.grandTotal)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="text-center py-16 text-slate-500 text-sm">
              <Car className="w-10 h-10 mx-auto mb-2 opacity-30" />
              Detaylarını ve servis geçmişini görmek için sol taraftan bir araca tıklayın.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
