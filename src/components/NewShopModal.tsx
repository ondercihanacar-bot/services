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
  const [district, setDistrict] = useState('İkitelli OSB');
  const [address, setAddress] = useState('');
  const [taxOffice, setTaxOffice] = useState('');
  const [taxNumber, setTaxNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Lütfen dükkan adı ve telefon alanını doldurun.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        city: city.trim(),
        district: district.trim(),
        address: address.trim(),
        taxOffice: taxOffice.trim() || undefined,
        taxNumber: taxNumber.trim() || undefined
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Dükkan oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-md w-full p-5 text-slate-900">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">Yeni Sanayi Dükkanı / Şube Aç</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 mt-4 text-xs">
          
          <div>
            <label className="text-slate-600 font-medium block mb-1">Dükkan / Servis Adı *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Güven Oto Mekanik & Elektrik"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-600 font-medium block mb-1">Telefon *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0212 555 00 00"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">E-Posta</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="servis@guvenoto.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-600 font-medium block mb-1">İl</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="İstanbul, Ankara..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">İlçe / Sanayi Sitesi</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Örn: İkitelli OSB, Şaşmaz..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-600 font-medium block mb-1">Açık Adres (Servis Fişinde Görünecek)</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Örn: Güngören Sanayi Sit. 12. Blok No: 44"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-600 font-medium block mb-1">Vergi Dairesi</label>
              <input
                type="text"
                value={taxOffice}
                onChange={(e) => setTaxOffice(e.target.value)}
                placeholder="İkitelli V.D."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Vergi No / TC</label>
              <input
                type="text"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                placeholder="1234567890"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors font-medium"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Açılıyor...' : 'Dükkanı Sisteme Kaydet'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
