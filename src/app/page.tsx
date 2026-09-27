'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Shop, Part, Vehicle, Customer, ServiceStatus } from '@/types';
import { EnrichedServiceOrder } from '@/lib/db';
import Header from '@/components/Header';
import DashboardView from '@/components/DashboardView';
import OrdersView from '@/components/OrdersView';
import InventoryView from '@/components/InventoryView';
import VehiclesView from '@/components/VehiclesView';
import NewOrderModal from '@/components/NewOrderModal';
import NewPartModal from '@/components/NewPartModal';
import NewVehicleModal from '@/components/NewVehicleModal';
import NewShopModal from '@/components/NewShopModal';
import QuickStockModal from '@/components/QuickStockModal';
import ServiceReceiptModal from '@/components/ServiceReceiptModal';
import {
  LayoutDashboard,
  Car,
  Package,
  Users,
  Settings,
  RefreshCw,
  Building2,
  CheckCircle2
} from 'lucide-react';

export default function Home() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [activeShopId, setActiveShopId] = useState<string>('shop-1');

  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'inventory' | 'vehicles'>('dashboard');

  // Data states
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<EnrichedServiceOrder[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [vehicles, setVehicles] = useState<(Vehicle & { customer?: Customer })[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [isNewPartOpen, setIsNewPartOpen] = useState(false);
  const [isNewVehicleOpen, setIsNewVehicleOpen] = useState(false);
  const [isNewShopOpen, setIsNewShopOpen] = useState(false);
  const [quickStockPart, setQuickStockPart] = useState<Part | null>(null);
  const [printOrder, setPrintOrder] = useState<EnrichedServiceOrder | null>(null);
  const [preselectedVehicle, setPreselectedVehicle] = useState<Vehicle | null>(null);

  // Success Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Shops
  const fetchShops = async () => {
    try {
      const res = await fetch('/api/shops');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setShops(data);
        if (!activeShopId || !data.some((s) => s.id === activeShopId)) {
          setActiveShopId(data[0].id);
        }
      }
    } catch (err) {
      console.error('Dükkanlar getirilemedi:', err);
    }
  };

  // Fetch all data for current shop
  const fetchShopData = useCallback(async (shopId: string) => {
    if (!shopId) return;
    setLoading(true);
    try {
      const [statsRes, ordersRes, partsRes, vehiclesRes] = await Promise.all([
        fetch(`/api/stats?shopId=${shopId}`),
        fetch(`/api/orders?shopId=${shopId}`),
        fetch(`/api/parts?shopId=${shopId}`),
        fetch(`/api/vehicles?shopId=${shopId}`)
      ]);

      const [statsData, ordersData, partsData, vehiclesData] = await Promise.all([
        statsRes.json(),
        ordersRes.json(),
        partsRes.json(),
        vehiclesRes.json()
      ]);

      setStats(statsData);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setParts(Array.isArray(partsData) ? partsData : []);
      setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
    } catch (err) {
      console.error('Veriler getirilemedi:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShops();
  }, []);

  useEffect(() => {
    if (activeShopId) {
      fetchShopData(activeShopId);
    }
  }, [activeShopId, fetchShopData]);

  // Hızlı Plaka Arama
  const handleSearchPlate = (plate: string) => {
    const clean = plate.trim().toUpperCase().replace(/\s+/g, '');
    const foundVeh = vehicles.find((v) => v.plate.replace(/\s+/g, '').toUpperCase().includes(clean));
    if (foundVeh) {
      setActiveTab('vehicles');
      showToast(`Plaka Bulundu: [${foundVeh.plate}] ${foundVeh.brand} ${foundVeh.model}`);
    } else {
      // Siparişlerde ara
      const foundOrder = orders.find((o) => o.vehicle?.plate.replace(/\s+/g, '').toUpperCase().includes(clean));
      if (foundOrder) {
        setActiveTab('orders');
        showToast(`İş Emri Bulundu: ${foundOrder.orderNo} - [${foundOrder.vehicle?.plate}]`);
      } else {
        alert(`"${plate}" plakalı araç bulunamadı. Yeni araç veya iş emri kaydı oluşturabilirsiniz.`);
      }
    }
  };

  // Handlers for Modals & Actions
  const handleCreateOrder = async (orderData: any) => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...orderData, shopId: activeShopId })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'İş emri oluşturulamadı');
    }
    showToast('Yeni iş emri açıldı ve yedek parça stoğu güncellendi!');
    fetchShopData(activeShopId);
  };

  const handleUpdateOrderStatus = async (orderId: string, status: ServiceStatus) => {
    const res = await fetch('/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, status })
    });
    if (res.ok) {
      showToast('İş emri durumu güncellendi!');
      fetchShopData(activeShopId);
    }
  };

  const handleUpdateOrderPayment = async (orderId: string, paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID', paidAmount: number) => {
    const res = await fetch('/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, paymentStatus, paidAmount, paymentMethod: 'NAKIT' })
    });
    if (res.ok) {
      showToast('Ödeme tahsilatı işlendi ve iş emri tamamlandı!');
      fetchShopData(activeShopId);
    }
  };

  const handleCreatePart = async (partData: any) => {
    const res = await fetch('/api/parts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...partData, shopId: activeShopId })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Parça eklenemedi');
    }
    showToast('Yeni yedek parça kartı depoya eklendi!');
    fetchShopData(activeShopId);
  };

  const handleQuickAdjustPart = async (partId: string, delta: number) => {
    const res = await fetch('/api/parts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: partId,
        shopId: activeShopId,
        action: 'ADJUST_STOCK',
        quantity: delta,
        type: delta > 0 ? 'GIRIS' : 'DUZELTME',
        notes: delta > 0 ? `Hızlı stok girişi (+${delta})` : `Hızlı stok çıkışı (${delta})`
      })
    });
    if (res.ok) {
      showToast('Parça stoğu anında güncellendi!');
      fetchShopData(activeShopId);
    }
  };

  const handleCustomAdjustStock = async (partId: string, delta: number, type: 'GIRIS' | 'DUZELTME', notes: string) => {
    const res = await fetch('/api/parts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: partId,
        shopId: activeShopId,
        action: 'ADJUST_STOCK',
        quantity: delta,
        type,
        notes
      })
    });
    if (res.ok) {
      showToast('Stok kaydı başarıyla işlendi!');
      fetchShopData(activeShopId);
    }
  };

  const handleCreateVehicle = async (vehicleData: any) => {
    const res = await fetch('/api/vehicles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...vehicleData, shopId: activeShopId })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Araç kaydedilemedi');
    }
    showToast('Yeni araç ve müşteri rehbere kaydedildi!');
    fetchShopData(activeShopId);
  };

  const handleCreateShop = async (shopData: any) => {
    const res = await fetch('/api/shops', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shopData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Dükkan oluşturulamadı');
    }
    const newShop = await res.json();
    await fetchShops();
    setActiveShopId(newShop.id);
    showToast(`"${newShop.name}" sisteme açıldı ve aktif dükkan olarak seçildi!`);
  };

  const activeShop = shops.find((s) => s.id === activeShopId) || shops[0] || {
    id: 'shop-1',
    name: 'Sanayi Servis',
    phone: '',
    email: '',
    city: 'İstanbul',
    district: '',
    address: ''
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Header */}
      <Header
        shops={shops}
        activeShopId={activeShopId}
        onSelectShop={(id) => setActiveShopId(id)}
        onOpenNewOrder={() => {
          setPreselectedVehicle(null);
          setIsNewOrderOpen(true);
        }}
        onOpenNewPart={() => setIsNewPartOpen(true)}
        onOpenNewShop={() => setIsNewShopOpen(true)}
        onSearchPlate={handleSearchPlate}
      />

      {/* Ana Navigasyon Sekmeleri */}
      <nav className="no-print bg-slate-900 border-b border-slate-800 sticky top-16 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between overflow-x-auto scrollbar-none">
            
            <div className="flex space-x-1 sm:space-x-3 py-2.5">
              
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeTab === 'dashboard'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Genel Bakış</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeTab === 'orders'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Car className="w-4 h-4" />
                <span>Servis & İş Emirleri</span>
                {orders.filter((o) => o.status === 'IN_PROGRESS' || o.status === 'WAITING_PARTS').length > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    activeTab === 'orders' ? 'bg-slate-950 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {orders.filter((o) => o.status === 'IN_PROGRESS' || o.status === 'WAITING_PARTS').length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('inventory')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeTab === 'inventory'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Yedek Parça & Stok</span>
                {stats?.lowStockCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    activeTab === 'inventory' ? 'bg-rose-900 text-white' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {stats.lowStockCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('vehicles')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeTab === 'vehicles'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Araçlar & Müşteriler</span>
              </button>

            </div>

            {/* Dükkan Bilgisi & Canlı Yenileme */}
            <div className="hidden lg:flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <Building2 className="w-4 h-4 text-amber-500" />
                {activeShop.name}
              </span>
              <button
                onClick={() => fetchShopData(activeShopId)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Verileri Yenile"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* Toast Bildirimi */}
      {toastMessage && (
        <div className="no-print fixed bottom-6 right-6 z-50 bg-slate-900 border border-amber-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Ana İçerik */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            stats={stats}
            recentOrders={orders.filter((o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED')}
            onOpenOrder={(order) => {
              setPrintOrder(order);
            }}
            onOpenNewOrder={() => {
              setPreselectedVehicle(null);
              setIsNewOrderOpen(true);
            }}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onOpenQuickStock={(part) => setQuickStockPart(part)}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersView
            orders={orders}
            onOpenNewOrder={() => {
              setPreselectedVehicle(null);
              setIsNewOrderOpen(true);
            }}
            onSelectOrderForPrint={(order) => setPrintOrder(order)}
            onUpdateStatus={handleUpdateOrderStatus}
            onUpdatePayment={handleUpdateOrderPayment}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            parts={parts}
            onOpenNewPart={() => setIsNewPartOpen(true)}
            onOpenQuickStock={(part) => setQuickStockPart(part)}
            onQuickAdjust={handleQuickAdjustPart}
          />
        )}

        {activeTab === 'vehicles' && (
          <VehiclesView
            vehicles={vehicles}
            orders={orders}
            onOpenNewVehicle={() => setIsNewVehicleOpen(true)}
            onOpenNewOrderForVehicle={(vehicle) => {
              setPreselectedVehicle(vehicle);
              setIsNewOrderOpen(true);
            }}
          />
        )}
      </main>

      {/* Alt Bilgi */}
      <footer className="no-print bg-slate-900 border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Sanayi Servis Pro © 2026 • Oto Servis, Araç Takip & Parça Stok Yönetim Sistemi</span>
          <span className="text-slate-400">Aktif Şube: <strong className="text-amber-400">{activeShop.name}</strong></span>
        </div>
      </footer>

      {/* MODALLAR */}
      {isNewOrderOpen && (
        <NewOrderModal
          vehicles={vehicles}
          parts={parts}
          initialVehicle={preselectedVehicle}
          onClose={() => {
            setIsNewOrderOpen(false);
            setPreselectedVehicle(null);
          }}
          onSubmit={handleCreateOrder}
        />
      )}

      {isNewPartOpen && (
        <NewPartModal
          onClose={() => setIsNewPartOpen(false)}
          onSubmit={handleCreatePart}
        />
      )}

      {isNewVehicleOpen && (
        <NewVehicleModal
          onClose={() => setIsNewVehicleOpen(false)}
          onSubmit={handleCreateVehicle}
        />
      )}

      {isNewShopOpen && (
        <NewShopModal
          onClose={() => setIsNewShopOpen(false)}
          onSubmit={handleCreateShop}
        />
      )}

      {quickStockPart && (
        <QuickStockModal
          part={quickStockPart}
          onClose={() => setQuickStockPart(null)}
          onSubmit={handleCustomAdjustStock}
        />
      )}

      {printOrder && (
        <ServiceReceiptModal
          order={printOrder}
          shop={activeShop}
          onClose={() => setPrintOrder(null)}
        />
      )}

    </div>
  );
}
