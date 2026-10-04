'use client';

import React, { useState, useEffect } from 'react';
import { User, Shop, AppMenuItem, UserRole } from '@/types/index';
import {
  Users,
  Shield,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  Building2,
  Lock,
  Plus,
  Trash2,
  Check,
  Save,
  QrCode,
  Smartphone,
  Copy,
  AlertTriangle,
  RefreshCw,
  Edit2,
  Eye,
  EyeOff
} from 'lucide-react';

interface SettingsViewProps {
  currentUser: User;
  shop: Shop;
  onUpdateShop: (updatedShop: Shop) => void;
  showToast: (msg: string) => void;
  onUserSessionUpdate?: (updatedUser: User) => void;
}

const ALL_MENUS: { id: AppMenuItem; label: string; desc: string }[] = [
  { id: 'dashboard', label: 'Gösterge Paneli', desc: 'Genel özet, istatistikler ve hızlı kartlar' },
  { id: 'orders', label: 'İş Emirleri & Kabul', desc: 'Servis kabul, iş emri açma, durum güncelleme' },
  { id: 'inventory', label: 'Stok Takibi & Parçalar', desc: 'Parça listesi, stok hareketleri ve fiyatlar' },
  { id: 'vehicles', label: 'Araçlar & Müşteriler', desc: 'Kayıtlı araçlar, müşteri rehberi ve geçmiş' },
  { id: 'accounts', label: 'Cari & Borç Takibi', desc: 'Açık hesaplar, tahsilatlar ve borç defteri' },
  { id: 'reminders', label: 'Bakım Hatırlatmaları', desc: 'TÜVTÜRK muayene ve periyodik bakım takibi' },
  { id: 'reports', label: 'Raporlar & Sorgu', desc: 'Finansal analizler, ciro ve parça raporları' },
];

