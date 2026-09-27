'use client';

import React, { useState } from 'react';
import { Building2, X, AlertCircle } from 'lucide-react';

interface NewShopModalProps {
  onClose: () => void;
  onSubmit: (shopData: any) => Promise<void>;
}

export default function NewShopModal({ onClose, onSubmit }: NewShopModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('İstanbul');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [taxOffice, setTaxOffice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Lütfen şube / servis adını girin.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        city: city.trim(),
        district: district.trim(),
        address: address.trim(),
        taxNumber: taxNumber.trim(),
        taxOffice: taxOffice.trim()
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Şube açılamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xl max-w-md w-full p-5 text-slate-900">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-cyan-600" />
            <h3 className="font-bold text-[#0c243f] text-base">Yeni Servis Şubesi Aç</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs sm:text-sm">
          <div>
            <label className="text-slate-700 font-bold block mb-1">
              Şube / Servis Adı <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Maslak Servis Şubesi"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-600 font-medium block mb-1">Telefon</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0212 ..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">E-posta</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-600 font-medium block mb-1">Şehir</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">İlçe / Bölge</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Örn: Maslak, Kadıköy..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-600 font-medium block mb-1">Açık Adres (Servis Fişinde Görünecek)</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Örn: Maslak Servis Plaza No: 44"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-600 font-medium block mb-1">Vergi Dairesi</label>
              <input
                type="text"
                value={taxOffice}
                onChange={(e) => setTaxOffice(e.target.value)}
                placeholder="Maslak V.D."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Vergi No / TC</label>
              <input
                type="text"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                placeholder="1234567890"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors font-medium cursor-pointer"
            >
              İptal
            </button>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-600 rounded-xl blur-xs opacity-75 group-hover:opacity-100 group-hover:blur-sm transition-all duration-300"></div>
              <button
                type="submit"
                disabled={loading}
                className="relative neon-btn-primary px-5 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Açılıyor...' : 'Şubeyi Sisteme Kaydet'}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
