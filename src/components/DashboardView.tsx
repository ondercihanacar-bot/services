'use client';

import React from 'react';
import { Part } from '@/types/index';
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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
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
          className="bg-white border border-slate-200 hover:border-blue-400 rounded-xl p-5 cursor-pointer transition-all duration-200 group shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lifteki Araçlar</span>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{stats.activeInService}</span>
            <span className="text-xs text-blue-600 font-semibold">aktif bakım/tamir</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 flex items-center gap-1 group-hover:text-blue-600 transition-colors">
            Tüm iş emirlerini gör <ArrowRight className="w-3 h-3" />
          </p>
        </div>

        {/* Kritik Stok Uyarısı */}
        <div
          onClick={() => onNavigateToTab('inventory')}
          className={`border rounded-xl p-5 cursor-pointer transition-all duration-200 group shadow-sm hover:shadow-md ${
            stats.lowStockCount > 0
              ? 'bg-rose-50/40 border-rose-200 hover:border-rose-400'
              : 'bg-white border-slate-200 hover:border-blue-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kritik Stok Uyarısı</span>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${
              stats.lowStockCount > 0 ? 'bg-rose-100 text-rose-600' : 'bg-blue-50 text-blue-600'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-black ${stats.lowStockCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
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
          className="bg-white border border-slate-200 hover:border-emerald-400 rounded-xl p-5 cursor-pointer transition-all duration-200 group shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Teslime Hazır</span>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
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
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tahsil Edilen Ciro</span>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{formatCurrency(stats.totalRevenue)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs pt-1 border-t border-slate-100">
            <span className="text-slate-500">Bekleyen Alacak (Cari):</span>
            <span className="font-bold text-blue-700">{formatCurrency(stats.pendingReceivables)}</span>
          </div>
        </div>

      </div>

      {/* İki Sütunlu Canlı Tablo Bölümü */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sol 2 Sütun: Servisteki Araçlar & Durumları */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></div>
              <h2 className="text-base font-bold text-slate-900">Servisteki ve Lifteki Araçlar</h2>
            </div>
            <button
              onClick={onOpenNewOrder}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
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
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-blue-50/40 p-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {/* TR Plaka Kutusu */}
                      <div className="relative inline-flex items-center bg-white text-slate-950 border-2 border-slate-400 rounded px-2 py-0.5 font-mono font-black text-sm tracking-wider shadow-sm shrink-0">
                        <span className="w-4 text-center bg-blue-600 text-white text-[8px] font-bold py-0.5 px-0.5 rounded-sm mr-1.5 -ml-1">TR</span>
                        {order.vehicle?.plate || 'PLAKA YOK'}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">
                            {order.vehicle ? `${order.vehicle.brand} ${order.vehicle.model}` : 'Bilinmeyen Araç'}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">({order.vehicle?.currentKm?.toLocaleString()} KM)</span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          <span className="text-slate-400">Müşteri:</span> {order.customer?.fullName} • <span className="text-slate-400">Şikayet:</span> {order.customerComplaint}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <div className="text-right">
                        <span className={`inline-block px-2.5 py-1 text-[11px] font-bold rounded-md border ${statusMeta.bg} ${statusMeta.color} ${statusMeta.border}`}>
                          {statusMeta.label}
                        </span>
                        <div className="text-xs font-bold text-slate-800 mt-1 font-mono">
                          {formatCurrency(order.grandTotal)}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 hidden sm:block" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sağ Sütun: Acil Sipariş Verilmesi Gereken Kritik Stoklar */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <h2 className="text-base font-bold text-slate-900">Kritik Stok Uyarısı</h2>
            </div>
            <button
              onClick={() => onNavigateToTab('inventory')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
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
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-bold text-blue-700 bg-blue-100/60 px-1.5 py-0.5 rounded">
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
                      className="block mt-1.5 text-[11px] font-bold text-blue-600 hover:text-blue-700 underline"
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
              className="w-full py-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-xs font-bold text-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Package className="w-3.5 h-3.5 text-blue-600" />
              Yedek Parça Stoğunu Yönet
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
