'use client';

import React, { useState } from 'react';
import { EnrichedServiceOrder } from '@/lib/db';
import { Shop } from '@/types/index';
import {
  formatCurrency,
  formatDate,
  generateAccountStatementWhatsAppMessage,
  generateWhatsAppLink
} from '@/lib/utils';
import {
  Wallet,
  Search,
  Filter,
  CreditCard,
  Building,
  User,
  Car,
  MessageCircle,
  CheckCircle2,
  DollarSign,
  Printer,
  ChevronRight,
  Send,
  X,
  BadgeAlert
} from 'lucide-react';

interface AccountsViewProps {
  orders: EnrichedServiceOrder[];
  shop: Shop;
  onUpdatePayment: (
    orderId: string,
    paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID',
    paidAmount: number
  ) => Promise<void>;
  onSelectOrderForPrint: (order: EnrichedServiceOrder) => void;
}

export default function AccountsView({
  orders,
  shop,
  onUpdatePayment,
  onSelectOrderForPrint
}: AccountsViewProps) {
  const [filterType, setFilterType] = useState<'OPEN' | 'ALL' | 'FLEET' | 'SETTLED'>('OPEN');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Hızlı Tahsilat Modalı State
  const [collectingOrder, setCollectingOrder] = useState<(EnrichedServiceOrder & { remainingAmount: number }) | null>(null);
  const [collectAmount, setCollectAmount] = useState<number>(0);
  const [collectMethod, setCollectMethod] = useState<'NAKIT' | 'KREDI_KARTI' | 'HAVALE_EFT'>('NAKIT');
  const [savingPayment, setSavingPayment] = useState(false);

  // Filtrelenmiş ve hesaplanmış kayıtlar
  const processedOrders = orders.map((o) => {
    const remaining = Math.max(0, o.grandTotal - (o.paidAmount || 0));
    const isFleet = Boolean(
      o.customer?.notes?.toLowerCase().includes('filo') ||
      o.customer?.fullName.toLowerCase().includes('lojistik') ||
      o.customer?.fullName.toLowerCase().includes('ltd') ||
      o.customer?.fullName.toLowerCase().includes('a.ş')
    );
    return {
      ...o,
      remainingAmount: remaining,
      isFleet
    };
  });

  const filteredOrders = processedOrders.filter((order) => {
    if (filterType === 'OPEN' && order.remainingAmount <= 0) return false;
    if (filterType === 'SETTLED' && order.remainingAmount > 0) return false;
    if (filterType === 'FLEET' && !order.isFleet) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().replace(/\s+/g, '');
      const plate = order.vehicle?.plate.toLowerCase().replace(/\s+/g, '') || '';
      const customer = order.customer?.fullName.toLowerCase() || '';
      const phone = order.customer?.phone || '';
      const orderNo = order.orderNo.toLowerCase();
      return plate.includes(q) || customer.includes(q) || phone.includes(q) || orderNo.includes(q);
    }
    return true;
  });

  // KPI Metrikleri
  const totalReceivables = processedOrders.reduce((acc, o) => acc + o.remainingAmount, 0);
  const totalCollected = processedOrders.reduce((acc, o) => acc + (o.paidAmount || 0), 0);
  const openAccountsCount = processedOrders.filter((o) => o.remainingAmount > 0).length;
  const fleetDebt = processedOrders.filter((o) => o.isFleet).reduce((acc, o) => acc + o.remainingAmount, 0);

  // WhatsApp Mesajı Gönder (IBAN & Bakiye Özeti)
  const handleSendStatementWhatsApp = (order: typeof processedOrders[0]) => {
    if (!order.customer?.phone) {
      alert('Müşteri telefon numarası bulunamadı!');
      return;
    }

    const message = generateAccountStatementWhatsAppMessage({
      customerName: order.customer.fullName,
      totalDebt: order.remainingAmount,
      plateList: [order.vehicle?.plate || 'Kayıtlı Araç'],
      shopName: shop.name,
      shopIban: shop.iban,
      bankName: shop.bankName,
      accountHolder: shop.accountHolder,
      shopPhone: shop.phone
    });

    const link = generateWhatsAppLink(order.customer.phone, message);
    window.open(link, '_blank');
  };

  // Tahsilat Modalını Aç
  const openCollectModal = (order: typeof processedOrders[0]) => {
    setCollectingOrder(order);
    setCollectAmount(order.remainingAmount);
  };

  // Tahsilatı Kaydet
  const handleConfirmCollection = async () => {
    if (!collectingOrder) return;
    setSavingPayment(true);
    try {
      const newPaidAmount = (collectingOrder.paidAmount || 0) + Number(collectAmount);
      const newStatus = newPaidAmount >= collectingOrder.grandTotal ? 'PAID' : 'PARTIAL';
      await onUpdatePayment(collectingOrder.id, newStatus, newPaidAmount);
      setCollectingOrder(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingPayment(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Üst Başlık & Açıklama */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-cyan-600" />
            Cari & Açık Hesap (Borç / Alacak) Takibi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Sanayi veresiye hesapları, filo alacakları, ödenen tutarlar ve tek tıkla WhatsApp IBAN hatırlatması.
          </p>
        </div>

        {/* Servis IBAN Kartı */}
        {shop.iban && (
          <div className="bg-slate-900 text-white px-3.5 py-2 rounded-xl text-xs flex items-center gap-3 border border-cyan-500/30 shadow-sm shrink-0">
            <CreditCard className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="text-[10px] text-slate-400 block leading-tight">Servis Aktif IBAN:</span>
              <span className="font-mono font-bold text-cyan-300">{shop.iban}</span>
            </div>
          </div>
        )}
      </div>

      {/* Finansal KPI Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Toplam Alacak / Açık Bakiye */}
        <div className="bg-gradient-to-br from-rose-50 to-white border border-rose-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Toplam Açık Alacak</span>
            <div className="p-2 bg-rose-100 rounded-xl text-rose-600">
              <BadgeAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-800 font-mono mt-2">
            {formatCurrency(totalReceivables)}
          </div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">
            {openAccountsCount} araç / müşteride bekleyen bakiye
          </div>
        </div>

        {/* 2. Toplam Tahsil Edilen */}
        <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Toplam Tahsilat</span>
            <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-800 font-mono mt-2">
            {formatCurrency(totalCollected)}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            Kasa / Bankaya giren tutar
          </div>
        </div>

        {/* 3. Filo & Şirket Alacakları */}
        <div className="bg-gradient-to-br from-cyan-50 to-white border border-cyan-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-800 uppercase tracking-wider">Filo & Şirket Borçları</span>
            <div className="p-2 bg-cyan-100 rounded-xl text-cyan-700">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-cyan-900 font-mono mt-2">
            {formatCurrency(fleetDebt)}
          </div>
          <div className="text-[11px] text-cyan-700 font-medium mt-1">
            Kurumsal açık hesaplar
          </div>
        </div>

        {/* 4. Borçlu Hesap Sayısı */}
        <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Açık Hesap Sayısı</span>
            <div className="p-2 bg-slate-100 rounded-xl text-slate-600">
              <User className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-800 font-mono mt-2">
            {openAccountsCount} <span className="text-xs font-normal text-slate-500">Müşteri</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Geri ödeme beklenen kayıt
          </div>
        </div>

      </div>

      {/* Arama ve Filtreleme */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          
          {/* Arama Input */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Müşteri, Telefon veya Plaka ile cari ara..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all"
            />
          </div>

          {/* Filtre Sekmeleri */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-0.5">
            <button
              onClick={() => setFilterType('OPEN')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterType === 'OPEN'
                  ? 'btn-tech-active-tab'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Borcu Olanlar ({processedOrders.filter((o) => o.remainingAmount > 0).length})
            </button>

            <button
              onClick={() => setFilterType('FLEET')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterType === 'FLEET'
                  ? 'btn-tech-active-tab'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Filo / Şirketler
            </button>

            <button
              onClick={() => setFilterType('SETTLED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterType === 'SETTLED'
                  ? 'btn-tech-active-tab'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Kapanan Hesaplar
            </button>

            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterType === 'ALL'
                  ? 'btn-tech-active-tab'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tüm Kayıtlar
            </button>
          </div>

        </div>
      </div>

      {/* Cari Hesap Tablosu */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Borç Kaydı Bulunmuyor</h3>
            <p className="text-xs text-slate-500">
              Seçilen filtre kriterlerine uyan açık hesap bulunmamaktadır.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Müşteri / Cari</th>
                  <th className="py-3 px-4">Araç (Plaka)</th>
                  <th className="py-3 px-4">İş Emri & Tarih</th>
                  <th className="py-3 px-4 text-right">Toplam Tutar</th>
                  <th className="py-3 px-4 text-right">Tahsil Edilen</th>
                  <th className="py-3 px-4 text-right">Kalan Borç</th>
                  <th className="py-3 px-4 text-center">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => {
                  const hasDebt = order.remainingAmount > 0;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Müşteri Adı & Telefon */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          {order.isFleet && (
                            <span className="p-1 bg-cyan-100 text-cyan-800 rounded text-[9px] font-black uppercase">
                              Filo
                            </span>
                          )}
                          <span>{order.customer?.fullName || 'Bilinmiyor'}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {order.customer?.phone || '-'}
                        </div>
                      </td>

                      {/* Araç Plaka & Model */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center bg-white text-slate-950 border border-slate-300 rounded px-2 py-0.5 font-mono font-black text-xs shadow-2xs">
                          <span className="bg-[#0c243f] text-cyan-300 text-[8px] font-bold px-1 rounded-2xs mr-1">TR</span>
                          {order.vehicle?.plate}
                        </div>
                        <div className="text-[11px] text-slate-600 truncate max-w-[150px] mt-0.5">
                          {order.vehicle?.brand} {order.vehicle?.model}
                        </div>
                      </td>

                      {/* İş Emri & Tarih */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-100">
                          {order.orderNo}
                        </span>
                        <div className="text-[11px] text-slate-400 mt-1">
                          {formatDate(order.entryDate)}
                        </div>
                      </td>

                      {/* Toplam Tutar */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-700">
                        {formatCurrency(order.grandTotal)}
                      </td>

                      {/* Tahsil Edilen */}
                      <td className="py-3.5 px-4 text-right font-mono text-emerald-700 font-semibold">
                        {formatCurrency(order.paidAmount || 0)}
                      </td>

                      {/* Kalan Borç (Vurgulu) */}
                      <td className="py-3.5 px-4 text-right font-mono">
                        {hasDebt ? (
                          <span className="inline-block px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 font-black rounded-lg text-xs shadow-2xs">
                            {formatCurrency(order.remainingAmount)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Kapandı
                          </span>
                        )}
                      </td>

                      {/* Aksiyon Butonları */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Tahsilat Al */}
                          {hasDebt && (
                            <button
                              onClick={() => openCollectModal(order)}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                              title="Ödeme Tahsilatı Ekle"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                              <span>Tahsil Et</span>
                            </button>
                          )}

                          {/* WhatsApp IBAN & Bakiye Hatırlat */}
                          {hasDebt && (
                            <button
                              onClick={() => handleSendStatementWhatsApp(order)}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg transition-colors cursor-pointer"
                              title="Müşteriye WhatsApp'tan IBAN ve Borç Bakiyesi Gönder"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* Servis Fişi / Ekstre */}
                          <button
                            onClick={() => onSelectOrderForPrint(order)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                            title="Resmi Servis Formunu / Hesabı Yazdır"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Hızlı Tahsilat Modalı */}
      {collectingOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Tahsilat Kaydı Ekle</h3>
                  <span className="text-xs text-slate-500">
                    {collectingOrder.customer?.fullName} • {collectingOrder.vehicle?.plate}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setCollectingOrder(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl flex justify-between items-center">
                <span className="text-slate-500 font-medium">Kalan Açık Borç Tutarı:</span>
                <span className="font-mono font-black text-rose-600 text-sm">
                  {formatCurrency(collectingOrder.remainingAmount)}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tahsil Edilen Tutar (TL):</label>
                <input
                  type="number"
                  min="1"
                  max={collectingOrder.remainingAmount}
                  value={collectAmount}
                  onChange={(e) => setCollectAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ödeme Yöntemi:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCollectMethod('NAKIT')}
                    className={`py-2 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                      collectMethod === 'NAKIT'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Nakit
                  </button>
                  <button
                    type="button"
                    onClick={() => setCollectMethod('KREDI_KARTI')}
                    className={`py-2 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                      collectMethod === 'KREDI_KARTI'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Kredi Kartı
                  </button>
                  <button
                    type="button"
                    onClick={() => setCollectMethod('HAVALE_EFT')}
                    className={`py-2 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                      collectMethod === 'HAVALE_EFT'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Havale / EFT
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCollectingOrder(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleConfirmCollection}
                disabled={savingPayment || collectAmount <= 0}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Tahsilatı Onayla</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
