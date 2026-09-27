'use client';

import React, { useState } from 'react';
import { Vehicle, Customer } from '@/types/index';
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
  Wrench,
  FileCheck2
} from 'lucide-react';

interface VehiclesViewProps {
  vehicles: (Vehicle & { customer?: Customer })[];
  orders: EnrichedServiceOrder[];
  selectedVehicleId?: string | null;
  onOpenNewVehicle: () => void;
  onOpenNewOrderForVehicle: (vehicle: Vehicle) => void;
  onOpenHistoryModal: (vehicle: Vehicle & { customer?: Customer }) => void;
  onSelectVehicle?: (vehicle: Vehicle & { customer?: Customer }) => void;
}

export default function VehiclesView({
  vehicles,
  orders,
  selectedVehicleId,
  onOpenNewVehicle,
  onOpenNewOrderForVehicle,
  onOpenHistoryModal,
  onSelectVehicle
}: VehiclesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [internalSelected, setInternalSelected] = useState<(Vehicle & { customer?: Customer }) | null>(null);

  React.useEffect(() => {
    if (selectedVehicleId) {
      const found = vehicles.find((v) => v.id === selectedVehicleId);
      if (found) setInternalSelected(found);
    }
  }, [selectedVehicleId, vehicles]);

  const selectedVehicle = internalSelected || (selectedVehicleId ? vehicles.find(v => v.id === selectedVehicleId) : null);


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
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Car className="w-6 h-6 text-cyan-600" />
            Araçlar & Müşteri Rehberi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Servise kayıtlı araçlar, müşteri iletişimleri ve araçların servis geçmişi.
          </p>
        </div>

        <button
          onClick={onOpenNewVehicle}
          className="neon-btn-primary self-start sm:self-auto px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-cyan-300 stroke-[3]" />
          Yeni Araç & Müşteri Kaydet
        </button>
      </div>

      {/* Arama */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Plaka, Araç Marka/Model, Müşteri Adı veya Telefon ile ara..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* İki Bölüm: Sol Liste, Sağ Detay */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Araç Kartları Listesi */}
        <div className="lg:col-span-2 space-y-3">
          {filteredVehicles.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 shadow-sm">
              Kayıtlı araç bulunamadı.
            </div>
          ) : (
            filteredVehicles.map((vehicle) => {
              const orderCount = orders.filter((o) => o.vehicleId === vehicle.id).length;
              const isSelected = selectedVehicle?.id === vehicle.id;

              return (
                <div
                  key={vehicle.id}
                  onClick={() => {
                    setInternalSelected(vehicle);
                    if (onSelectVehicle) onSelectVehicle(vehicle);
                  }}
                  className={`bg-white border rounded-xl p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-cyan-600 shadow-md ring-1 ring-cyan-500/50 bg-cyan-50/30'
                      : 'border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    {/* Sol: Plaka & Model */}
                    <div className="flex items-center gap-3">
                      <div className="relative inline-flex items-center bg-white text-slate-950 border border-slate-300 rounded-lg px-2.5 py-1 font-mono font-black text-sm tracking-wider shadow-2xs shrink-0">
                        <span className="w-4 text-center bg-[#0c243f] text-cyan-300 text-[8px] font-bold py-0.5 px-0.5 rounded-2xs mr-1.5 -ml-1">TR</span>
                        {vehicle.plate}
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">
                          {vehicle.brand} {vehicle.model}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1 font-medium">
                            <Gauge className="w-3.5 h-3.5 text-slate-400" />
                            {vehicle.currentKm.toLocaleString()} KM
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {vehicle.year}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Fuel className="w-3.5 h-3.5 text-slate-400" />
                            {vehicle.fuelType}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Sağ: Müşteri & İşlem Butonu */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {vehicle.customer?.fullName || 'Müşteri Belirtilmedi'}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center sm:justify-end gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {vehicle.customer?.phone || '-'}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenHistoryModal(vehicle);
                          }}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                          title="Aracın Bakım Karnesi ve Servis Geçmişini Dök"
                        >
                          Karnesi
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenNewOrderForVehicle(vehicle);
                          }}
                          className="px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-bold text-xs rounded-lg border border-cyan-200 transition-colors cursor-pointer"
                        >
                          + İş Emri Aç
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sağ Panel: Seçilen Aracın Detayları & Geçmiş Servis Kayıtları */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 self-start sticky top-20 shadow-sm">
          {selectedVehicle ? (
            <div className="space-y-4">
              
              {/* Seçilen Araç Başlığı */}
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between">
                  <div className="relative inline-flex items-center bg-white text-slate-950 border border-slate-300 rounded-lg px-2 py-0.5 font-mono font-black text-xs tracking-wider shadow-2xs">
                    <span className="w-3.5 text-center bg-[#0c243f] text-cyan-300 text-[7px] font-bold py-0.2 px-0.5 rounded-2xs mr-1.5 -ml-1">TR</span>
                    {selectedVehicle.plate}
                  </div>
                  <button
                    onClick={() => onOpenNewOrderForVehicle(selectedVehicle)}
                    className="text-xs font-bold text-cyan-700 hover:text-cyan-800 cursor-pointer"
                  >
                    + Yeni Bakım Aç
                  </button>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-2">
                  {selectedVehicle.brand} {selectedVehicle.model} ({selectedVehicle.year})
                </h3>

                {/* Dijital Bakım Karnesi Butonu */}
                <button
                  onClick={() => onOpenHistoryModal(selectedVehicle)}
                  className="w-full mt-2.5 py-2 px-3 neon-btn-primary rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <FileCheck2 className="w-4 h-4 text-cyan-300" />
                  <span>Dijital Bakım Karnesi (PDF İndir)</span>
                </button>
              </div>

              {/* Teknik Detaylar */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Güncel KM:</span>
                  <span className="text-slate-900 font-bold">{selectedVehicle.currentKm.toLocaleString()} KM</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Şanzıman:</span>
                  <span className="text-slate-800">{selectedVehicle.transmission}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Yakıt Türü:</span>
                  <span className="text-slate-800">{selectedVehicle.fuelType}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Şasi No (VIN):</span>
                  <span className="text-slate-700 font-mono text-[11px] truncate block" title={selectedVehicle.chassisNo}>
                    {selectedVehicle.chassisNo || '-'}
                  </span>
                </div>
              </div>

              {/* Müşteri Bilgileri */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                <span className="text-slate-400 block mb-1 font-semibold uppercase text-[10px]">Araç Sahibi:</span>
                <p className="text-slate-900 font-bold">{selectedVehicle.customer?.fullName}</p>
                <p className="text-slate-600 mt-0.5 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {selectedVehicle.customer?.phone}
                </p>
                {selectedVehicle.customer?.address && (
                  <p className="text-slate-500 text-[11px] mt-1">{selectedVehicle.customer.address}</p>
                )}
              </div>

              {/* Geçmiş Servis Kayıtları */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-blue-600" />
                  Servis Geçmişi ({vehicleHistory.length})
                </h4>

                {vehicleHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">Bu araca ait geçmiş servis kaydı yok.</p>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {vehicleHistory.map((hist) => (
                      <div key={hist.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-blue-700">{hist.orderNo}</span>
                          <span className="text-slate-400 text-[10px]">{formatDate(hist.entryDate)}</span>
                        </div>
                        <p className="text-slate-800 font-medium mt-1 line-clamp-1">{hist.customerComplaint}</p>
                        <div className="flex items-center justify-between text-slate-500 mt-1.5 text-[11px]">
                          <span>{hist.items.length} Kalem İşlem</span>
                          <span className="font-bold text-slate-900 font-mono">{formatCurrency(hist.grandTotal)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 text-sm">
              <Car className="w-10 h-10 mx-auto mb-2 opacity-30" />
              Detaylarını ve servis geçmişini görmek için sol taraftan bir araca tıklayın.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
