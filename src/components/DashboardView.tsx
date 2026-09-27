'use client';

import React from 'react';
import { Part } from '@/types/index';
import { EnrichedServiceOrder } from '@/lib/db';
import { formatCurrency, STATUS_LABELS } from '@/lib/utils';
import {
  AlertTriangle,
  CheckCircle2,
  Car,
  Package,
  ArrowRight,
  TrendingUp,
  MapPin,
  Plus,
  Bell,
  MessageSquare
} from 'lucide-react';

interface DashboardStats {
  activeInService: number;
  readyForDelivery: number;
  completedCount: number;
  totalVehicles: number;
  totalParts: number;
  lowStockCount: number;
  lowStockParts: Part[];
  totalRevenue: number;
  pendingReceivables: number;
}

interface DashboardViewProps {
  stats: DashboardStats | null;
  recentOrders: EnrichedServiceOrder[];
  onOpenOrder: (order: EnrichedServiceOrder) => void;
  onOpenNewOrder: () => void;
  onNavigateToTab: (tab: 'orders' | 'inventory' | 'vehicles' | 'reminders' | 'reports') => void;
  onOpenQuickStock: (part: Part) => void;
}

export default function DashboardView({
  stats,
  recentOrders,
  onOpenOrder,
  onOpenNewOrder,
  onNavigateToTab,
  onOpenQuickStock
}: DashboardViewProps) {
  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 4 Özet İstatistik Kartı */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Lifteki / Servisteki Araçlar */}
        <div
          onClick={() => onNavigateToTab('orders')}
          className="card-tech rounded-2xl p-5 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lifteki Araçlar</span>
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center group-hover:scale-105 group-hover:bg-[#0c243f] group-hover:text-cyan-300 transition-all shadow-xs">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#0c243f]">{stats.activeInService}</span>
            <span className="text-xs text-cyan-700 font-bold">aktif işlemde</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 flex items-center gap-1 group-hover:text-cyan-700 transition-colors">
            Tüm iş emirlerini gör <ArrowRight className="w-3 h-3" />
          </p>
        </div>

        {/* Kritik Stok Uyarısı */}
        <div
          onClick={() => onNavigateToTab('inventory')}
          className={`rounded-2xl p-5 cursor-pointer transition-all duration-200 group border ${
            stats.lowStockCount > 0
              ? 'bg-rose-50/50 border-rose-200 hover:border-rose-400 shadow-xs hover:shadow-md'
              : 'card-tech'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kritik Stok Uyarısı</span>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-all shadow-xs ${
              stats.lowStockCount > 0 ? 'bg-rose-100 text-rose-600' : 'bg-cyan-50 text-cyan-700'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-black ${stats.lowStockCount > 0 ? 'text-rose-600' : 'text-[#0c243f]'}`}>
              {stats.lowStockCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">parça sınırın altında</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 flex items-center gap-1 group-hover:text-rose-600 transition-colors">
            Stok dökümünü incele <ArrowRight className="w-3 h-3" />
          </p>
        </div>

        {/* Hazır Araçlar (Müşteri Teslimi) */}
        <div
          onClick={() => onNavigateToTab('orders')}
          className="card-tech rounded-2xl p-5 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Teslime Hazır</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">{stats.readyForDelivery}</span>
            <span className="text-xs text-slate-500 font-medium">araç teslim bekliyor</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 flex items-center gap-1 group-hover:text-emerald-600 transition-colors">
            Müşterileri ara / fiş yazdır <ArrowRight className="w-3 h-3" />
          </p>
        </div>

        {/* Finansal Özet / Kasa */}
        <div className="card-tech rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tahsil Edilen Ciro</span>
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0c243f]">{formatCurrency(stats.totalRevenue)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs pt-1 border-t border-slate-100">
            <span className="text-slate-500">Bekleyen Alacak (Cari):</span>
            <span className="font-bold text-cyan-800">{formatCurrency(stats.pendingReceivables)}</span>
          </div>
        </div>

      </div>

      {/* WhatsApp Bakım Hatırlatma Bildirim Banner'ı */}
      <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-cyan-500/10 border border-amber-400/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0c243f] flex items-center gap-2">
              WhatsApp Bakım & Muayene Hatırlatma Merkezi
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                15 Gün Kalanlar
              </span>
            </h3>
            <p className="text-xs text-slate-600">
              Bakım süresi veya TÜVTÜRK muayenesi yaklaşan müşterilerinize tek tıkla doğrudan resmi WhatsApp mesajı gönderebilirsiniz.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateToTab('reminders')}
          className="self-start sm:self-auto px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <span>Hatırlatmaları İncele</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* İki Sütunlu Canlı Tablo Bölümü */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sol 2 Sütun: Servisteki Araçlar & Durumları */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
              <h2 className="text-base font-bold text-[#0c243f]">Servisteki ve Lifteki Araçlar</h2>
            </div>
            <button
              onClick={onOpenNewOrder}
              className="text-xs font-bold text-cyan-700 hover:text-cyan-800 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Yeni Araç Kabul
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              Şu an serviste bekleyen veya işlem gören araç bulunmuyor.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentOrders.map((order) => {
                const statusMeta = STATUS_LABELS[order.status] || STATUS_LABELS.PENDING;
                return (
                  <div
                    key={order.id}
                    onClick={() => onOpenOrder(order)}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-cyan-50/40 p-2.5 rounded-xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      {/* TR Plaka Kutusu */}
                      <div className="relative inline-flex items-center bg-white text-slate-950 border border-slate-300 rounded-lg px-2 py-0.5 font-mono font-black text-sm tracking-wider shadow-2xs shrink-0 group-hover:border-cyan-500">
                        <span className="w-4 text-center bg-[#0c243f] text-cyan-300 text-[8px] font-bold py-0.5 px-0.5 rounded-2xs mr-1.5 -ml-1">TR</span>
                        {order.vehicle?.plate || 'PLAKA YOK'}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 group-hover:text-cyan-700 transition-colors">
                            {order.vehicle ? `${order.vehicle.brand} ${order.vehicle.model}` : 'Bilinmeyen Araç'}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">({order.vehicle?.currentKm?.toLocaleString()} KM)</span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          <span className="text-slate-400">Müşteri:</span> {order.customer?.fullName} • <span className="text-slate-400">Talep:</span> {order.customerComplaint}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <div className="text-right">
                        <span className={`inline-block px-2.5 py-1 text-[11px] font-bold rounded-lg border ${statusMeta.bg} ${statusMeta.color} ${statusMeta.border}`}>
                          {statusMeta.label}
                        </span>
                        <div className="text-xs font-bold text-slate-800 mt-1 font-mono">
                          {formatCurrency(order.grandTotal)}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-0.5 transition-all hidden sm:block" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sağ Sütun: Acil Sipariş Verilmesi Gereken Kritik Stoklar */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <h2 className="text-base font-bold text-[#0c243f]">Kritik Stok Uyarısı</h2>
            </div>
            <button
              onClick={() => onNavigateToTab('inventory')}
              className="text-xs font-bold text-cyan-700 hover:text-cyan-800 transition-colors cursor-pointer"
            >
              Tüm Depo
            </button>
          </div>

          {stats.lowStockParts.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm flex-1 flex flex-col items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
              <p>Tüm parçaların stok seviyesi güvenli seviyede.</p>
            </div>
          ) : (
            <div className="space-y-3 flex-1">
              {stats.lowStockParts.map((part) => (
                <div
                  key={part.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2 hover:border-cyan-300 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-bold text-cyan-800 bg-cyan-50 border border-cyan-200 px-1.5 py-0.5 rounded-md">
                        {part.code}
                      </span>
                      <span className="text-xs font-bold text-slate-800 truncate">{part.brand}</span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium truncate mt-1">{part.name}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {part.shelfLocation || 'Konum Yok'}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-block px-2 py-0.5 bg-rose-100 text-rose-700 font-bold text-xs rounded border border-rose-200">
                      Kalan: {part.stockQuantity} {part.unit}
                    </span>
                    <button
                      onClick={() => onOpenQuickStock(part)}
                      className="block mt-1.5 text-[11px] font-bold text-cyan-700 hover:text-cyan-800 underline cursor-pointer"
                    >
                      + Hızlı Stok Ekle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <button
              onClick={() => onNavigateToTab('inventory')}
              className="w-full py-2.5 btn-tech-secondary rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Package className="w-3.5 h-3.5 text-cyan-600" />
              Parça Stoğunu Yönet
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
