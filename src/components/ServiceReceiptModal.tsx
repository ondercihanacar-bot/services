'use client';

import React from 'react';
import { Shop } from '@/types';
import { EnrichedServiceOrder } from '@/lib/db';
import { formatCurrency, formatDate, formatDateOnly } from '@/lib/utils';
import { Printer, X, Wrench, CheckCircle } from 'lucide-react';

interface ServiceReceiptModalProps {
  order: EnrichedServiceOrder | null;
  shop: Shop;
  onClose: () => void;
  onOpenOilSticker?: (order: EnrichedServiceOrder) => void;
}

export default function ServiceReceiptModal({
  order,
  shop,
  onClose,
  onOpenOilSticker
}: ServiceReceiptModalProps) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Modal Kutusu */}
      <div className="bg-white text-slate-900 rounded-xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-y-auto">
        
        {/* Modal Üst Kontrol Çubuğu (Yazdırmada Gizlenir) */}
        <div className="no-print p-4 bg-[#0c243f] text-white flex items-center justify-between border-b border-cyan-500/20 rounded-t-xl">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-sm">Resmi Servis Formu & Teslim Tutanağı</span>
          </div>
          <div className="flex items-center gap-2">
            {onOpenOilSticker && (
              <button
                onClick={() => onOpenOilSticker(order)}
                className="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-600 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                title="Kapı Direği Yağ Değişim Kartını Aç"
              >
                <span>Yağ Kartı Etiketi</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 neon-btn-primary font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4 text-cyan-300" /> Yazdır (A4)
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Yazdırılabilir A4 Belge Alanı */}
        <div id="printable-receipt" className="p-6 sm:p-8 space-y-6 text-slate-900 bg-white">
          
          {/* Servis Başlığı & Logo & İş Emri No */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-2 border-slate-900 pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <img src="/logo.png" alt="Services Logo" className="w-8 h-8 rounded-lg object-contain shadow-xs" />
                <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">
                  {shop.name}
                </h1>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-sm">
                {shop.address}, {shop.district} / {shop.city}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                <strong>Tel:</strong> {shop.phone} {shop.email && `• ${shop.email}`}
              </p>
              {shop.taxNumber && (
                <p className="text-[11px] text-slate-500 mt-0.5">
                  <strong>V.D. / No:</strong> {shop.taxOffice} - {shop.taxNumber}
                </p>
              )}
            </div>

            <div className="text-right sm:self-start">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white font-mono font-bold text-sm rounded">
                {order.orderNo}
              </span>
              <p className="text-xs text-slate-600 mt-1.5">
                <strong>Giriş Tarihi:</strong> {formatDate(order.entryDate)}
              </p>
              {order.completionDate && (
                <p className="text-xs text-slate-600">
                  <strong>Teslim Tarihi:</strong> {formatDate(order.completionDate)}
                </p>
              )}
            </div>
          </div>

          {/* İki Kutu: Araç Bilgileri & Müşteri Bilgileri */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Araç Kutusu */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-1.5">
                <span className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">Araç Bilgileri</span>
                {/* TR Plaka */}
                <div className="inline-flex items-center bg-white text-slate-950 border border-slate-300 rounded px-2 py-0.5 font-mono font-black text-xs">
                  <span className="bg-[#0c243f] text-cyan-300 text-[7px] font-bold px-1 rounded-sm mr-1 -ml-1">TR</span>
                  {order.vehicle?.plate}
                </div>
              </div>
              <div>
                <span className="text-slate-500">Marka / Model:</span>{' '}
                <strong className="text-slate-800">{order.vehicle?.brand} {order.vehicle?.model}</strong>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500">Model Yılı:</span>{' '}
                  <span className="font-medium">{order.vehicle?.year}</span>
                </div>
                <div>
                  <span className="text-slate-500">Servis KM:</span>{' '}
                  <strong className="text-slate-900">{order.kmAtEntry?.toLocaleString()} KM</strong>
                </div>
              </div>
              <div>
                <span className="text-slate-500">Şasi No (VIN):</span>{' '}
                <span className="font-mono text-[11px]">{order.vehicle?.chassisNo || '-'}</span>
              </div>
            </div>

            {/* Müşteri Kutusu */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
              <div className="border-b border-slate-200 pb-1.5 mb-1.5">
                <span className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">Müşteri Bilgileri</span>
              </div>
              <div>
                <span className="text-slate-500">Ad Soyad / Firma:</span>{' '}
                <strong className="text-slate-800">{order.customer?.fullName}</strong>
              </div>
              <div>
                <span className="text-slate-500">Telefon:</span>{' '}
                <span className="font-medium text-slate-800">{order.customer?.phone}</span>
              </div>
              <div>
                <span className="text-slate-500">Adres:</span>{' '}
                <span className="text-slate-700">{order.customer?.address || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500">Sorumlu Usta:</span>{' '}
                <strong className="text-slate-900">{order.assignedTechnician || 'Genel Servis'}</strong>
              </div>
            </div>

          </div>

          {/* Arıza Şikayeti & Usta Açıklaması */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
            <div>
              <strong className="text-slate-700">Müşteri Şikayeti / Arıza Beyanı:</strong>{' '}
              <span className="text-slate-800">{order.customerComplaint}</span>
            </div>
            {order.technicianNotes && (
              <div>
                <strong className="text-slate-700">Yapılan Teşhis ve İşlemler:</strong>{' '}
                <span className="text-slate-800">{order.technicianNotes}</span>
              </div>
            )}
            {(order.fuelLevel || order.damageNotes) && (
              <div className="pt-1.5 mt-1.5 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-[11px]">
                {order.fuelLevel && (
                  <div>
                    <strong className="text-slate-600">Kabul Yakıt Seviyesi:</strong>{' '}
                    <span className="font-semibold text-slate-800">
                      {order.fuelLevel === 'EMPTY' ? 'Rezerv (Boş)' : order.fuelLevel === 'QUARTER' ? '1/4 Depo' : order.fuelLevel === 'HALF' ? '1/2 Depo' : order.fuelLevel === 'THREE_QUARTERS' ? '3/4 Depo' : 'Tam Depo'}
                    </span>
                  </div>
                )}
                {order.damageNotes && (
                  <div>
                    <strong className="text-slate-600">Giriş Hasar / Kaporta Çizik Tespiti:</strong>{' '}
                    <span className="text-slate-800">{order.damageNotes}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Parça ve İşçilik Kalemleri Tablosu */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600 mb-2">
              Kullanılan Parçalar & Uygulanan İşçilikler
            </h3>
            <table className="w-full text-xs border border-slate-200">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-2 px-3 text-left w-12">Sıra</th>
                  <th className="py-2 px-3 text-left">İşlem / Parça Açıklaması</th>
                  <th className="py-2 px-3 text-center w-16">Miktar</th>
                  <th className="py-2 px-3 text-right w-24">Birim Fiyat</th>
                  <th className="py-2 px-3 text-right w-16">KDV</th>
                  <th className="py-2 px-3 text-right w-24">Tutar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.items.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="py-2 px-3 text-center text-slate-500">{idx + 1}</td>
                    <td className="py-2 px-3 font-medium text-slate-900">
                      {item.name}
                      <span className="ml-2 text-[10px] text-slate-500">
                        ({item.type === 'PART' ? 'Parça' : 'İşçilik'})
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">{item.quantity}</td>
                    <td className="py-2 px-3 text-right font-mono">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-2 px-3 text-right">%{item.vatRate}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{formatCurrency(item.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Finansal Toplamlar & Gelecek Bakım */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
            
            <div className="text-xs text-slate-600 space-y-1">
              {order.nextMaintenanceKm && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-amber-900">
                  <strong>Bir Sonraki Periyodik Bakım:</strong>{' '}
                  <span className="font-bold">{order.nextMaintenanceKm.toLocaleString()} KM</span>
                  {order.nextMaintenanceDate && ` veya ${order.nextMaintenanceDate}`}
                </div>
              )}
              <p className="text-[11px] text-slate-500 max-w-xs mt-2">
                * Değiştirilen parçalar 1 yıl üretici garantilidir. Yapılan işçilik servisimizin garantisi altındadır.
              </p>
            </div>

            {/* Fatura Toplamı */}
            <div className="w-full sm:w-64 text-xs space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Parça Toplamı:</span>
                <span className="font-mono">{formatCurrency(order.partsTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>İşçilik Toplamı:</span>
                <span className="font-mono">{formatCurrency(order.laborTotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>İskonto / İndirim:</span>
                  <span className="font-mono">-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Hesaplanan KDV (%20):</span>
                <span className="font-mono">{formatCurrency(order.taxTotal)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm text-slate-950 pt-2 border-t border-slate-300">
                <span>GENEL TOPLAM:</span>
                <span className="font-mono">{formatCurrency(order.grandTotal)}</span>
              </div>
            </div>

          </div>

          {/* İmzalar */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-300 text-xs text-center">
            <div>
              <p className="font-bold text-slate-700">Servis Yetkilisi / Usta</p>
              <p className="text-[11px] text-slate-500 mt-1">{order.assignedTechnician || shop.name}</p>
              <div className="mt-8 border-b border-dashed border-slate-400 w-32 mx-auto"></div>
              <p className="text-[10px] text-slate-400 mt-1">İmza / Kaşe</p>
            </div>

            <div>
              <p className="font-bold text-slate-700">Teslim Alan (Araç Sahibi)</p>
              <p className="text-[11px] text-slate-500 mt-1">{order.customer?.fullName}</p>
              <div className="mt-8 border-b border-dashed border-slate-400 w-32 mx-auto"></div>
              <p className="text-[10px] text-slate-400 mt-1">İmza</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
