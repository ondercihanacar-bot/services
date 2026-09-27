'use client';

import React from 'react';
import { Part } from '@/types';
import { EnrichedServiceOrder } from '@/lib/db';
import { formatCurrency, STATUS_LABELS } from '@/lib/utils';
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Car,
  Package,
  ArrowRight,
  TrendingUp,
  MapPin,
  Plus
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
  onNavigateToTab: (tab: 'orders' | 'inventory' | 'vehicles') => void;
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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
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
          className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-xl p-5 cursor-pointer transition-all duration-200 group shadow-sm hover:shadow-blue-500/5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lifteki Araçlar</span>
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{stats.activeInService}</span>
            <span className="text-xs text-blue-400 font-medium">aktif tamir / bakım</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 flex items-center gap-1 group-hover:text-blue-400 transition-colors">
            Tüm iş emirlerini gör <ArrowRight className="w-3 h-3" />
          </p>
        </div>

        {/* Kritik Stok Uyarısı */}
        <div
          onClick={() => onNavigateToTab('inventory')}
          className={`border rounded-xl p-5 cursor-pointer transition-all duration-200 group shadow-sm ${
            stats.lowStockCount > 0
              ? 'bg-rose-950/20 border-rose-900/60 hover:border-rose-500/80 shadow-rose-500/5'
              : 'bg-slate-900 border-slate-800 hover:border-amber-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kritik Stok Uyarısı</span>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${
              stats.lowStockCount > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/10 text-amber-400'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-black ${stats.lowStockCount > 0 ? 'text-rose-400' : 'text-white'}`}>
              {stats.lowStockCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">parça sınırın altında!</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 flex items-center gap-1 group-hover:text-amber-400 transition-colors">
            Stok dökümünü incele <ArrowRight className="w-3 h-3" />
          </p>
        </div>

        {/* Hazır Araçlar (Müşteri Teslimi) */}
        <div
          onClick={() => onNavigateToTab('orders')}
          className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-5 cursor-pointer transition-all duration-200 group shadow-sm hover:shadow-emerald-500/5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Teslime Hazır</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">{stats.readyForDelivery}</span>
            <span className="text-xs text-slate-400 font-medium">araç teslim bekliyor</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 flex items-center gap-1 group-hover:text-emerald-400 transition-colors">
            Müşterileri ara / fiş yazdır <ArrowRight className="w-3 h-3" />
          </p>
        </div>

        {/* Finansal Özet / Kasa */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tahsil Edilen Ciro</span>
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{formatCurrency(stats.totalRevenue)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-500">Bekleyen Alacak (Cari):</span>
            <span className="font-semibold text-amber-400">{formatCurrency(stats.pendingReceivables)}</span>
          </div>
        </div>

      </div>

      {/* İki Sütunlu Canlı Tablo Bölümü */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sol 2 Sütun: Servisteki Araçlar & Durumları */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
              <h2 className="text-base font-bold text-white">Servisteki ve Lifteki Araçlar</h2>
            </div>
            <button
              onClick={onOpenNewOrder}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Yeni Araç Kabul
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              Şu an serviste bekleyen veya işlem gören araç bulunmuyor.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {recentOrders.map((order) => {
                const statusMeta = STATUS_LABELS[order.status] || STATUS_LABELS.PENDING;
                return (
                  <div
                    key={order.id}
                    onClick={() => onOpenOrder(order)}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 p-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {/* TR Plaka Kutusu */}
                      <div className="relative inline-flex items-center bg-white text-slate-950 border-2 border-slate-400 rounded px-2 py-0.5 font-mono font-black text-sm tracking-wider shadow-sm shrink-0">
                        <span className="w-4 text-center bg-blue-700 text-white text-[8px] font-bold py-0.5 px-0.5 rounded-sm mr-1.5 -ml-1">TR</span>
                        {order.vehicle?.plate || 'PLAKA YOK'}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-200">
                            {order.vehicle ? `${order.vehicle.brand} ${order.vehicle.model}` : 'Bilinmeyen Araç'}
                          </span>
                          <span className="text-xs text-slate-500">({order.vehicle?.currentKm?.toLocaleString()} KM)</span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                          <span className="text-slate-500">Müşteri:</span> {order.customer?.fullName} • <span className="text-slate-500">Şikayet:</span> {order.customerComplaint}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <div className="text-right">
                        <span className={`inline-block px-2.5 py-1 text-[11px] font-bold rounded-md border ${statusMeta.bg} ${statusMeta.color} ${statusMeta.border}`}>
                          {statusMeta.label}
                        </span>
                        <div className="text-xs font-medium text-slate-300 mt-1">
                          {formatCurrency(order.grandTotal)}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 hidden sm:block" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sağ Sütun: Acil Sipariş Verilmesi Gereken Kritik Stoklar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <h2 className="text-base font-bold text-white">Kritik Stok Uyarısı</h2>
            </div>
            <button
              onClick={() => onNavigateToTab('inventory')}
              className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Tüm Depo
            </button>
          </div>

          {stats.lowStockParts.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm flex-1 flex flex-col items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mb-2" />
              <p>Tüm parçaların stok seviyesi güvenli seviyede.</p>
            </div>
          ) : (
            <div className="space-y-3 flex-1">
              {stats.lowStockParts.map((part) => (
                <div
                  key={part.id}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                        {part.code}
                      </span>
                      <span className="text-xs font-semibold text-slate-200 truncate">{part.brand}</span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium truncate mt-1">{part.name}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {part.shelfLocation || 'Konum Yok'}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-block px-2 py-0.5 bg-rose-500/20 text-rose-300 font-bold text-xs rounded border border-rose-500/30">
                      Kalan: {part.stockQuantity} {part.unit}
                    </span>
                    <button
                      onClick={() => onOpenQuickStock(part)}
                      className="block mt-1.5 text-[11px] font-semibold text-blue-400 hover:text-blue-300 underline"
                    >
                      + Hızlı Stok Ekle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-800 text-center">
            <button
              onClick={() => onNavigateToTab('inventory')}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <Package className="w-3.5 h-3.5 text-amber-400" />
              Yedek Parça Stoğunu Yönet
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