export default function SettingsView({
  currentUser,
  shop,
  onUpdateShop,
  showToast,
  onUserSessionUpdate
}: SettingsViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'users' | '2fa' | 'shop'>('users');

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // New User Modal State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('USER');
  const [newPhone, setNewPhone] = useState('');
  const [newAllowedMenus, setNewAllowedMenus] = useState<AppMenuItem[]>([
    'dashboard',
    'orders',
    'vehicles'
  ]);
  const [newEnable2FA, setNewEnable2FA] = useState(false);

  // Edit Permissions Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [tempMenus, setTempMenus] = useState<AppMenuItem[]>([]);

  // Change Password Modal State
  const [passwordModalUser, setPasswordModalUser] = useState<User | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  // 2FA Setup State for Current User
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [twoFactorSecret, setTwoFactorSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Shop settings state
  const [shopForm, setShopForm] = useState({
    name: shop.name || '',
    phone: shop.phone || '',
    email: shop.email || '',
    city: shop.city || '',
    district: shop.district || '',
    address: shop.address || '',
    taxOffice: shop.taxOffice || '',
    taxNumber: shop.taxNumber || '',
    bankName: shop.bankName || '',
    iban: shop.iban || '',
    accountHolder: shop.accountHolder || ''
  });
  const [savingShop, setSavingShop] = useState(false);

  // Load users
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch(`/api/users?shopId=${shop.id}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (err) {
      console.error('Kullanıcılar getirilemedi:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [shop.id]);

  useEffect(() => {
    setShopForm({
      name: shop.name || '',
      phone: shop.phone || '',
      email: shop.email || '',
      city: shop.city || '',
      district: shop.district || '',
      address: shop.address || '',
      taxOffice: shop.taxOffice || '',
      taxNumber: shop.taxNumber || '',
      bankName: shop.bankName || '',
      iban: shop.iban || '',
      accountHolder: shop.accountHolder || ''
    });
  }, [shop]);

  // Handle Add User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newFullName.trim() || !newPassword.trim()) {
      alert('Lütfen ad, kullanıcı adı ve şifre alanlarını doldurun.');
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId: shop.id,
          username: newUsername.trim(),
          fullName: newFullName.trim(),
          role: newRole,
          password: newPassword.trim(),
          allowedMenus: newRole === 'ADMIN' ? ALL_MENUS.map((m) => m.id) : newAllowedMenus,
          phone: newPhone.trim(),
          twoFactorEnabled: newEnable2FA
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Kullanıcı oluşturulamadı');
      }

      showToast(`Yeni kullanıcı eklendi: ${data.fullName}`);
      setIsAddUserOpen(false);
      setNewUsername('');
      setNewFullName('');
      setNewPassword('');
      setNewPhone('');
      setNewAllowedMenus(['dashboard', 'orders', 'vehicles']);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Kullanıcı eklenirken hata oluştu');
    }
  };

  // Handle Update Permissions
  const handleSavePermissions = async () => {
    if (!editingUser) return;
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingUser.id,
          allowedMenus: tempMenus
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'İzinler güncellenemedi');

      showToast(`${editingUser.fullName} yetkileri güncellendi!`);
      setEditingUser(null);
      fetchUsers();
      if (editingUser.id === currentUser.id && onUserSessionUpdate) {
        onUserSessionUpdate(data);
      }
    } catch (err: any) {
      alert(err.message || 'Hata oluştu');
    }
  };

  // Handle Reset / Change Password
  const handleSavePassword = async () => {
    if (!passwordModalUser || !newPasswordInput.trim()) return;
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: passwordModalUser.id,
          password: newPasswordInput.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Şifre güncellenemedi');

      showToast(`${passwordModalUser.fullName} şifresi başarıyla değiştirildi!`);
      setPasswordModalUser(null);
      setNewPasswordInput('');
    } catch (err: any) {
      alert(err.message || 'Şifre değiştirilirken hata oluştu');
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (userToDelete: User) => {
    if (userToDelete.username === 'admin') {
      alert('Ana yönetici hesabı silinemez!');
      return;
    }

    if (!confirm(`"${userToDelete.fullName}" kullanıcısını silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users?id=${userToDelete.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Kullanıcı silinemedi');

      showToast('Kullanıcı silindi.');
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Silme işlemi başarısız');
    }
  };

  // 2FA Setup
  const handleStart2FASetup = async () => {
    setSetupLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'setup-2fa',
          userId: currentUser.id
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '2FA kurulumu başlatılamadı');

      setQrCodeUrl(data.qrCodeUrl);
      setTwoFactorSecret(data.secret);
    } catch (err: any) {
      alert(err.message || '2FA kurulum hatası');
    } finally {
      setSetupLoading(false);
    }
  };

  const handleConfirm2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length < 6) {
      alert('Lütfen 6 haneli kodu girin.');
      return;
    }

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirm-2fa',
          userId: currentUser.id,
          secret: twoFactorSecret,
          code: verificationCode.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Doğrulama başarısız');

      showToast('Google Authenticator 2FA başarıyla aktifleştirildi!');
      setQrCodeUrl(null);
      setTwoFactorSecret(null);
      setVerificationCode('');
      fetchUsers();
      if (data.user && onUserSessionUpdate) {
        onUserSessionUpdate(data.user);
      }
    } catch (err: any) {
      alert(err.message || 'Doğrulama hatası');
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm('Google Authenticator 2 adımlı doğrulamayı kapatmak istediğinize emin misiniz?')) {
      return;
    }

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'disable-2fa',
          userId: currentUser.id
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '2FA kapatılamadı');

      showToast('2 Adımlı doğrulama kapatıldı.');
      fetchUsers();
      if (data.user && onUserSessionUpdate) {
        onUserSessionUpdate(data.user);
      }
    } catch (err: any) {
      alert(err.message || 'İşlem başarısız');
    }
  };

  // Save Shop Settings
  const handleSaveShopSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingShop(true);
    try {
      const res = await fetch('/api/shops', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: shop.id,
          ...shopForm
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Dükkan ayarları kaydedilemedi');

      onUpdateShop(data);
      showToast('Servis ve banka bilgileri güncellendi!');
    } catch (err: any) {
      alert(err.message || 'Kayıt sırasında hata oluştu');
    } finally {
      setSavingShop(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#07172c] border border-cyan-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                Yönetici Kontrol Merkezi
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40">
                Rol ve Menü Kısıtlamaları
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              Ayarlar & Yetkilendirme
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Personel kullanıcılarını tanımlayın, Google Authenticator (2FA) korumasını yönetin ve personelin hangi menülere erişebileceğini tek tıkla kısıtlayın.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="neon-btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold cursor-pointer"
            >
              <Plus className="w-4 h-4 text-cyan-300" />
              <span>Yeni Kullanıcı Tanımla</span>
            </button>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-cyan-500/20 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'users'
                ? 'neon-tab-active'
                : 'neon-tab-inactive'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Kullanıcılar & Menü Kısıtlamaları ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('2fa')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === '2fa'
                ? 'neon-tab-active'
                : 'neon-tab-inactive'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Google Authenticator (2FA)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('shop')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'shop'
                ? 'neon-tab-active'
                : 'neon-tab-inactive'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Servis & IBAN Ayarları</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: USERS & PERMISSIONS */}
      {activeSubTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-[#07172c] border border-cyan-500/25 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-4 sm:p-5 border-b border-cyan-500/20 flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-400" />
                  <span>Kayıtlı Kullanıcılar ve Menü Yetkileri</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Her personelin şifresini değiştirebilir ve erişebileceği menüleri ayarlayabilirsiniz.
                </p>
              </div>

              <button
                onClick={fetchUsers}
                className="p-2 text-slate-400 hover:text-cyan-400 rounded-lg transition-colors cursor-pointer"
                title="Yenile"
              >
                <RefreshCw className={`w-4 h-4 ${loadingUsers ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0b2440] text-[11px] font-bold text-cyan-300 uppercase tracking-wider border-b border-cyan-500/20">
                    <th className="py-3 px-4 sm:px-6">Kullanıcı / Personel</th>
                    <th className="py-3 px-4">Rol</th>
                    <th className="py-3 px-4">2FA Koruması</th>
                    <th className="py-3 px-4">Erişebildiği Menüler</th>
                    <th className="py-3 px-4 sm:px-6 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-500/10 text-xs text-slate-200">
                  {users.map((u) => {
                    const isAdmin = u.role === 'ADMIN';
                    return (
                      <tr key={u.id} className="hover:bg-[#0c243f]/60 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="font-bold text-white text-sm flex items-center gap-2">
                            <span>{u.fullName}</span>
                            {u.id === currentUser.id && (
                              <span className="text-[10px] px-2 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/30">
                                Sen
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                            <span>@{u.username}</span>
                            {u.phone && <span>• {u.phone}</span>}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {isAdmin ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                              👑 Yönetici
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-400/40">
                              🔧 Personel
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {u.twoFactorEnabled ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>2FA Aktif</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                              ⚪ Pasif
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 max-w-xs">
                          {isAdmin ? (
                            <span className="text-cyan-400 font-semibold text-[11px]">
                              Tüm Menülere Tam Erişim (Yetkili)
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {u.allowedMenus && u.allowedMenus.length > 0 ? (
                                u.allowedMenus.map((menuId) => {
                                  const menuDef = ALL_MENUS.find((m) => m.id === menuId);
                                  return (
                                    <span
                                      key={menuId}
                                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#0b2749] text-cyan-200 border border-cyan-500/30"
                                    >
                                      {menuDef?.label || menuId}
                                    </span>
                                  );
                                })
                              ) : (
                                <span className="text-rose-400 text-[11px] italic">Hiçbir menüye yetkisi yok</span>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Menü Yetkilerini Düzenle */}
                            {!isAdmin && (
                              <button
                                onClick={() => {
                                  setEditingUser(u);
                                  setTempMenus(u.allowedMenus || []);
                                }}
                                className="px-2.5 py-1.5 bg-[#0c2847] hover:bg-[#12365e] border border-cyan-500/30 text-cyan-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                title="Menü Yetkilerini Kısıtla / Düzenle"
                              >
                                Menü Yetkileri
                              </button>
                            )}

                            {/* Şifre Değiştir */}
                            <button
                              onClick={() => {
                                setPasswordModalUser(u);
                                setNewPasswordInput('');
                              }}
                              className="p-1.5 bg-[#0c2847] hover:bg-[#12365e] border border-cyan-500/30 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
                              title="Şifreyi Değiştir / Sıfırla"
                            >
                              <KeyRound className="w-4 h-4 text-cyan-400" />
                            </button>

                            {/* Sil */}
                            {u.username !== 'admin' && u.id !== currentUser.id && (
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 rounded-xl transition-colors cursor-pointer"
                                title="Kullanıcıyı Sil"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: GOOGLE AUTHENTICATOR (2FA) */}
      {activeSubTab === '2fa' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Status Card */}
          <div className="bg-[#07172c] border border-cyan-500/30 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 flex items-center justify-center">
                <Shield className="w-6 h-6 text-cyan-300" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  Google Authenticator Durumu
                </h3>
                <p className="text-xs text-slate-400">
                  Aktif Kullanıcı: <strong>{currentUser.fullName}</strong> (@{currentUser.username})
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#0b2440] border border-cyan-500/20 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">2FA Güvenlik Seviyesi</span>
                  <span className="text-sm font-bold text-white">
                    {currentUser.twoFactorEnabled ? '🛡️ Aktif ve Koruma Altında' : '⚠️ Henüz Aktif Değil'}
                  </span>
                </div>
                {currentUser.twoFactorEnabled ? (
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded-full text-xs font-bold">
                    Güvenli
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/40 rounded-full text-xs font-bold">
                    Önerilen
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Google Authenticator, giriş yaparken şifrenize ek olarak akıllı telefonunuzdaki 6 haneli zaman bazlı kodu girmenizi gerektirir. Bu sayede şifreniz çalınsa dahi hesabınız %100 güvende kalır.
            </p>

            <div className="pt-2 flex gap-3">
              {!currentUser.twoFactorEnabled ? (
                <button
                  onClick={handleStart2FASetup}
                  disabled={setupLoading}
                  className="w-full neon-btn-primary py-2.5 rounded-xl font-bold text-xs sm:text-sm text-cyan-950 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Google Authenticator'ı Kur & Başlat</span>
                </button>
              ) : (
                <button
                  onClick={handleDisable2FA}
                  className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  2 Adımlı Doğrulamayı Kapat
                </button>
              )}
            </div>
          </div>

          {/* QR Code Setup Box */}
          <div className="bg-[#07172c] border border-cyan-500/30 rounded-3xl p-6 shadow-xl">
            {qrCodeUrl ? (
              <form onSubmit={handleConfirm2FA} className="space-y-4">
                <div className="text-center space-y-1">
                  <h4 className="text-base font-bold text-white flex items-center justify-center gap-2">
                    <Smartphone className="w-5 h-5 text-cyan-400" />
                    <span>Telefonunuzla QR Kodu Taratın</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Google Authenticator uygulamasını açıp aşağıdaki karekodu okutun.
                  </p>
                </div>

                {/* QR Image */}
                <div className="flex justify-center p-3 bg-white rounded-2xl w-fit mx-auto shadow-2xl">
                  <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                </div>

                {/* Secret Key manual */}
                {twoFactorSecret && (
                  <div className="p-3 bg-[#0b2440] border border-cyan-500/30 rounded-xl text-center">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                      Karekod okumuyorsa elle girilecek gizli anahtar:
                    </div>
                    <div className="font-mono font-bold text-cyan-300 text-xs flex items-center justify-center gap-2">
                      <span>{twoFactorSecret}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(twoFactorSecret);
                          setCopiedSecret(true);
                          setTimeout(() => setCopiedSecret(false), 2000);
                        }}
                        className="text-slate-400 hover:text-white"
                      >
                        {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Code Confirmation */}
                <div>
                  <label className="block text-xs font-bold text-cyan-200 mb-1 text-center">
                    Uygulamada Oluşan 6 Haneli Kodu Onaylayın:
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full text-center tracking-[0.5em] text-xl font-mono font-black py-2 bg-[#0b2440] border-2 border-cyan-400 rounded-xl text-cyan-300 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={verificationCode.length < 6}
                  className="w-full neon-btn-primary py-2.5 rounded-xl font-bold text-xs sm:text-sm text-cyan-950 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Doğrula ve 2FA'yı Aktif Et</span>
                </button>
              </form>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-cyan-950/50 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <QrCode className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-white">Nasıl Çalışır?</h4>
                <ol className="text-xs text-slate-400 space-y-1.5 text-left list-decimal pl-4 max-w-xs">
                  <li>Telefonunuza Google Authenticator uygulamasını indirin.</li>
                  <li>"Google Authenticator'ı Kur & Başlat" butonuna tıklayın.</li>
                  <li>Ekrana gelen karekodu telefonunuzla taratın.</li>
                  <li>Oluşan 6 haneli kodu girerek güvenliği tamamlayın.</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: SHOP & IBAN SETTINGS */}
      {activeSubTab === 'shop' && (
        <form onSubmit={handleSaveShopSettings} className="bg-[#07172c] border border-cyan-500/25 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="border-b border-cyan-500/20 pb-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-cyan-400" />
              <span>Servis, Vergi & Banka / IBAN Bilgileri</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Bu bilgiler iş emri teslim fişlerinde, WhatsApp fatura mesajlarında ve PDF dökümlerinde otomatik gösterilir.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-cyan-200 mb-1">Servis / Dükkan Adı</label>
              <input
                type="text"
                required
                value={shopForm.name}
                onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#0b2440] border border-cyan-500/35 rounded-xl text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-cyan-200 mb-1">İletişim Telefonu</label>
              <input
                type="text"
                required
                value={shopForm.phone}
                onChange={(e) => setShopForm({ ...shopForm, phone: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#0b2440] border border-cyan-500/35 rounded-xl text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-cyan-200 mb-1">E-Posta Adresi</label>
              <input
                type="email"
                value={shopForm.email}
                onChange={(e) => setShopForm({ ...shopForm, email: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#0b2440] border border-cyan-500/35 rounded-xl text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-cyan-200 mb-1">İlçe</label>
              <input
                type="text"
                value={shopForm.district}
                onChange={(e) => setShopForm({ ...shopForm, district: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#0b2440] border border-cyan-500/35 rounded-xl text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-cyan-200 mb-1">Şehir</label>
              <input
                type="text"
                value={shopForm.city}
                onChange={(e) => setShopForm({ ...shopForm, city: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#0b2440] border border-cyan-500/35 rounded-xl text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-cyan-200 mb-1">Vergi Dairesi & No</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Vergi Dairesi"
                  value={shopForm.taxOffice}
                  onChange={(e) => setShopForm({ ...shopForm, taxOffice: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0b2440] border border-cyan-500/35 rounded-xl text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
                <input
                  type="text"
                  placeholder="Vergi No"
                  value={shopForm.taxNumber}
                  onChange={(e) => setShopForm({ ...shopForm, taxNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0b2440] border border-cyan-500/35 rounded-xl text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-cyan-200 mb-1">Açık Adres</label>
              <textarea
                rows={2}
                value={shopForm.address}
                onChange={(e) => setShopForm({ ...shopForm, address: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#0b2440] border border-cyan-500/35 rounded-xl text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none"
              />
            </div>
          </div>

          {/* Bank & IBAN Information */}
          <div className="pt-4 border-t border-cyan-500/20">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span>Banka Havale / EFT & IBAN Bilgileri</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-cyan-200 mb-1">Banka Adı</label>
                <input
                  type="text"
                  placeholder="Örn: Garanti BBVA"
                  value={shopForm.bankName}
                  onChange={(e) => setShopForm({ ...shopForm, bankName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#0b2440] border border-cyan-500/35 rounded-xl text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-cyan-200 mb-1">Hesap Sahibi</label>
                <input
                  type="text"
                  placeholder="Örn: Özkan Oto Sanayi Tic. Ltd."
                  value={shopForm.accountHolder}
                  onChange={(e) => setShopForm({ ...shopForm, accountHolder: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#0b2440] border border-cyan-500/35 rounded-xl text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-cyan-200 mb-1">IBAN Numarası</label>
                <input
                  type="text"
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                  value={shopForm.iban}
                  onChange={(e) => setShopForm({ ...shopForm, iban: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#0b2440] border border-cyan-500/35 rounded-xl text-white text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingShop}
              className="neon-btn-primary px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-cyan-950" />
              <span>{savingShop ? 'Kaydediliyor...' : 'Dükkan Bilgilerini Kaydet'}</span>
            </button>
          </div>
        </form>
      )}

      {/* MODAL 1: ADD NEW USER */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#07172c] border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-cyan-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-400/40 text-cyan-400">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-white">Yeni Personel / Kullanıcı Tanımla</h3>
              </div>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-cyan-200 mb-1">Ad Soyad *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ahmet Yılmaz"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#0b2440] border border-cyan-500/35 rounded-xl text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-cyan-200 mb-1">Kullanıcı Adı *</label>
                  <input
                    type="text"
                    required
                    placeholder="ahmet veya usta2"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    className="w-full px-3.5 py-2 bg-[#0b2440] border border-cyan-500/35 rounded-xl text-white text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-cyan-200 mb-1">İlk Giriş Şifresi *</label>
                  <input
                    type="text"
                    required
                    placeholder="En az 6 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#0b2440] border border-cyan-500/35 rounded-xl text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-cyan-200 mb-1">Kullanıcı Rolü</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2 bg-[#0b2440] border border-cyan-500/35 rounded-xl text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  >
                    <option value="USER">🔧 Personel / Kullanıcı (Kısıtlanabilir)</option>
                    <option value="ADMIN">👑 Yönetici (Tam Yetkili)</option>
                  </select>
                </div>
              </div>

              {/* Menü Kısıtlama Seçenekleri (Sadece USER rolü için) */}
              {newRole === 'USER' && (
                <div className="pt-2 border-t border-cyan-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-cyan-300">
                      Bu Kullanıcının Erişebileceği Menüler:
                    </label>
                    <span className="text-[10px] text-slate-400">İşaretli olanlar görünür</span>
                  </div>

                  <div className="space-y-2 bg-[#081e35] p-3 rounded-2xl border border-cyan-500/20 max-h-48 overflow-y-auto">
                    {ALL_MENUS.map((menu) => {
                      const isChecked = newAllowedMenus.includes(menu.id);
                      return (
                        <label
                          key={menu.id}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#0c2847] cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewAllowedMenus([...newAllowedMenus, menu.id]);
                              } else {
                                setNewAllowedMenus(newAllowedMenus.filter((m) => m !== menu.id));
                              }
                            }}
                            className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 cursor-pointer"
                          />
                          <div>
                            <div className="text-xs font-bold text-white">{menu.label}</div>
                            <div className="text-[10px] text-slate-400">{menu.desc}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-cyan-500/20">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 bg-[#0c2847] hover:bg-[#12365e] text-slate-300 rounded-xl text-xs font-bold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="neon-btn-primary px-5 py-2 rounded-xl text-xs font-bold text-cyan-950 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Kullanıcıyı Kaydet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT PERMISSIONS */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#07172c] border border-cyan-500/40 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="border-b border-cyan-500/20 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white">Menü Yetkilerini Kısıtla / Ayarla</h3>
                <p className="text-xs text-slate-400">
                  {editingUser.fullName} (@{editingUser.username})
                </p>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {ALL_MENUS.map((menu) => {
                const isChecked = tempMenus.includes(menu.id);
                return (
                  <label
                    key={menu.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-[#09223d] border border-cyan-500/20 hover:border-cyan-400/40 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTempMenus([...tempMenus, menu.id]);
                        } else {
                          setTempMenus(tempMenus.filter((m) => m !== menu.id));
                        }
                      }}
                      className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">{menu.label}</div>
                      <div className="text-[10px] text-slate-400">{menu.desc}</div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-cyan-500/20">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 bg-[#0c2847] hover:bg-[#12365e] text-slate-300 rounded-xl text-xs font-bold"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleSavePermissions}
                className="neon-btn-primary px-5 py-2 rounded-xl text-xs font-bold text-cyan-950 flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Yetkileri Güncelle</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CHANGE / RESET PASSWORD */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-[#07172c] border border-cyan-500/40 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="border-b border-cyan-500/20 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white">Şifre Değiştir / Sıfırla</h3>
                <p className="text-xs text-slate-400">
                  {passwordModalUser.fullName} (@{passwordModalUser.username})
                </p>
              </div>
              <button
                onClick={() => setPasswordModalUser(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-cyan-200 mb-1">Yeni Şifre</label>
              <input
                type="text"
                autoFocus
                value={newPasswordInput}
                onChange={(e) => setNewPasswordInput(e.target.value)}
                placeholder="Yeni şifreyi girin"
                className="w-full px-3.5 py-2.5 bg-[#0b2440] border border-cyan-500/35 rounded-xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Yönetici olarak kullanıcının şifresini doğrudan belirleyebilirsiniz.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-cyan-500/20">
              <button
                type="button"
                onClick={() => setPasswordModalUser(null)}
                className="px-4 py-2 bg-[#0c2847] hover:bg-[#12365e] text-slate-300 rounded-xl text-xs font-bold"
              >
                İptal
              </button>
              <button
                type="button"
                disabled={!newPasswordInput.trim()}
                onClick={handleSavePassword}
                className="neon-btn-primary px-5 py-2 rounded-xl text-xs font-bold text-cyan-950 flex items-center gap-1.5 disabled:opacity-50"
              >
                <KeyRound className="w-4 h-4" />
                <span>Şifreyi Kaydet</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
