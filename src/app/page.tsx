'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Shop, Part, Vehicle, Customer, ServiceStatus, User, AppMenuItem } from '@/types/index';
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
import RemindersView from '@/components/RemindersView';
import ReportsView from '@/components/ReportsView';
import VehicleHistoryReportModal from '@/components/VehicleHistoryReportModal';
import OilStickerModal from '@/components/OilStickerModal';
import AccountsView from '@/components/AccountsView';
import ExtraApprovalModal from '@/components/ExtraApprovalModal';
import VehicleIntakeModal from '@/components/VehicleIntakeModal';
import LoginModal from '@/components/LoginModal';
import SettingsView from '@/components/SettingsView';
import {
  LayoutDashboard,
  Car,
  Package,
  Users,
  RefreshCw,
  Building2,
  CheckCircle2,
  Bell,
  CalendarRange,
  Wallet,
  Settings
} from 'lucide-react';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [shops, setShops] = useState<Shop[]>([]);
  const [activeShopId, setActiveShopId] = useState<string>('shop-1');

  // Navigation
  const [activeTab, setActiveTab] = useState<AppMenuItem>('dashboard');


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
  const [historyVehicle, setHistoryVehicle] = useState<(Vehicle & { customer?: Customer }) | null>(null);
  const [oilStickerOrder, setOilStickerOrder] = useState<EnrichedServiceOrder | null>(null);
  const [extraApprovalOrder, setExtraApprovalOrder] = useState<EnrichedServiceOrder | null>(null);
  const [vehicleIntakeOrder, setVehicleIntakeOrder] = useState<EnrichedServiceOrder | null>(null);
  const [preselectedVehicle, setPreselectedVehicle] = useState<Vehicle | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

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
      console.error('Şubeler getirilemedi:', err);
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

  // Kullanıcı Oturumu Yükleme
  useEffect(() => {
    const saved = localStorage.getItem('services_auth_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCurrentUser(parsed);
      } catch {
        localStorage.removeItem('services_auth_user');
        setIsLoginModalOpen(true);
      }
    } else {
      setIsLoginModalOpen(true);
    }
  }, []);

  // Menü Yetki Kontrolü ve Kısıtlı Sayfadan Yönlendirme
  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === 'ADMIN') return;

    const allowed = currentUser.allowedMenus || ['dashboard'];
    if (!allowed.includes(activeTab)) {
      const fallback = (allowed[0] || 'dashboard') as AppMenuItem;
      setActiveTab(fallback);
    }
  }, [currentUser, activeTab]);

  const canAccess = (tab: AppMenuItem) => {
    if (!currentUser) return false;
    if (currentUser.role === 'ADMIN') return true;
    return currentUser.allowedMenus?.includes(tab);
  };

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
    showToast('Yeni iş emri açıldı ve parça stoğu güncellendi!');
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
    showToast('Yeni parça kartı depoya eklendi!');
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
      throw new Error(err.error || 'Şube oluşturulamadı');
    }
    const newShop = await res.json();
    await fetchShops();
    setActiveShopId(newShop.id);
    showToast(`"${newShop.name}" sisteme açıldı ve aktif şube olarak seçildi!`);
  };

  const activeShop = shops.find((s) => s.id === activeShopId) || shops[0] || {
    id: 'shop-1',
    name: 'Services Merkez',
    phone: '',
    email: '',
    city: 'İstanbul',
    district: '',
    address: ''
  };

  // 15 gün kalan veya günü geçmiş hatırlatma sayısı
  const dueRemindersCount = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return vehicles.filter((v) => {
      const vOrders = orders.filter((o) => o.vehicleId === v.id);
      const latest = vOrders.sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime())[0];
      const nextDateStr = latest?.nextMaintenanceDate;
      if (!nextDateStr) return false;
      const nextD = new Date(nextDateStr);
      nextD.setHours(0, 0, 0, 0);
      const diff = Math.ceil((nextD.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diff <= 15;
    }).length;
  }, [vehicles, orders]);

  // Açık hesabı / borcu olan iş emri sayısı (Cari Takip için)
  const openDebtCount = React.useMemo(() => {
    return orders.filter((o) => Math.max(0, o.grandTotal - (o.paidAmount || 0)) > 0).length;
  }, [orders]);

  // Ekstra parça onay durumu güncelleme
  const handleSaveExtraApprovalStatus = async (
    orderId: string,
    status: 'NONE' | 'REQUESTED' | 'APPROVED' | 'REJECTED',
    notes: string,
    amount: number
  ) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderId,
          extraApprovalStatus: status,
          extraApprovalNotes: notes,
          extraApprovalAmount: amount
        })
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  extraApprovalStatus: status,
                  extraApprovalNotes: notes,
                  extraApprovalAmount: amount
                }
              : o
          )
        );
        showToast(
          status === 'REQUESTED'
            ? 'Müşteriden ekstra parça/masraf onayı istendi'
            : status === 'APPROVED'
            ? 'Müşteri onayı sisteme kaydedildi'
            : 'Reddedildi olarak güncellendi'
        );
      }
    } catch (err) {
      console.error('Ekstra onay durumu güncellenemedi:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900 flex flex-col font-sans">
      
      {/* Header */}
      <Header
        shops={shops}
        activeShopId={activeShopId}
        vehicles={vehicles}
        currentUser={currentUser}
        onSelectShop={(id) => setActiveShopId(id)}
        onOpenNewOrder={() => {
          setPreselectedVehicle(null);
          setIsNewOrderOpen(true);
        }}
        onOpenNewPart={() => setIsNewPartOpen(true)}
        onOpenNewShop={() => setIsNewShopOpen(true)}
        onSearchPlate={handleSearchPlate}
        onSelectVehicle={(veh) => {
          setSelectedVehicleId(veh.id);
          setActiveTab('vehicles');
          showToast(`Araç Seçildi: [${veh.plate}] ${veh.brand} ${veh.model}`);
        }}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={() => {
          setCurrentUser(null);
          localStorage.removeItem('services_auth_user');
          setIsLoginModalOpen(true);
          showToast('Oturum kapatıldı.');
        }}
        onNavigateToSettings={() => {
          if (currentUser?.role === 'ADMIN') {
            setActiveTab('settings');
          }
        }}
      />

      {/* Ana Navigasyon Sekmeleri */}
      <nav className="no-print bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-20 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2 gap-2">
            
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none py-0.5">
              
              {/* 1. Genel Bakış */}
              {canAccess('dashboard') && (
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    activeTab === 'dashboard'
                      ? 'neon-tab-active'
                      : 'neon-tab-inactive'
                  }`}
                >
                  <LayoutDashboard className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab === 'dashboard' ? 'text-cyan-300' : 'text-slate-500'}`} />
                  <span>Genel Bakış</span>
                </button>
              )}

              {/* 2. İş Emirleri */}
              {canAccess('orders') && (
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    activeTab === 'orders'
                      ? 'neon-tab-active'
                      : 'neon-tab-inactive'
                  }`}
                >
                  <Car className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab === 'orders' ? 'text-cyan-300' : 'text-slate-500'}`} />
                  <span>İş Emirleri</span>
                  {orders.filter((o) => o.status === 'IN_PROGRESS' || o.status === 'WAITING_PARTS').length > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      activeTab === 'orders' ? 'bg-cyan-400 text-slate-950 shadow-2xs' : 'bg-cyan-100 text-cyan-800'
                    }`}>
                      {orders.filter((o) => o.status === 'IN_PROGRESS' || o.status === 'WAITING_PARTS').length}
                    </span>
                  )}
                </button>
              )}

              {/* 3. Stok Takibi */}
              {canAccess('inventory') && (
                <button
                  onClick={() => setActiveTab('inventory')}
                  className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    activeTab === 'inventory'
                      ? 'neon-tab-active'
                      : 'neon-tab-inactive'
                  }`}
                >
                  <Package className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab === 'inventory' ? 'text-cyan-300' : 'text-slate-500'}`} />
                  <span>Stok Takibi</span>
                  {stats?.lowStockCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-2xs">
                      {stats.lowStockCount}
                    </span>
                  )}
                </button>
              )}

              {/* 4. Araçlar & Rehber */}
              {canAccess('vehicles') && (
                <button
                  onClick={() => setActiveTab('vehicles')}
                  className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    activeTab === 'vehicles'
                      ? 'neon-tab-active'
                      : 'neon-tab-inactive'
                  }`}
                >
                  <Users className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab === 'vehicles' ? 'text-cyan-300' : 'text-slate-500'}`} />
                  <span>Araçlar</span>
                </button>
              )}

              {/* 5. Cari & Borç Takibi */}
              {canAccess('accounts') && (
                <button
                  onClick={() => setActiveTab('accounts')}
                  className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    activeTab === 'accounts'
                      ? 'neon-tab-active'
                      : 'neon-tab-inactive'
                  }`}
                >
                  <Wallet className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab === 'accounts' ? 'text-cyan-300' : 'text-slate-500'}`} />
                  <span>Cari & Borç</span>
                  {openDebtCount > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      activeTab === 'accounts' ? 'bg-rose-500 text-white shadow-2xs' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {openDebtCount}
                    </span>
                  )}
                </button>
              )}

              {/* 6. Bakım & WhatsApp Hatırlatma */}
              {canAccess('reminders') && (
                <button
                  onClick={() => setActiveTab('reminders')}
                  className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    activeTab === 'reminders'
                      ? 'neon-tab-active'
                      : 'neon-tab-inactive'
                  }`}
                >
                  <Bell className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab === 'reminders' ? 'text-cyan-300' : 'text-slate-500'}`} />
                  <span>Hatırlatmalar</span>
                  {dueRemindersCount > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      activeTab === 'reminders' ? 'bg-amber-400 text-slate-950 shadow-2xs' : 'bg-amber-100 text-amber-900 font-bold'
                    }`}>
                      {dueRemindersCount}
                    </span>
                  )}
                </button>
              )}

              {/* 7. Raporlar & Sorgu */}
              {canAccess('reports') && (
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    activeTab === 'reports'
                      ? 'neon-tab-active'
                      : 'neon-tab-inactive'
                  }`}
                >
                  <CalendarRange className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab === 'reports' ? 'text-cyan-300' : 'text-slate-500'}`} />
                  <span>Raporlar & Sorgu</span>
                </button>
              )}

              {/* 8. Yönetici Ayarlar & Yetkiler Menüsü (SADECE ADMIN) */}
              {currentUser?.role === 'ADMIN' && (
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    activeTab === 'settings'
                      ? 'neon-tab-active'
                      : 'neon-tab-inactive'
                  }`}
                >
                  <Settings className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab === 'settings' ? 'text-cyan-300' : 'text-slate-500'}`} />
                  <span>Ayarlar & Yetkiler</span>
                </button>
              )}

            </div>


            {/* Canlı Yenileme Butonu */}
            <div className="shrink-0 flex items-center">
              <button
                onClick={() => fetchShopData(activeShopId)}
                className="p-1.5 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors cursor-pointer"
                title="Sistem Verilerini Yenile"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-600' : ''}`} />
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* Toast Bildirimi */}
      {toastMessage && (
        <div className="no-print fixed bottom-6 right-6 z-50 bg-[#0c2340] border border-cyan-400/50 text-white px-4 py-3 rounded-2xl shadow-2xl shadow-cyan-950/40 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
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
            shop={activeShop}
            onOpenNewOrder={() => {
              setPreselectedVehicle(null);
              setIsNewOrderOpen(true);
            }}
            onSelectOrderForPrint={(order) => setPrintOrder(order)}
            onUpdateStatus={handleUpdateOrderStatus}
            onUpdatePayment={handleUpdateOrderPayment}
            onOpenExtraApproval={(order) => setExtraApprovalOrder(order)}
            onOpenVehicleIntake={(order) => setVehicleIntakeOrder(order)}
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
            selectedVehicleId={selectedVehicleId}
            onSelectVehicle={(veh) => setSelectedVehicleId(veh.id)}
            onOpenNewVehicle={() => setIsNewVehicleOpen(true)}
            onOpenHistoryModal={(veh) => setHistoryVehicle(veh)}
            onOpenNewOrderForVehicle={(vehicle) => {
              setPreselectedVehicle(vehicle);
              setIsNewOrderOpen(true);
            }}
          />
        )}

        {activeTab === 'accounts' && (
          <AccountsView
            orders={orders}
            shop={activeShop}
            onUpdatePayment={handleUpdateOrderPayment}
            onSelectOrderForPrint={(order) => setPrintOrder(order)}
          />
        )}

        {activeTab === 'reminders' && (
          <RemindersView
            vehicles={vehicles}
            orders={orders}
            shop={activeShop}
            onOpenNewOrderForVehicle={(vehicle) => {
              setPreselectedVehicle(vehicle);
              setIsNewOrderOpen(true);
            }}
            onOpenHistoryModal={(veh) => setHistoryVehicle(veh)}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            orders={orders}
            vehicles={vehicles}
            shop={activeShop}
            onOpenOrder={(order) => setPrintOrder(order)}
            onOpenHistoryModal={(veh) => setHistoryVehicle(veh)}
          />
        )}

        {/* 8. Yönetici Ayarlar & Yetkiler Paneli */}
        {activeTab === 'settings' && currentUser?.role === 'ADMIN' && (
          <SettingsView
            currentUser={currentUser}
            shop={activeShop}
            onUpdateShop={(updated) => {
              setShops((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
            }}
            showToast={showToast}
            onUserSessionUpdate={(updatedUser) => {
              setCurrentUser(updatedUser);
              localStorage.setItem('services_auth_user', JSON.stringify(updatedUser));
            }}
          />
        )}
      </main>

      {/* Alt Bilgi */}
      <footer className="no-print bg-white/80 border-t border-slate-200/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Services Logo" className="w-5 h-5 rounded-md inline-block shadow-xs" />
            <span className="font-extrabold text-[#0c243f]">SERVICES</span>
            <span>•</span>
            <span className="font-semibold text-cyan-700">Servis Takip Otomasyonu © 2026</span>
          </div>
          <span className="text-slate-600">Aktif Şube: <strong className="text-cyan-700">{activeShop.name}</strong></span>
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
          onOpenOilSticker={(ord) => setOilStickerOrder(ord)}
        />
      )}

      {historyVehicle && (
        <VehicleHistoryReportModal
          isOpen={Boolean(historyVehicle)}
          onClose={() => setHistoryVehicle(null)}
          vehicle={historyVehicle}
          orders={orders}
          shop={activeShop}
        />
      )}

      {oilStickerOrder && (
        <OilStickerModal
          isOpen={Boolean(oilStickerOrder)}
          onClose={() => setOilStickerOrder(null)}
          order={oilStickerOrder}
          shop={activeShop}
        />
      )}

      {extraApprovalOrder && (
        <ExtraApprovalModal
          order={extraApprovalOrder}
          shop={activeShop}
          onClose={() => setExtraApprovalOrder(null)}
          onSaveStatus={handleSaveExtraApprovalStatus}
        />
      )}

      {vehicleIntakeOrder && (
        <VehicleIntakeModal
          order={vehicleIntakeOrder}
          shop={activeShop}
          onClose={() => setVehicleIntakeOrder(null)}
        />
      )}

      {/* Giriş & 2FA Güvenlik Modalı */}
      <LoginModal
        isOpen={isLoginModalOpen || !currentUser}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          localStorage.setItem('services_auth_user', JSON.stringify(user));
          setIsLoginModalOpen(false);
          showToast(`Giriş başarılı: ${user.fullName} (${user.role === 'ADMIN' ? '👑 Yönetici' : '🔧 Personel'})`);
          if (user.role !== 'ADMIN' && !user.allowedMenus.includes(activeTab)) {
            setActiveTab((user.allowedMenus[0] as AppMenuItem) || 'dashboard');
          }
        }}
        onClose={() => {
          if (currentUser) setIsLoginModalOpen(false);
        }}
        canClose={Boolean(currentUser)}
      />

    </div>
  );
}

