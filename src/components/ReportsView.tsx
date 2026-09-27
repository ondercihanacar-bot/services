'use client';

import React, { useState, useMemo } from 'react';
import { Vehicle, Customer, Shop } from '@/types/index';
import { EnrichedServiceOrder } from '@/lib/db';
import { formatCurrency, formatDateOnly, SERVICE_TYPE_LABELS, STATUS_LABELS } from '@/lib/utils';
import {
  Search,
  Calendar,
  Filter,
  Download,
  Printer,
  FileSpreadsheet,
  Car,
  Wrench,
  Package,
  TrendingUp,
  Receipt,
  FileCheck2,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';

interface ReportsViewProps {
  orders: EnrichedServiceOrder[];
  vehicles: (Vehicle & { customer?: Customer })[];
  shop: Shop;
  onOpenOrder: (order: EnrichedServiceOrder) => void;
  onOpenHistoryModal: (vehicle: Vehicle & { customer?: Customer }) => void;
}

export default function ReportsView({
  orders,
  vehicles,
  shop,
  onOpenOrder,
  onOpenHistoryModal
}: ReportsViewProps) {
  // Tarih aralığı durumları
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  
  // Varsayılan: Son 30 gün
  const defaultStartDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  }, []);

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(todayStr);
  const [textQuery, setTextQuery] = useState('');
  const [selectedServiceType, setSelectedServiceType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Hızlı Tarih Seçiciler
  const setQuickRange = (range: 'TODAY' | 'LAST_7' | 'THIS_MONTH' | 'LAST_30' | 'THIS_YEAR' | 'ALL') => {
    const now = new Date();
    const end = now.toISOString().split('T')[0];
    setEndDate(end);

    if (range === 'TODAY') {
      setStartDate(end);
    } else if (range === 'LAST_7') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      setStartDate(d.toISOString().split('T')[0]);
    } else if (range === 'THIS_MONTH') {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(d.toISOString().split('T')[0]);
    } else if (range === 'LAST_30') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      setStartDate(d.toISOString().split('T')[0]);
    } else if (range === 'THIS_YEAR') {
      const d = new Date(now.getFullYear(), 0, 1);
      setStartDate(d.toISOString().split('T')[0]);
    } else if (range === 'ALL') {
      setStartDate('2020-01-01');
    }
  };

  // Filtreleme mantığı
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Tarih aralığı kontrolü
      const orderDate = (order.entryDate || order.createdAt).split('T')[0];
      if (startDate && orderDate < startDate) return false;
      if (endDate && orderDate > endDate) return false;

      // 2. Durum kontrolü
      if (selectedStatus !== 'ALL' && order.status !== selectedStatus) return false;

      // 3. Servis Türü kontrolü
      if (selectedServiceType !== 'ALL' && (order.serviceType || 'PERIYODIK_BAKIM') !== selectedServiceType) return false;

      // 4. Metin Arama (Plaka, Müşteri, Şikayet, Usta, Değişen Parça / İşlem Adı)
      if (textQuery.trim()) {
        const q = textQuery.toLowerCase().trim();
        const plate = (order.vehicle?.plate || '').toLowerCase();
        const brandModel = `${order.vehicle?.brand || ''} ${order.vehicle?.model || ''}`.toLowerCase();
        const customer = (order.customer?.fullName || '').toLowerCase();
        const orderNo = order.orderNo.toLowerCase();
        const complaint = (order.customerComplaint || '').toLowerCase();
        const notes = (order.technicianNotes || '').toLowerCase();
        const technician = (order.assignedTechnician || '').toLowerCase();

        // Parça veya işlem isimlerinde geçiyor mu?
        const hasMatchingItem = order.items.some((item) =>
          item.name.toLowerCase().includes(q)
        );

        const matches =
          plate.includes(q) ||
          brandModel.includes(q) ||
          customer.includes(q) ||
          orderNo.includes(q) ||
          complaint.includes(q) ||
          notes.includes(q) ||
          technician.includes(q) ||
          hasMatchingItem;

        if (!matches) return false;
      }

      return true;
    }).sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());
  }, [orders, startDate, endDate, selectedStatus, selectedServiceType, textQuery]);

  // Toplam İstatistikler
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.grandTotal, 0);
  const totalLabor = filteredOrders.reduce((sum, o) => sum + o.laborTotal, 0);
  const totalParts = filteredOrders.reduce((sum, o) => sum + o.partsTotal, 0);
  const totalItemsCount = filteredOrders.reduce((acc, o) => acc + o.items.length, 0);

  // CSV / Excel İndirme
  const exportToCSV = () => {
    const headers = ['Is Emri No', 'Tarih', 'Plaka', 'Marka Model', 'Musteri', 'Servis KM', 'Servis Turu', 'Yapilan Islemler / Parcalar', 'Tutar (TL)', 'Durum'];
    
    const rows = filteredOrders.map((o) => {
      const itemsList = o.items.map((i) => `${i.name} (${i.quantity} ${i.type === 'PART' ? 'parça' : 'işçilik'})`).join('; ');
      return [
        o.orderNo,
        o.entryDate ? o.entryDate.split('T')[0] : '',
        o.vehicle?.plate || '',
        `${o.vehicle?.brand || ''} ${o.vehicle?.model || ''}`,
        o.customer?.fullName || '',
        o.kmAtEntry || '',
        SERVICE_TYPE_LABELS[o.serviceType || 'PERIYODIK_BAKIM'] || 'Periyodik Bakım',
        `"${itemsList.replace(/"/g, '""')}"`,
        o.grandTotal,
        STATUS_LABELS[o.status]?.label || o.status
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Servis_Raporu_${startDate}_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Üst Başlık & İndirme Butonları */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0c243f] flex items-center gap-2">
            <Calendar className="w-6 h-6 text-cyan-600" />
            Tarih & İşlem Bazlı Servis Sorgulama
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Tarih aralığı, plaka, değişen parça ve yapılan işleme göre gelişmiş geçmiş arama ve döküm raporları.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={exportToCSV}
            className="neon-btn-secondary px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-2xs"
            title="Sorgulanan verileri Excel formatında indir"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Excel (CSV) İndir</span>
          </button>

          <button
            onClick={() => window.print()}
            className="neon-btn-primary px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
            title="Raporu yazdır veya PDF olarak kaydet"
          >
            <Printer className="w-4 h-4 text-cyan-300" />
            <span>Yazdır / PDF</span>
          </button>
        </div>
      </div>

      {/* 4 Özet Finansal ve Teknik İstatistik Kartı */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="card-tech rounded-2xl p-3.5 sm:p-4">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Bulunan İş Emri</span>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0c243f]">{filteredOrders.length}</span>
            <span className="text-[11px] text-slate-500">kayıt</span>
          </div>
        </div>

        <div className="card-tech rounded-2xl p-3.5 sm:p-4">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block">İşlem / Parça</span>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl lg:text-3xl font-black text-cyan-700">{totalItemsCount}</span>
            <span className="text-[11px] text-slate-500">adet</span>
          </div>
        </div>

        <div className="card-tech rounded-2xl p-3.5 sm:p-4">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Parça Toplamı</span>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-base sm:text-lg lg:text-xl font-black text-slate-800 font-mono whitespace-nowrap truncate">{formatCurrency(totalParts)}</span>
          </div>
        </div>

        <div className="card-tech rounded-2xl p-3.5 sm:p-4 bg-gradient-to-br from-white to-cyan-50/50">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Toplam Ciro (Dönem)</span>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-base sm:text-lg lg:text-xl font-black text-[#0c243f] font-mono whitespace-nowrap truncate">{formatCurrency(totalRevenue)}</span>
          </div>
        </div>

      </div>

      {/* Gelişmiş Filtre ve Arama Paneli */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
        
        {/* Hızlı Tarih Butonları */}
        <div className="flex flex-wrap items-center gap-1.5 pb-3 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-cyan-600" /> Hızlı Aralık:
          </span>
          <button
            onClick={() => setQuickRange('TODAY')}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 text-slate-700 transition-colors cursor-pointer"
          >
            Bugün
          </button>
          <button
            onClick={() => setQuickRange('LAST_7')}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 text-slate-700 transition-colors cursor-pointer"
          >
            Son 7 Gün
          </button>
          <button
            onClick={() => setQuickRange('THIS_MONTH')}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 text-slate-700 transition-colors cursor-pointer"
          >
            Bu Ay
          </button>
          <button
            onClick={() => setQuickRange('LAST_30')}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 text-slate-700 transition-colors cursor-pointer"
          >
            Son 30 Gün
          </button>
          <button
            onClick={() => setQuickRange('THIS_YEAR')}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 text-slate-700 transition-colors cursor-pointer"
          >
            Bu Yıl (2026)
          </button>
          <button
            onClick={() => setQuickRange('ALL')}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 text-slate-700 transition-colors cursor-pointer"
          >
            Tüm Zamanlar
          </button>
        </div>

        {/* Form Filtreleri */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Başlangıç Tarihi */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Başlangıç Tarihi</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white"
            />
          </div>

          {/* Bitiş Tarihi */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Bitiş Tarihi</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white"
            />
          </div>

          {/* Servis Türü */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Servis / İşlem Türü</label>
            <select
              value={selectedServiceType}
              onChange={(e) => setSelectedServiceType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white cursor-pointer"
            >
              <option value="ALL">Tüm İşlem Türleri</option>
              <option value="PERIYODIK_BAKIM">Periyodik Bakım</option>
              <option value="MEKANIK_ONARIM">Mekanik Onarım</option>
              <option value="AGIR_BAKIM">Ağır Bakım (Triger/Debriyaj)</option>
              <option value="FREN_SISTEMI">Fren Sistemi</option>
              <option value="ELEKTRIK_ELEKTRONIK">Elektrik & Elektronik</option>
              <option value="KAPORTA_BOYA">Kaporta & Boya</option>
            </select>
          </div>

          {/* İş Emri Durumu */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">İş Emri Durumu</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white cursor-pointer"
            >
              <option value="ALL">Tüm Durumlar</option>
              <option value="COMPLETED">Teslim Edildi (Tamamlandı)</option>
              <option value="READY">Hazır (Teslim Bekliyor)</option>
              <option value="IN_PROGRESS">Tamirde / Liftte</option>
              <option value="WAITING_PARTS">Parça Bekleniyor</option>
              <option value="PENDING">Beklemede / Sırada</option>
            </select>
          </div>

        </div>

        {/* Serbest Metin Arama Çubuğu */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={textQuery}
            onChange={(e) => setTextQuery(e.target.value)}
            placeholder="Değişen parça adı (örn: Triger, Yağ, Balata), plaka, müşteri adı veya usta ismi ile ara..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all"
          />
        </div>

      </div>

      {/* Sorgulama Sonuç Tablosu */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
          <span>Sorgulama Sonuçları ({filteredOrders.length} İş Emri)</span>
          <span className="font-mono text-slate-700 font-bold lowercase">
            {startDate} - {endDate}
          </span>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm space-y-2">
            <Car className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-bold text-slate-700">Arama kriterlerinize uyan işlem kaydı bulunamadı.</p>
            <p className="text-xs text-slate-400">Tarih aralığını genişletmeyi veya arama terimini değiştirmeyi deneyebilirsiniz.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredOrders.map((order) => {
              const statusMeta = STATUS_LABELS[order.status] || STATUS_LABELS.PENDING;
              const vehicleItem = vehicles.find((v) => v.id === order.vehicleId);

              return (
                <div
                  key={order.id}
                  className="p-4 sm:p-5 hover:bg-cyan-50/20 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  {/* Sol Taraf: Plaka, Tarih, Model, Usta */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    {/* TR Plaka */}
                    <div className="relative inline-flex items-center bg-white text-slate-950 border border-slate-300 rounded-lg px-2.5 py-1 font-mono font-black text-sm tracking-wider shadow-2xs shrink-0">
                      <span className="w-4 text-center bg-[#0c243f] text-cyan-300 text-[8px] font-bold py-0.5 px-0.5 rounded-2xs mr-1.5 -ml-1">TR</span>
                      {order.vehicle?.plate || 'PLAKA YOK'}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {order.vehicle ? `${order.vehicle.brand} ${order.vehicle.model}` : 'Bilinmeyen Araç'}
                        </span>
                        <span className="font-mono text-xs text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded font-bold">
                          {order.kmAtEntry.toLocaleString()} KM
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {SERVICE_TYPE_LABELS[order.serviceType || 'PERIYODIK_BAKIM'] || 'Periyodik Bakım'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>Tarih: <strong className="text-slate-700">{formatDateOnly(order.entryDate)}</strong></span>
                        <span>•</span>
                        <span>Müşteri: <strong className="text-slate-700">{order.customer?.fullName}</strong></span>
                        <span>•</span>
                        <span>Usta: <strong className="text-slate-700">{order.assignedTechnician || 'Genel Ekip'}</strong></span>
                        <span>•</span>
                        <span className="font-mono text-slate-400">İş Emri: {order.orderNo}</span>
                      </div>

                      {/* Değişen Parçalar ve İşlemler Listesi (Etiketler) */}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {order.items.map((item) => (
                          <span
                            key={item.id}
                            className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                              item.type === 'PART'
                                ? 'bg-cyan-50/80 text-cyan-900 border-cyan-200'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            {item.quantity > 1 ? `${item.quantity}x ` : ''}{item.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sağ Taraf: Fiyat, Durum & Aksiyon Butonları */}
                  <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="text-left lg:text-right">
                      <div className="text-base sm:text-lg font-black text-[#0c243f] font-mono">
                        {formatCurrency(order.grandTotal)}
                      </div>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border mt-0.5 ${statusMeta.bg} ${statusMeta.color} ${statusMeta.border}`}>
                        {statusMeta.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Bakım Karnesini Aç */}
                      {vehicleItem && (
                        <button
                          onClick={() => onOpenHistoryModal(vehicleItem)}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                          title="Bu aracın tüm servis geçmişi ve bakım karnesini dök"
                        >
                          <FileCheck2 className="w-4 h-4 text-cyan-700" />
                        </button>
                      )}

                      {/* Fişi Aç / Yazdır */}
                      <button
                        onClick={() => onOpenOrder(order)}
                        className="px-3 py-2 neon-btn-secondary text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                        title="İş Emri Fişini Görüntüle / Yazdır"
                      >
                        <Receipt className="w-3.5 h-3.5 text-cyan-600" />
                        <span>Fiş</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
