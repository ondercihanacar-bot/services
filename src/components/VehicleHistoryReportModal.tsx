'use client';

import React from 'react';
import { Vehicle, Customer, Shop } from '@/types/index';
import { EnrichedServiceOrder } from '@/lib/db';
import { formatCurrency, formatDateOnly, SERVICE_TYPE_LABELS } from '@/lib/utils';
import {
  Printer,
  X,
  Car,
  Calendar,
  Gauge,
  Wrench,
  ShieldCheck,
  User,
  Phone,
  MapPin,
  Package,
  QrCode,
  Building2,
  FileCheck2
} from 'lucide-react';

interface VehicleHistoryReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: (Vehicle & { customer?: Customer }) | null;
  orders: EnrichedServiceOrder[];
  shop: Shop;
}

export default function VehicleHistoryReportModal({
  isOpen,
  onClose,
  vehicle,
  orders,
  shop
}: VehicleHistoryReportModalProps) {
  if (!isOpen || !vehicle) return null;

  // Aracın servis kayıtlarını kronolojik olarak en yeniden en eskiye sırala
  const vehicleOrders = orders
    .filter((o) => o.vehicleId === vehicle.id)
    .sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());

  // Toplam değişen parça sayısı ve toplam harcama
  const totalPartsReplaced = vehicleOrders.reduce((acc, order) => {
    return acc + order.items.filter((i) => i.type === 'PART').reduce((sum, item) => sum + item.quantity, 0);
  }, 0);

  const totalSpent = vehicleOrders.reduce((sum, o) => sum + o.grandTotal, 0);

  const handlePrint = () => {
    window.print();
  };

  const latestOrder = vehicleOrders[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      {/* Modal Kutusu */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Üst Eylem Çubuğu (Baskıda Gizlenir) */}
        <div className="no-print bg-[#0c243f] text-white px-6 py-4 flex items-center justify-between border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Dijital Araç Servis & Bakım Karnesi
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                  Resmi Geçmiş Dökümü
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                [{vehicle.plate}] {vehicle.brand} {vehicle.model} - Tüm servis, KM ve değişen parça tarihçesi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="neon-btn-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg"
              title="Yazdır veya PDF olarak kaydet"
            >
              <Printer className="w-4 h-4 text-cyan-300" />
              <span>PDF İndir / Yazdır</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              title="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Yazdırılabilir & Kaydırılabilir Belge İçeriği */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-slate-800 text-xs sm:text-sm bg-white print:p-0 print:overflow-visible">
          
          {/* 1. Belge Başlığı & Servis Bilgisi */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b-2 border-slate-200">
            <div className="flex items-center gap-3.5">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-12 w-auto object-contain"
              />
              <div>
                <h1 className="text-xl font-black text-[#0c243f] tracking-tight">{shop.name}</h1>
                <p className="text-xs text-slate-500 font-medium">
                  {shop.address} • {shop.district} / {shop.city}
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  Tel: <span className="font-bold text-slate-700">{shop.phone}</span> • E-posta: {shop.email}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block px-3 py-1 bg-cyan-50 text-cyan-800 border border-cyan-200 rounded-lg text-xs font-black uppercase tracking-wider mb-1">
                ARAÇ SERVİS & BAKIM KARNESİ
              </span>
              <p className="text-xs text-slate-500">
                Rapor Tarihi: <span className="font-bold text-slate-800">{formatDateOnly(new Date().toISOString())}</span>
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                Belge No: BK-{new Date().getFullYear()}-{vehicle.plate.replace(/\s+/g, '')}
              </p>
            </div>
          </div>

          {/* 2. Araç & Müşteri Künyesi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
            
            {/* Araç Bilgileri */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0c243f] uppercase tracking-wider border-b border-slate-200/80 pb-1.5">
                <Car className="w-4 h-4 text-cyan-600" />
                <span>Araç Kimlik Bilgileri</span>
              </div>
              
              <div className="flex items-center gap-3 pt-1">
                {/* TR Plaka */}
                <div className="relative inline-flex items-center bg-white text-slate-950 border border-slate-300 rounded-lg px-2.5 py-1 font-mono font-black text-sm tracking-wider shadow-2xs shrink-0">
                  <span className="w-4 text-center bg-[#0c243f] text-cyan-300 text-[8px] font-bold py-0.5 px-0.5 rounded-2xs mr-1.5 -ml-1">TR</span>
                  {vehicle.plate}
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 leading-tight">
                    {vehicle.brand} {vehicle.model}
                  </h3>
                  <p className="text-xs text-slate-500">Model Yılı: {vehicle.year} • Renk: {vehicle.color || 'Belirtilmedi'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Şasi No (VIN):</span>
                  <span className="font-mono font-bold text-slate-800">{vehicle.chassisNo || 'Kayıtlı Değil'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Motor No:</span>
                  <span className="font-mono font-bold text-slate-800">{vehicle.engineNo || 'Kayıtlı Değil'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Yakıt / Şanzıman:</span>
                  <span className="font-semibold text-slate-800">{vehicle.fuelType} / {vehicle.transmission}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">TÜVTÜRK Muayene:</span>
                  <span className="font-semibold text-slate-800">
                    {vehicle.inspectionDate ? formatDateOnly(vehicle.inspectionDate) : 'Tarih Girilmedi'}
                  </span>
                </div>
              </div>
            </div>

            {/* Müşteri / Ruhsat Sahibi */}
            <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-200 md:pl-4 pt-2 md:pt-0">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0c243f] uppercase tracking-wider border-b border-slate-200/80 pb-1.5">
                <User className="w-4 h-4 text-cyan-600" />
                <span>Ruhsat / Müşteri Bilgileri</span>
              </div>

              <div className="space-y-1.5 pt-1 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Müşteri Adı / Ünvan:</span>
                  <span className="font-bold text-slate-900 text-sm">{vehicle.customer?.fullName || 'Belirtilmedi'}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-slate-400 block text-[11px]">İletişim Telefonu:</span>
                    <span className="font-mono font-bold text-slate-800">{vehicle.customer?.phone || '-'}</span>
                  </div>
                  {vehicle.customer?.secondaryPhone && (
                    <div>
                      <span className="text-slate-400 block text-[11px]">2. Telefon:</span>
                      <span className="font-mono text-slate-600">{vehicle.customer.secondaryPhone}</span>
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Adres / Lokasyon:</span>
                  <span className="text-slate-700">{vehicle.customer?.address || 'Adres Kaydedilmedi'} {vehicle.customer?.city ? `(${vehicle.customer.city})` : ''}</span>
                </div>
              </div>
            </div>

          </div>

          {/* 3. Özet İstatistik Çubuğu */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-cyan-900/5 border border-cyan-500/20 rounded-xl p-3 text-center">
            <div>
              <span className="text-[11px] text-slate-500 block">Güncel Sayaç KM</span>
              <span className="text-base font-black text-[#0c243f]">{vehicle.currentKm.toLocaleString()} KM</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Toplam Servis Girişi</span>
              <span className="text-base font-black text-cyan-700">{vehicleOrders.length} Giriş</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Değişen Parça Sayısı</span>
              <span className="text-base font-black text-emerald-700">{totalPartsReplaced} Adet</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Gelecek Bakım Hedefi</span>
              <span className="text-base font-black text-blue-700">
                {latestOrder?.nextMaintenanceKm ? `${latestOrder.nextMaintenanceKm.toLocaleString()} KM` : 'Belirlenmedi'}
              </span>
            </div>
          </div>

          {/* 4. Kronolojik Servis ve Parça Değişim Tarihçesi */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-black text-sm text-[#0c243f] flex items-center gap-2">
                <Wrench className="w-4 h-4 text-cyan-600" />
                Kronolojik Servis, Bakım ve Değişen Parça Geçmişi
              </h3>
              <span className="text-xs text-slate-500">
                En güncel işlemden eskiye doğru sıralanmıştır ({vehicleOrders.length} Kayıt)
              </span>
            </div>

            {vehicleOrders.length === 0 ? (
              <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                Bu araç için sisteme girilmiş tamamlanmış servis kaydı bulunmamaktadır.
              </div>
            ) : (
              vehicleOrders.map((order, index) => {
                const parts = order.items.filter((i) => i.type === 'PART');
                const labors = order.items.filter((i) => i.type === 'LABOR');

                return (
                  <div
                    key={order.id}
                    className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs space-y-3 break-inside-avoid"
                  >
                    {/* Kart Başlığı */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-[#0c243f] text-cyan-300 font-bold text-xs flex items-center justify-center shrink-0">
                          {vehicleOrders.length - index}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{formatDateOnly(order.entryDate)}</span>
                            <span className="text-slate-400">•</span>
                            <span className="font-mono font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded text-xs">
                              {order.kmAtEntry.toLocaleString()} KM
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {SERVICE_TYPE_LABELS[order.serviceType || 'PERIYODIK_BAKIM'] || 'Periyodik Bakım'}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">İş Emri No: {order.orderNo}</span>
                        </div>
                      </div>

                      <div className="text-left sm:text-right text-xs">
                        <span className="text-slate-400 block text-[11px]">Sorumlu Usta / Teknisyen:</span>
                        <span className="font-bold text-slate-800">{order.assignedTechnician || 'Genel Mekanik Ekibi'}</span>
                      </div>
                    </div>

                    {/* Müşteri Şikayeti & Usta Teşhis Notu */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                      <div>
                        <span className="font-bold text-slate-500 block text-[11px]">Giriş Şikayeti / Talep:</span>
                        <p className="text-slate-800 mt-0.5">{order.customerComplaint}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-500 block text-[11px]">Usta Teşhis & İşlem Notu:</span>
                        <p className="text-slate-800 mt-0.5">{order.technicianNotes || 'Rutin kontrol ve periyodik işlem yapıldı.'}</p>
                      </div>
                    </div>

                    {/* Değişen Parçalar ve Yapılan İşlemler Tablosu */}
                    <div className="space-y-2 pt-1">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                            <th className="py-1.5 w-16">Tür</th>
                            <th className="py-1.5">İşlem / Parça Tanımı</th>
                            <th className="py-1.5 text-center w-16">Miktar</th>
                            <th className="py-1.5 text-right w-24">Birim Fiyat</th>
                            <th className="py-1.5 text-right w-24">Toplam</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {order.items.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/50">
                              <td className="py-1.5">
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                  item.type === 'PART' ? 'bg-cyan-50 text-cyan-800' : 'bg-amber-50 text-amber-800'
                                }`}>
                                  {item.type === 'PART' ? 'PARÇA' : 'İŞÇİLİK'}
                                </span>
                              </td>
                              <td className="py-1.5 font-medium text-slate-800">
                                {item.name}
                              </td>
                              <td className="py-1.5 text-center font-bold text-slate-700">
                                {item.quantity}
                              </td>
                              <td className="py-1.5 text-right text-slate-500 font-mono">
                                {formatCurrency(item.unitPrice)}
                              </td>
                              <td className="py-1.5 text-right font-bold text-slate-800 font-mono">
                                {formatCurrency(item.totalPrice)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* İş Emri Toplam Satırı */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                        <div className="flex items-center gap-4">
                          {order.nextMaintenanceKm && (
                            <span>
                              Bir Sonraki Bakım Hedefi: <strong className="text-slate-800 font-mono">{order.nextMaintenanceKm.toLocaleString()} KM</strong>
                              {order.nextMaintenanceDate && ` (${formatDateOnly(order.nextMaintenanceDate)})`}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 font-bold text-slate-900 mt-1 sm:mt-0">
                          <span>İş Emri Tutarı:</span>
                          <span className="text-sm font-black text-[#0c243f] font-mono">
                            {formatCurrency(order.grandTotal)}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>

          {/* 5. Alt Bilgi & Yetkili İmzaları */}
          <div className="pt-6 border-t-2 border-slate-200 grid grid-cols-3 gap-6 text-center text-xs break-inside-avoid">
            <div>
              <p className="font-bold text-slate-700 mb-10">Servis Danışmanı</p>
              <div className="border-t border-slate-300 pt-1 text-slate-500 text-[11px]">İmza</div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <QrCode className="w-12 h-12 text-slate-400 mb-1" />
              <p className="text-[10px] text-slate-400 leading-tight">
                Bu belge Services Otomotiv Sistemi tarafından dijital olarak doğrulanmıştır.
              </p>
            </div>

            <div>
              <p className="font-bold text-slate-700 mb-10">Müşteri / Araç Sahibi</p>
              <div className="border-t border-slate-300 pt-1 text-slate-500 text-[11px]">
                {vehicle.customer?.fullName || 'İsim / İmza'}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
