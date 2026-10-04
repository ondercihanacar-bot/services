'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types/index';
import {
  ShieldCheck,
  Lock,
  User as UserIcon,
  KeyRound,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Smartphone,
  Copy,
  Check,
  RefreshCw,
  Clock
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onLoginSuccess: (user: User) => void;
  onClose?: () => void;
  canClose?: boolean;
}

export default function LoginModal({
  isOpen,
  onLoginSuccess,
  onClose,
  canClose = false
}: LoginModalProps) {
  const [step, setStep] = useState<'CREDENTIALS' | 'TWO_FACTOR'>('CREDENTIALS');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [pendingUserInfo, setPendingUserInfo] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Demo 2FA code helper
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [remainingSec, setRemainingSec] = useState<number>(30);
  const [copiedCode, setCopiedCode] = useState(false);

  // Fetch demo TOTP code when on 2FA step
  const fetchDemoTotp = async (userId: string) => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get-demo-totp', userId })
      });
      const data = await res.json();
      if (res.ok && data.currentCode) {
        setDemoCode(data.currentCode);
        setRemainingSec(data.remainingSeconds || 30);
      }
    } catch {
      // Ignore background helper errors
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'TWO_FACTOR' && pendingUserId) {
      fetchDemoTotp(pendingUserId);
      interval = setInterval(() => {
        setRemainingSec((prev) => {
          if (prev <= 1) {
            fetchDemoTotp(pendingUserId);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, pendingUserId]);

  if (!isOpen) return null;

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password.trim()) {
      setError('Lütfen kullanıcı adı ve şifrenizi girin.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          username: username.trim(),
          password
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Giriş yapılamadı');
      }

      if (data.require2FA) {
        setPendingUserId(data.userId);
        setPendingUserInfo(data);
        setStep('TWO_FACTOR');
        setTotpCode('');
      } else if (data.success && data.user) {
        onLoginSuccess(data.user);
      }
    } catch (err: any) {
      setError(err.message || 'Giriş sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!totpCode.trim() || totpCode.length < 6) {
      setError('Lütfen 6 haneli doğrulama kodunu eksiksiz girin.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify-2fa',
          userId: pendingUserId,
          code: totpCode.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Kod doğrulanamadı');
      }

      if (data.success && data.user) {
        onLoginSuccess(data.user);
      }
    } catch (err: any) {
      setError(err.message || '2FA doğrulaması başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#07172c] border border-cyan-500/30 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden">
        
        {/* Glowing Top Neon Border */}
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600 animate-pulse"></div>

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-cyan-500/20 text-center relative">
          {canClose && onClose && (
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              ✕
            </button>
          )}

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-400/40 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] mb-3">
            {step === 'CREDENTIALS' ? (
              <Lock className="w-7 h-7 text-cyan-300" />
            ) : (
              <ShieldCheck className="w-7 h-7 text-cyan-300" />
            )}
          </div>

          <h2 className="text-xl font-black text-white tracking-wide flex items-center justify-center gap-2">
            <span>SERVICES</span>
            <span className="text-[10px] px-2 py-0.5 uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 rounded-full">
              PRO
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {step === 'CREDENTIALS'
              ? 'Yönetici & Personel Güvenli Giriş Paneli'
              : 'Google Authenticator 2 Adımlı Doğrulama'}
          </p>
        </div>

        {/* Error Box */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl flex items-start gap-2.5 text-rose-300 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: CREDENTIALS */}
        {step === 'CREDENTIALS' && (
          <form onSubmit={handleCredentialsSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-cyan-200 mb-1.5 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span>Kullanıcı Adı</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin veya usta"
                  className="w-full px-4 py-2.5 bg-[#0b2440] border border-cyan-500/35 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-cyan-200 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                <span>Şifre</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-[#0b2440] border border-cyan-500/35 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm font-medium transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 neon-btn-primary rounded-xl font-bold text-sm text-cyan-950 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-950" />
                  <span>Kontrol Ediliyor...</span>
                </>
              ) : (
                <>
                  <span>Sisteme Giriş Yap</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick Demo Login Pills */}
            <div className="pt-3 border-t border-cyan-500/20">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Hızlı Giriş Seçenekleri:</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleFillDemo('admin', 'admin123')}
                  className="p-2 bg-[#0c2847] hover:bg-[#12365e] border border-cyan-500/30 rounded-xl text-left transition-colors cursor-pointer group"
                >
                  <div className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                    <span>👑 Yönetici (Admin)</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    admin / admin123
                  </div>
                  <div className="text-[9px] text-cyan-400/80 mt-1 font-semibold">
                    🛡️ 2FA Doğrulamalı
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleFillDemo('usta', 'usta123')}
                  className="p-2 bg-[#0c2847] hover:bg-[#12365e] border border-cyan-500/30 rounded-xl text-left transition-colors cursor-pointer group"
                >
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1">
                    <span>🔧 Personel (Usta)</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    usta / usta123
                  </div>
                  <div className="text-[9px] text-amber-400/80 mt-1 font-semibold">
                    🔒 Kısıtlı Menü
                  </div>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* STEP 2: GOOGLE AUTHENTICATOR (2FA) */}
        {step === 'TWO_FACTOR' && (
          <form onSubmit={handleTwoFactorSubmit} className="p-6 space-y-4">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-950/70 border border-cyan-500/30 rounded-full text-xs text-cyan-300 font-bold">
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                <span>{pendingUserInfo?.fullName || pendingUserInfo?.username}</span>
              </div>
              <p className="text-xs text-slate-300">
                Google Authenticator uygulamanızda görüntülenen <strong>6 haneli</strong> kodu girin.
              </p>
            </div>

            {/* 6 Haneli Kod Girişi */}
            <div>
              <input
                type="text"
                autoFocus
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full text-center tracking-[0.5em] text-2xl font-mono font-black py-3 bg-[#0b2440] border-2 border-cyan-400 rounded-xl text-cyan-300 placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.25)]"
              />
            </div>

            {/* Demo Helper Box: Shows live valid TOTP code */}
            {demoCode && (
              <div className="p-3 bg-[#09223d] border border-cyan-500/40 rounded-xl">
                <div className="flex items-center justify-between text-[11px] font-bold text-cyan-300 mb-1">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>Test / Demo Canlı 2FA Kodu</span>
                  </span>
                  <span className="font-mono text-xs flex items-center gap-1 text-slate-300">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    {remainingSec}s
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <div className="font-mono font-black text-lg text-white tracking-widest bg-[#06182c] px-3 py-1 rounded-lg border border-cyan-500/30">
                    {demoCode}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTotpCode(demoCode);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Eklendi</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Kodu Yapıştır</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setStep('CREDENTIALS');
                  setError(null);
                }}
                className="flex-1 py-2.5 bg-[#0c2847] hover:bg-[#12365e] border border-cyan-500/30 rounded-xl text-xs font-bold text-slate-300 transition-colors cursor-pointer"
              >
                Geri Dön
              </button>

              <button
                type="submit"
                disabled={loading || totpCode.length < 6}
                className="flex-2 py-2.5 neon-btn-primary rounded-xl font-bold text-xs sm:text-sm text-cyan-950 flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-950" />
                    <span>Doğrulanıyor...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Doğrula ve Gir</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
