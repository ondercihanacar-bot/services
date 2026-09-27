'use client';

import React, { useState, useMemo } from 'react';
import { Vehicle, Customer, Shop } from '@/types/index';
import { EnrichedServiceOrder } from '@/lib/db';
import { formatDateOnly, generateWhatsAppLink, cleanPhoneNumber } from '@/lib/utils';
import {
  Bell,
  MessageSquare,
  AlertTriangle,
  Calendar,
  ShieldCheck,
  Search,
  CheckCircle2,
  Clock,
  Car,
  User,
  Phone,
  ArrowRight,
  ExternalLink,
  Send,
  Sparkles,
  Filter
} from 'lucide-react';

interface RemindersViewProps {
  vehicles: (Vehicle & { customer?: Customer })[];
  orders: EnrichedServiceOrder[];
  shop: Shop;
  onOpenNewOrderForVehicle: (vehicle: Vehicle) => void;
  onOpenHistoryModal: (vehicle: Vehicle & { customer?: Customer }) => void;
  onShowToast: (msg: string) => void;
}

type FilterType = 'ALL' | 'DUE_15_DAYS' | 'OVERDUE' | 'THIS_MONTH' | 'INSPECTION';

interface ReminderItem {
  vehicle: Vehicle & { customer?: Customer };
  latestOrder?: EnrichedServiceOrder;
  nextDate: string | null;
  targetKm: number | null;
  lastKm: number;
  lastDate: string | null;
  diffDays: number | null; // null ise tarih yok
  type: 'MAINTENANCE' | 'INSPECTION';
  inspectionDiffDays: number | null;
}

