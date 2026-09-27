'use client';

import React, { useState } from 'react';
import { EnrichedServiceOrder } from '@/lib/db';
import { ServiceStatus } from '@/types/index';
import { formatCurrency, formatDate, STATUS_LABELS } from '@/lib/utils';
import {
  Car,
  Search,
  Filter,
  Plus,
  Printer,
  MessageCircle,
  Clock,
  User,
  Wrench,
  CheckCircle2,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

interface OrdersViewProps {
  orders: EnrichedServiceOrder[];
  onOpenNewOrder: () => void;
  onSelectOrderForPrint: (order: EnrichedServiceOrder) => void;
  onUpdateStatus: (orderId: string, status: ServiceStatus) => Promise<void>;
  onUpdatePayment: (orderId: string, paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID', paidAmount: number) => Promise<void>;
}

const STATUS_FILTERS: { key: string; label: string }[] = [
  { key: 'ALL', label: 'Tümü' },
  { key: 'IN_PROGRESS', label: 'Tamirde / Liftte' },
  { key: 'WAITING_PARTS', label: 'Parça Bekleniyor' },
  { key: 'DIAGNOSIS', label: 'Ekspertiz' },
  { key: 'READY', label: 'Teslime Hazır' },
  { key: 'PENDING', label: 'Sırada' },
  { key: 'COMPLETED', label: 'Teslim Edilenler' }
];

export default function OrdersView({
  orders,
  onOpenNewOrder,
  onSelectOrderForPrint,
  onUpdateStatus,
  onUpdatePayment
}: OrdersViewProps) {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const filteredOrders = orders.filter((order) => {
    if (activeFilter !== 'ALL' && order.status !== activeFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().replace(/\s+/g, '');
      const plate = order.vehicle?.plate.toLowerCase().replace(/\s+/g, '') || '';
      const customer = order.customer?.fullName.toLowerCase() || '';
      const orderNo = order.orderNo.toLowerCase();
      return plate.includes(q) || customer.includes(q) || orderNo.includes(q);
    }
    return true;
  });

  const sendWhatsApp = (order: EnrichedServiceOrder) => {
    if (!order.customer?.phone) {
      alert('Müşteri telefon numarası bulunamadı!');
      return;
    }
    const cleanPhone = order.customer.phone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.startsWith('90')
      ? cleanPhone
      : cleanPhone.startsWith('0')
      ? `90${cleanPhone.slice(1)}`
      : `90${cleanPhone}`;

    const text = encodeURIComponent(
      `Merhaba Sayın ${order.customer.fullName},\n${order.vehicle?.plate} plakalı ${order.vehicle?.brand} ${order.vehicle?.model} aracınızın servis durumu: "${STATUS_LABELS[order.status]?.label}".\nİş Emri No: ${order.orderNo}\nToplam Tutar: ${formatCurrency(order.grandTotal)}\nDetaylı bilgi için servisimizle iletişime geçebilirsiniz.`
    );

    window.open(`https://wa.me/${phoneWithCountry}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Üst Başlık & Eylemler */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Car className="w-6 h-6 text-blue-600" />
            Araç Takibi & Servis İş Emirleri
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Dükkandaki araçların servis kabulü, tamir aşamaları, usta ataması ve hesap dökümü.
          </p>
        </div>

        <button
          onClick={onOpenNewOrder}
          className="self-start sm:self-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md shadow-blue-500/20 text-sm flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Yeni Araç Kabul (İş Emri Aç)
        </button>
      </div>

      {/* Arama & Filtreler */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Arama Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Plaka, Müşteri Adı veya İş Emri No ile ara..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>
        </div>

        {/* Durum Filtre Butonları */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg shrink-0 transition-colors ${
                activeFilter === f.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {f.label}
              {f.key !== 'ALL' && (
                <span className="ml-1.5 opacity-80 text-[10px]">
                  ({orders.filter((o) => o.status === f.key).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* İş Emirleri Listesi */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
          <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">İş Emri Bulunamadı</h3>
          <p className="text-xs text-slate-500 mt-1">
            Arama kriterlerinize uyan kayıt yok veya henüz bu durumda araç bulunmuyor.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusMeta = STATUS_LABELS[order.status] || STATUS_LABELS.PENDING;
            const isExpanded = expandedOrderId === order.id;

            return (
              <div
                key={order.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl overflow-hidden shadow-sm transition-all"
              >
                {/* Kart Üst Bilgisi */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 bg-white">
                  
                  {/* Araç & Plaka & Müşteri */}
                  <div className="flex items-start sm:items-center gap-3">
                    {/* TR Plaka */}
                    <div className="relative inline-flex items-center bg-white text-slate-950 border-2 border-slate-400 rounded px-2.5 py-1 font-mono font-black text-base tracking-wider shadow-sm shrink-0">
                      <span className="w-4 text-center bg-blue-600 text-white text-[9px] font-bold py-0.5 px-0.5 rounded-sm mr-1.5 -ml-1">TR</span>
                      {order.vehicle?.plate || 'PLAKA YOK'}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-base text-slate-900">
                          {order.vehicle ? `${order.vehicle.brand} ${order.vehicle.model}` : 'Araç Bilinmiyor'}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">({order.vehicle?.year})</span>
                        <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                          {order.orderNo}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {order.customer?.fullName} ({order.customer?.phone})
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(order.entryDate)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Wrench className="w-3.5 h-3.5 text-blue-600" />
                          Usta: <strong className="text-slate-800">{order.assignedTechnician || 'Atanmadı'}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Durum & Fiyat & Hızlı Butonlar */}
                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-left md:text-right">
                      <span className={`inline-block px-3 py-1 text-xs font-bold rounded-md border ${statusMeta.bg} ${statusMeta.color} ${statusMeta.border}`}>
                        {statusMeta.label}
                      </span>
                      <div className="text-sm font-black text-slate-900 mt-1 font-mono">
                        {formatCurrency(order.grandTotal)}
                        {order.paymentStatus === 'PAID' ? (
                          <span className="ml-1.5 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Ödendi</span>
                        ) : (
                          <span className="ml-1.5 text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">Tahsil Edilmedi</span>
                        )}
                      </div>
                    </div>

                    {/* Fiş Yazdır & WhatsApp */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onSelectOrderForPrint(order)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition-colors"
                        title="Resmi Servis Fişi / Fatura Yazdır"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => sendWhatsApp(order)}
                        className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 transition-colors"
                        title="Müşteriye WhatsApp'tan Durum Gönder"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition-colors"
                        title="Detayları Göster / Gizle"
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    </div>

                  </div>

                </div>

                {/* Hızlı Durum Değiştirme Butonları Çubuğu */}
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="text-slate-600">
                    <strong className="text-slate-800">Arıza / Şikayet:</strong> {order.customerComplaint}
                  </div>
                  
                  {/* Tek Tık Durum İlerlemesi */}
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-slate-500 mr-1 font-medium">Durumu Güncelle:</span>
                    {order.status !== 'IN_PROGRESS' && (
                      <button
                        onClick={() => onUpdateStatus(order.id, 'IN_PROGRESS')}
                        className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-[11px] font-bold"
                      >
                        Liftte / Tamirde
                      </button>
                    )}
                    {order.status !== 'WAITING_PARTS' && (
                      <button
                        onClick={() => onUpdateStatus(order.id, 'WAITING_PARTS')}
                        className="px-2 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded text-[11px] font-bold"
                      >
                        Parça Bekleniyor
                      </button>
                    )}
                    {order.status !== 'READY' && (
                      <button
                        onClick={() => onUpdateStatus(order.id, 'READY')}
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-[11px] font-bold"
                      >
                        Hazır (Teslim Et)
                      </button>
                    )}
                    {order.status === 'READY' && (
                      <button
                        onClick={() => {
                          onUpdateStatus(order.id, 'COMPLETED');
                          onUpdatePayment(order.id, 'PAID', order.grandTotal);
                        }}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px] flex items-center gap-1 shadow-sm"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Teslim Et & Tahsil Et
                      </button>
                    )}
                  </div>
                </div>

                {/* Genişletilmiş Detaylar (Kullanılan Parçalar & İşçilik) */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 bg-slate-50/60 space-y-4 border-t border-slate-100">
                    <div>
                      <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                        Yapılan İşlemler & Kullanılan Parçalar ({order.items.length})
                      </h4>
                      <div className="overflow-x-auto bg-white rounded-lg border border-slate-200">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                              <th className="py-2.5 px-3">Tür</th>
                              <th className="py-2.5 px-3">Açıklama / Parça</th>
                              <th className="py-2.5 px-3 text-center">Adet</th>
                              <th className="py-2.5 px-3 text-right">Birim Fiyat</th>
                              <th className="py-2.5 px-3 text-right">KDV</th>
                              <th className="py-2.5 px-3 text-right">Toplam</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {order.items.map((item) => (
                              <tr key={item.id} className="text-slate-800">
                                <td className="py-2.5 px-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    item.type === 'PART'
                                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                      : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                  }`}>
                                    {item.type === 'PART' ? 'Yedek Parça' : 'İşçilik'}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 font-semibold">{item.name}</td>
                                <td className="py-2.5 px-3 text-center font-mono">{item.quantity}</td>
                                <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(item.unitPrice)}</td>
                                <td className="py-2.5 px-3 text-right font-mono">%{item.vatRate}</td>
                                <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{formatCurrency(item.totalPrice)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Usta Notu & Gelecek Bakım KM */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 text-xs">
                      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm">
                        <span className="font-bold text-slate-500 block mb-1">Usta Teşhis & Notları:</span>
                        <p className="text-slate-800">{order.technicianNotes || 'Usta notu girilmemiş.'}</p>
                      </div>

                      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-500 block mb-1">Gelecek Periyodik Bakım:</span>
                          <span className="text-blue-700 font-extrabold text-sm">
                            {order.nextMaintenanceKm ? `${order.nextMaintenanceKm.toLocaleString()} KM` : 'Belirtilmedi'}
                          </span>
                        </div>
                        {order.nextMaintenanceDate && (
                          <div className="text-right">
                            <span className="text-slate-400 text-[11px] block">Tarih Hedefi:</span>
                            <span className="text-slate-700 font-semibold">{order.nextMaintenanceDate}</span>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
