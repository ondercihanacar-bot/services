'use client';

import React, { useState } from 'react';
import { EnrichedServiceOrder } from '@/lib/db';
import { ServiceStatus } from '@/types';
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
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Car className="w-6 h-6 text-amber-400" />
            Araç Takibi & Servis İş Emirleri
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Dükkandaki araçların servis kabulü, tamir aşamaları, usta ataması ve hesap dökümü.
          </p>
        </div>

        <button
          onClick={onOpenNewOrder}
          className="self-start sm:self-auto px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold rounded-lg shadow-md shadow-amber-500/20 text-sm flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Yeni Araç Kabul (İş Emri Aç)
        </button>
      </div>

      {/* Arama & Filtreler */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Arama Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Plaka, Müşteri Adı veya İş Emri No ile ara..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Durum Filtre Butonları */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <Filter className="w-3.5 h-3.5 text-slate-500 mr-1 shrink-0" />
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg shrink-0 transition-colors ${
                activeFilter === f.key
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {f.label}
              {f.key !== 'ALL' && (
                <span className="ml-1.5 opacity-70 text-[10px]">
                  ({orders.filter((o) => o.status === f.key).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* İş Emirleri Listesi */}
      {filteredOrders.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <Car className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">İş Emri Bulunamadı</h3>
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
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden shadow-sm transition-all"
              >
                {/* Kart Üst Bilgisi */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 bg-slate-900/50">
                  
                  {/* Araç & Plaka & Müşteri */}
                  <div className="flex items-start sm:items-center gap-3">
                    {/* TR Plaka */}
                    <div className="relative inline-flex items-center bg-white text-slate-950 border-2 border-slate-400 rounded px-2.5 py-1 font-mono font-black text-base tracking-wider shadow-sm shrink-0">
                      <span className="w-4 text-center bg-blue-700 text-white text-[9px] font-bold py-0.5 px-0.5 rounded-sm mr-1.5 -ml-1">TR</span>
                      {order.vehicle?.plate || 'PLAKA YOK'}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-base text-white">
                          {order.vehicle ? `${order.vehicle.brand} ${order.vehicle.model}` : 'Araç Bilinmiyor'}
                        </span>
                        <span className="text-xs text-slate-400">({order.vehicle?.year})</span>
                        <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                          {order.orderNo}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1 font-medium text-slate-300">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          {order.customer?.fullName} ({order.customer?.phone})
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {formatDate(order.entryDate)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Wrench className="w-3.5 h-3.5 text-amber-500" />
                          Usta: <strong className="text-slate-200">{order.assignedTechnician || 'Atanmadı'}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Durum & Fiyat & Hızlı Butonlar */}
                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <div className="text-left md:text-right">
                      <span className={`inline-block px-3 py-1 text-xs font-bold rounded-md border ${statusMeta.bg} ${statusMeta.color} ${statusMeta.border}`}>
                        {statusMeta.label}
                      </span>
                      <div className="text-sm font-extrabold text-white mt-1">
                        {formatCurrency(order.grandTotal)}
                        {order.paymentStatus === 'PAID' ? (
                          <span className="ml-1.5 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">Ödendi</span>
                        ) : (
                          <span className="ml-1.5 text-[10px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">Tahsil Edilmedi</span>
                        )}
                      </div>
                    </div>

                    {/* Fiş Yazdır & WhatsApp */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onSelectOrderForPrint(order)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors"
                        title="Resmi Servis Fişi / Fatura Yazdır"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => sendWhatsApp(order)}
                        className="p-2 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-400 hover:text-emerald-300 rounded-lg border border-emerald-800/80 transition-colors"
                        title="Müşteriye WhatsApp'tan Durum Gönder"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition-colors"
                        title="Detayları Göster / Gizle"
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    </div>

                  </div>

                </div>

                {/* Hızlı Durum Değiştirme Butonları Çubuğu */}
                <div className="px-4 py-2.5 bg-slate-950/70 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="text-slate-400">
                    <strong>Arıza / Şikayet:</strong> {order.customerComplaint}
                  </div>
                  
                  {/* Tek Tık Durum İlerlemesi */}
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-slate-500 mr-1">Durumu Güncelle:</span>
                    {order.status !== 'IN_PROGRESS' && (
                      <button
                        onClick={() => onUpdateStatus(order.id, 'IN_PROGRESS')}
                        className="px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded text-[11px] font-semibold"
                      >
                        Liftte / Tamirde
                      </button>
                    )}
                    {order.status !== 'WAITING_PARTS' && (
                      <button
                        onClick={() => onUpdateStatus(order.id, 'WAITING_PARTS')}
                        className="px-2 py-1 bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded text-[11px] font-semibold"
                      >
                        Parça Bekleniyor
                      </button>
                    )}
                    {order.status !== 'READY' && (
                      <button
                        onClick={() => onUpdateStatus(order.id, 'READY')}
                        className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[11px] font-semibold"
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
                        className="px-2.5 py-1 bg-emerald-500 text-slate-950 font-bold rounded text-[11px] flex items-center gap-1 shadow-sm"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Teslim Et & Tahsil Et
                      </button>
                    )}
                  </div>
                </div>

                {/* Genişletilmiş Detaylar (Kullanılan Parçalar & İşçilik) */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 bg-slate-950/40 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        Yapılan İşlemler & Kullanılan Parçalar ({order.items.length})
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400">
                              <th className="pb-2">Tür</th>
                              <th className="pb-2">Açıklama / Parça</th>
                              <th className="pb-2 text-center">Adet</th>
                              <th className="pb-2 text-right">Birim Fiyat</th>
                              <th className="pb-2 text-right">KDV</th>
                              <th className="pb-2 text-right">Toplam</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/40">
                            {order.items.map((item) => (
                              <tr key={item.id} className="text-slate-300">
                                <td className="py-2">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    item.type === 'PART'
                                      ? 'bg-amber-500/20 text-amber-300'
                                      : 'bg-blue-500/20 text-blue-300'
                                  }`}>
                                    {item.type === 'PART' ? 'Yedek Parça' : 'İşçilik'}
                                  </span>
                                </td>
                                <td className="py-2 font-medium">{item.name}</td>
                                <td className="py-2 text-center">{item.quantity}</td>
                                <td className="py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                                <td className="py-2 text-right">%{item.vatRate}</td>
                                <td className="py-2 text-right font-bold text-white">{formatCurrency(item.totalPrice)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Usta Notu & Gelecek Bakım KM */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-800 text-xs">
                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                        <span className="font-bold text-slate-400 block mb-1">Usta Teşhis & Notları:</span>
                        <p className="text-slate-300">{order.technicianNotes || 'Usta notu girilmemiş.'}</p>
                      </div>

                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-400 block mb-1">Gelecek Periyodik Bakım:</span>
                          <span className="text-amber-400 font-bold text-sm">
                            {order.nextMaintenanceKm ? `${order.nextMaintenanceKm.toLocaleString()} KM` : 'Belirtilmedi'}
                          </span>
                        </div>
                        {order.nextMaintenanceDate && (
                          <div className="text-right">
                            <span className="text-slate-500 text-[11px] block">Tarih Hedefi:</span>
                            <span className="text-slate-200">{order.nextMaintenanceDate}</span>
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