export default function RemindersView({
  vehicles,
  orders,
  shop,
  onOpenNewOrderForVehicle,
  onOpenHistoryModal,
  onShowToast
}: RemindersViewProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('DUE_15_DAYS');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<'STANDARD' | 'SHORT' | 'INSPECTION'>('STANDARD');

  // Bugünün tarihi (Saat sıfırlanmış)
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Tüm araçlar için bir sonraki bakım ve muayene durumlarını hesapla
  const reminderItems: ReminderItem[] = useMemo(() => {
    return vehicles.map((v) => {
      // Aracın tüm siparişlerini bul
      const vOrders = orders
        .filter((o) => o.vehicleId === v.id)
        .sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());

      const latest = vOrders[0];

      // Bakım tarihi: latest order'ın nextMaintenanceDate'i veya aracın lastMaintenanceDate + 1 yıl
      let nextDateStr = latest?.nextMaintenanceDate || null;
      let targetKm = latest?.nextMaintenanceKm || (v.currentKm ? v.currentKm + 10000 : null);
      let lastKm = latest?.kmAtEntry || v.currentKm || 0;
      let lastDateStr = latest?.entryDate || v.lastMaintenanceDate || null;

      let diffDays: number | null = null;
      if (nextDateStr) {
        const nextD = new Date(nextDateStr);
        nextD.setHours(0, 0, 0, 0);
        diffDays = Math.ceil((nextD.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      }

      // Muayene tarihi hesaplaması
      let inspectionDiffDays: number | null = null;
      if (v.inspectionDate) {
        const inspD = new Date(v.inspectionDate);
        inspD.setHours(0, 0, 0, 0);
        inspectionDiffDays = Math.ceil((inspD.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      }

      return {
        vehicle: v,
        latestOrder: latest,
        nextDate: nextDateStr,
        targetKm,
        lastKm,
        lastDate: lastDateStr,
        diffDays,
        type: 'MAINTENANCE',
        inspectionDiffDays
      };
    });
  }, [vehicles, orders, today]);

  // Filtreleme
  const filteredItems = useMemo(() => {
    return reminderItems.filter((item) => {
      // Metin arama
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().replace(/\s+/g, '');
        const plate = item.vehicle.plate.toLowerCase().replace(/\s+/g, '');
        const brandModel = `${item.vehicle.brand} ${item.vehicle.model}`.toLowerCase();
        const custName = item.vehicle.customer?.fullName.toLowerCase() || '';
        const phone = item.vehicle.customer?.phone || '';

        const matches = plate.includes(q) || brandModel.includes(q) || custName.includes(q) || phone.includes(q);
        if (!matches) return false;
      }

      // Kategori filtresi
      if (activeFilter === 'DUE_15_DAYS') {
        // 15 gün veya daha az kalanlar (0 ile 15 gün arası)
        return item.diffDays !== null && item.diffDays >= 0 && item.diffDays <= 15;
      }

      if (activeFilter === 'OVERDUE') {
        // Günü geçmiş bakımlar (< 0)
        return item.diffDays !== null && item.diffDays < 0;
      }

      if (activeFilter === 'THIS_MONTH') {
        // Bu ayki bakımlar (0 ile 30 gün arası)
        return item.diffDays !== null && item.diffDays >= 0 && item.diffDays <= 30;
      }

      if (activeFilter === 'INSPECTION') {
        // TÜVTÜRK Muayenesi 30 gün veya daha az kalanlar ya da geçmiş olanlar
        return typeof item.inspectionDiffDays === 'number' && item.inspectionDiffDays <= 30;
      }

      return true;
    }).sort((a, b) => {
      // En acil olan en üstte (küçük diffDays en başta)
      if (activeFilter === 'INSPECTION') {
        return (a.inspectionDiffDays ?? 999) - (b.inspectionDiffDays ?? 999);
      }
      return (a.diffDays ?? 999) - (b.diffDays ?? 999);
    });
  }, [reminderItems, activeFilter, searchQuery]);

  // Sayaçlar
  const countDue15Days = reminderItems.filter((i) => i.diffDays !== null && i.diffDays >= 0 && i.diffDays <= 15).length;
  const countOverdue = reminderItems.filter((i) => i.diffDays !== null && i.diffDays < 0).length;
  const countThisMonth = reminderItems.filter((i) => i.diffDays !== null && i.diffDays >= 0 && i.diffDays <= 30).length;
  const countInspection = reminderItems.filter((i) => typeof i.inspectionDiffDays === 'number' && i.inspectionDiffDays <= 30).length;

  // WhatsApp Mesaj Oluşturucu
  const buildWhatsAppMessage = (item: ReminderItem, template: 'STANDARD' | 'SHORT' | 'INSPECTION') => {
    const custName = item.vehicle.customer?.fullName || 'Değerli Müşterimiz';
    const plate = item.vehicle.plate;
    const model = `${item.vehicle.brand} ${item.vehicle.model}`;
    const nextDate = item.nextDate ? formatDateOnly(item.nextDate) : 'Yakın Tarih';
    const nextKm = item.targetKm ? `${item.targetKm.toLocaleString()} KM` : '';

    if (template === 'INSPECTION') {
      const inspDate = item.vehicle.inspectionDate ? formatDateOnly(item.vehicle.inspectionDate) : nextDate;
      const daysText = (item.inspectionDiffDays ?? 0) < 0 
        ? `${Math.abs(item.inspectionDiffDays || 0)} gün önce dolmuştur`
        : `${item.inspectionDiffDays} gün sonra (${inspDate}) dolacaktır`;

      return `Sayın ${custName},\n\n${shop.name} olarak hatırlatmak isteriz: ${plate} plakalı ${model} aracınızın TÜVTÜRK Araç Muayene geçerlilik tarihi ${daysText}.\n\nMuayene öncesi fren testi, aydınlatma ve ön takım ekspertiz kontrolü için servisimizden randevu alabilirsiniz.\n\nİletişim & Randevu: ${shop.phone}\n${shop.name} - ${shop.district} / ${shop.city}`;
    }

    if (template === 'SHORT') {
      return `Sayın ${custName}, ${plate} plakalı ${model} aracınızın periyodik bakım zamanı yaklaşmıştır (${nextDate} / ${nextKm}). Güvenliğiniz için servisimize davetlisiniz. Randevu Tel: ${shop.phone} - ${shop.name}`;
    }

    // STANDARD
    const daysText = (item.diffDays ?? 0) < 0 
      ? `bakım tarihi ${Math.abs(item.diffDays || 0)} gün önce geçmiştir`
      : `bakım zamanına ${item.diffDays} gün kalmıştır (${nextDate})`;

    return `Sayın ${custName},\n\n${shop.name} servisimizden selamlar!\n\n${plate} plakalı ${model} aracınızın periyodik ${daysText}.\n\nSon Servis KM: ${item.lastKm.toLocaleString()} KM\nHedef Bakım: ${nextKm || nextDate}\n\nMotor ömrünü korumak, yakıt tasarrufu sağlamak ve güvenli sürüş için periyodik bakım randevunuzu şimdiden oluşturabilirsiniz.\n\n📞 Randevu & Danışma: ${shop.phone}\n📍 Adres: ${shop.address}\n${shop.name}`;
  };

  const handleSendWhatsApp = (item: ReminderItem) => {
    const phone = item.vehicle.customer?.phone;
    if (!phone) {
      alert('Bu müşterinin telefon numarası kayıtlı değil!');
      return;
    }

    const templateToUse = activeFilter === 'INSPECTION' ? 'INSPECTION' : selectedTemplate;
    const message = buildWhatsAppMessage(item, templateToUse);
    const url = generateWhatsAppLink(phone, message);

    window.open(url, '_blank');
    onShowToast(`[${item.vehicle.plate}] için WhatsApp mesajı hazırlandı ve açıldı!`);
  };

  return (
    <div className="space-y-6">
      
      {/* Başlık & Açıklama */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0c243f] flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-cyan-600 animate-bounce" />
            Müşteri Bakım & WhatsApp Hatırlatma Merkezi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Bakım zamanı 15 gün kalan araçları otomatik tespit edin, tek tıkla resmi WhatsApp üzerinden bildirim gönderin.
          </p>
        </div>

        {/* Şablon Seçici */}
        <div className="flex items-center gap-2 bg-white border border-slate-200/90 rounded-xl p-1 shadow-2xs self-start sm:self-auto">
          <Sparkles className="w-4 h-4 text-cyan-600 ml-2" />
          <span className="text-xs font-bold text-slate-600 hidden md:inline">Mesaj Şablonu:</span>
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value as any)}
            className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-2 py-1"
          >
            <option value="STANDARD">Standart Periyodik Bakım Şablonu</option>
            <option value="SHORT">Kısa SMS / WhatsApp Şablonu</option>
            <option value="INSPECTION">TÜVTÜRK Muayene Öncesi Kontrol</option>
          </select>
        </div>
      </div>

      {/* 4 Özet Sayaç Kartı */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 15 Gün Kalanlar (Acil) */}
        <div
          onClick={() => setActiveFilter('DUE_15_DAYS')}
          className={`rounded-2xl p-5 cursor-pointer transition-all border ${
            activeFilter === 'DUE_15_DAYS'
              ? 'bg-amber-500/10 border-amber-400 ring-2 ring-amber-400/40 shadow-md'
              : 'card-tech'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">15 Gün Kalanlar</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600">{countDue15Days}</span>
            <span className="text-xs text-slate-500 font-bold">araç bildirim bekliyor</span>
          </div>
          <p className="mt-2 text-xs text-amber-700 font-semibold flex items-center gap-1">
            WhatsApp ile hemen hatırlat <ArrowRight className="w-3 h-3" />
          </p>
        </div>

        {/* Günü Geçmiş Bakımlar */}
        <div
          onClick={() => setActiveFilter('OVERDUE')}
          className={`rounded-2xl p-5 cursor-pointer transition-all border ${
            activeFilter === 'OVERDUE'
              ? 'bg-rose-500/10 border-rose-400 ring-2 ring-rose-400/40 shadow-md'
              : 'card-tech'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Günü Geçmiş Bakımlar</span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-600">{countOverdue}</span>
            <span className="text-xs text-slate-500 font-bold">geciken araç</span>
          </div>
          <p className="mt-2 text-xs text-rose-700 font-semibold flex items-center gap-1">
            Gecikme uyarısı gönder <ArrowRight className="w-3 h-3" />
          </p>
        </div>

        {/* Bu Ay Beklenen Bakımlar */}
        <div
          onClick={() => setActiveFilter('THIS_MONTH')}
          className={`rounded-2xl p-5 cursor-pointer transition-all border ${
            activeFilter === 'THIS_MONTH'
              ? 'bg-cyan-500/10 border-cyan-400 ring-2 ring-cyan-400/40 shadow-md'
              : 'card-tech'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bu Ayki Bakımlar</span>
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#0c243f]">{countThisMonth}</span>
            <span className="text-xs text-slate-500 font-medium">araç bu ay planlı</span>
          </div>
          <p className="mt-2 text-xs text-cyan-700 font-semibold flex items-center gap-1">
            Tüm aylık listeyi incele <ArrowRight className="w-3 h-3" />
          </p>
        </div>

        {/* TÜVTÜRK Muayenesi Yaklaşanlar */}
        <div
          onClick={() => setActiveFilter('INSPECTION')}
          className={`rounded-2xl p-5 cursor-pointer transition-all border ${
            activeFilter === 'INSPECTION'
              ? 'bg-indigo-500/10 border-indigo-400 ring-2 ring-indigo-400/40 shadow-md'
              : 'card-tech'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">TÜVTÜRK Muayene</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-700">{countInspection}</span>
            <span className="text-xs text-slate-500 font-medium">muayenesi yaklaşan</span>
          </div>
          <p className="mt-2 text-xs text-indigo-700 font-semibold flex items-center gap-1">
            Ön kontrol teklifi gönder <ArrowRight className="w-3 h-3" />
          </p>
        </div>

      </div>

      {/* Arama ve Filtre Butonları */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3">
          
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Plaka, Müşteri Adı veya Telefon ile filtrele..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:bg-white transition-all"
            />
          </div>

          {/* Sekme Filtreleri */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveFilter('DUE_15_DAYS')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl shrink-0 transition-all cursor-pointer ${
                activeFilter === 'DUE_15_DAYS'
                  ? 'neon-tab-active'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-cyan-50 hover:text-cyan-700 border border-slate-200'
              }`}
            >
              15 Gün Kalanlar ({countDue15Days})
            </button>

            <button
              onClick={() => setActiveFilter('OVERDUE')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl shrink-0 transition-all cursor-pointer ${
                activeFilter === 'OVERDUE'
                  ? 'neon-tab-active'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-cyan-50 hover:text-cyan-700 border border-slate-200'
              }`}
            >
              Gecikenler ({countOverdue})
            </button>

            <button
              onClick={() => setActiveFilter('THIS_MONTH')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl shrink-0 transition-all cursor-pointer ${
                activeFilter === 'THIS_MONTH'
                  ? 'neon-tab-active'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-cyan-50 hover:text-cyan-700 border border-slate-200'
              }`}
            >
              Bu Ay ({countThisMonth})
            </button>

            <button
              onClick={() => setActiveFilter('INSPECTION')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl shrink-0 transition-all cursor-pointer ${
                activeFilter === 'INSPECTION'
                  ? 'neon-tab-active'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-cyan-50 hover:text-cyan-700 border border-slate-200'
              }`}
            >
              Muayene Yaklaşanlar ({countInspection})
            </button>

            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl shrink-0 transition-all cursor-pointer ${
                activeFilter === 'ALL'
                  ? 'neon-tab-active'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-cyan-50 hover:text-cyan-700 border border-slate-200'
              }`}
            >
              Tüm Kayıtlar ({reminderItems.length})
            </button>
          </div>

        </div>
      </div>

      {/* Hatırlatma Tablosu & Kartları */}
      {filteredItems.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Tebrikler! Bekleyen Hatırlatma Bulunmuyor</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Seçilen filtre kriterinde bildirime ihtiyaç duyan araç bulunmuyor veya tüm müşterileriniz zamanında bilgilendirilmiş.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs divide-y divide-slate-100">
          
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Hatırlatma Bekleyen Araçlar ({filteredItems.length})</span>
            <span className="text-[11px] text-emerald-700 lowercase font-semibold hidden sm:inline">
              ✓ Tek tıkla doğrudan WhatsApp'a aktarılır
            </span>
          </div>

          {filteredItems.map((item) => {
            const hasPhone = Boolean(item.vehicle.customer?.phone);
            const isInspectionMode = activeFilter === 'INSPECTION';

            // Kalan gün metni ve rengi
            const daysLeft = isInspectionMode ? item.inspectionDiffDays : item.diffDays;
            
            let badgeBg = 'bg-slate-100 text-slate-700 border-slate-200';
            let badgeText = 'Tarih Belirtilmemiş';

            if (daysLeft !== null && daysLeft !== undefined) {
              if (daysLeft < 0) {
                badgeBg = 'bg-rose-100 text-rose-800 border-rose-300';
                badgeText = `${Math.abs(daysLeft)} Gün Gecikti!`;
              } else if (daysLeft <= 5) {
                badgeBg = 'bg-rose-50 text-rose-700 border-rose-200 font-black animate-pulse';
                badgeText = `${daysLeft} Gün Kaldı (Acil)`;
              } else if (daysLeft <= 15) {
                badgeBg = 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
                badgeText = `${daysLeft} Gün Kaldı`;
              } else {
                badgeBg = 'bg-cyan-50 text-cyan-800 border-cyan-200';
                badgeText = `${daysLeft} Gün Kaldı`;
              }
            }

            return (
              <div
                key={item.vehicle.id}
                className="p-4 sm:p-5 hover:bg-cyan-50/30 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* 1. Sol: Plaka, Araç & Kalan Gün Rozeti */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  {/* TR Plaka */}
                  <div className="relative inline-flex items-center bg-white text-slate-950 border border-slate-300 rounded-lg px-2.5 py-1 font-mono font-black text-sm tracking-wider shadow-2xs shrink-0">
                    <span className="w-4 text-center bg-[#0c243f] text-cyan-300 text-[8px] font-bold py-0.5 px-0.5 rounded-2xs mr-1.5 -ml-1">TR</span>
                    {item.vehicle.plate}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900 truncate">
                        {item.vehicle.brand} {item.vehicle.model}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] border shadow-2xs ${badgeBg}`}>
                        {badgeText}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {item.vehicle.customer?.fullName || 'Müşteri Belirtilmedi'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {item.vehicle.customer?.phone || 'Tel Yok'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Orta: Bakım & KM Bilgisi */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 shrink-0">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Son Servis KM</span>
                    <span className="font-bold font-mono text-slate-800">
                      {item.lastKm.toLocaleString()} KM
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Hedef Bakım Tarihi</span>
                    <span className="font-bold text-cyan-700">
                      {item.nextDate ? formatDateOnly(item.nextDate) : '-'}
                    </span>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-slate-400 block text-[10px]">TÜVTÜRK Muayene</span>
                    <span className="font-bold text-indigo-700">
                      {item.vehicle.inspectionDate ? formatDateOnly(item.vehicle.inspectionDate) : 'Girilmedi'}
                    </span>
                  </div>
                </div>

                {/* 3. Sağ: Aksiyon Butonları (WhatsApp & İş Emri Aç & Karnesi) */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  
                  {/* Bakım Karnesini Gör */}
                  <button
                    onClick={() => onOpenHistoryModal(item.vehicle)}
                    className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    title="Aracın Tüm Servis Geçmişi ve Bakım Karnesini Aç"
                  >
                    Karnesi
                  </button>

                  {/* Yeni İş Emri Aç */}
                  <button
                    onClick={() => onOpenNewOrderForVehicle(item.vehicle)}
                    className="px-3 py-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-xs font-bold rounded-xl border border-cyan-200 transition-colors cursor-pointer"
                    title="Bu aracı doğrudan servise kabul et"
                  >
                    + Servise Al
                  </button>

                  {/* Yeşil WhatsApp Butonu */}
                  <button
                    onClick={() => handleSendWhatsApp(item)}
                    disabled={!hasPhone}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer ${
                      hasPhone
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-700/20 hover:scale-[1.02] active:scale-[0.98]'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                    title={hasPhone ? "WhatsApp Web/Uygulaması ile mesaj penceresini aç" : "Telefon numarası eksik"}
                  >
                    <MessageSquare className="w-3.5 h-3.5 fill-current" />
                    <span>WhatsApp ile Hatırlat</span>
                    <ExternalLink className="w-3 h-3 opacity-80" />
                  </button>

                </div>

              </div>
            );
          })}

        </div>
      )}

      {/* Bilgilendirme Kutusu */}
      <div className="bg-gradient-to-r from-cyan-900/10 via-sky-900/5 to-transparent border border-cyan-500/20 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 space-y-1">
          <p className="font-bold text-[#0c243f]">
            Nasıl Çalışır?
          </p>
          <p>
            Her bir araç için son iş emrindeki <strong>"Bir Sonraki Bakım Hedef Tarihi"</strong> (veya 1 yıl/10.000 KM kuralı) esas alınır. Bakım tarihine <strong>15 gün kalan araçlar</strong> otomatik olarak acil listesine alınır. Yeşil <strong>"WhatsApp ile Hatırlat"</strong> butonuna bastığınızda, müşterinin telefonuna özel hazırlanmış mesaj resmi WhatsApp uygulamasında anında açılarak tek tıkla gönderilmeye hazır hale gelir.
          </p>
        </div>
      </div>

    </div>
  );
}
