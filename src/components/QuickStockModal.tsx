'use client';

import React, { useState } from 'react';
import { Part } from '@/types/index';
import { Package, X, ArrowUpCircle, RefreshCw } from 'lucide-react';

interface QuickStockModalProps {
  part: Part | null;
  onClose: () => void;
  onSubmit: (partId: string, delta: number, type: 'GIRIS' | 'DUZELTME', notes: string) => Promise<void>;
}

export default function QuickStockModal({
  part,
  onClose,
  onSubmit
}: QuickStockModalProps) {
  if (!part) return null;

  const [type, setType] = useState<'GIRIS' | 'DUZELTME'>('GIRIS');
  const [amount, setAmount] = useState(5);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 && type === 'GIRIS') return;

    setLoading(true);
    try {
      const delta = type === 'GIRIS' ? amount : amount - part.stockQuantity;
      await onSubmit(part.id, delta, type, notes);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-md w-full p-5 text-slate-900">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">Hızlı Stok Girişi / Güncelleme</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-4 p-3.5 bg-blue-50/50 border border-blue-100 rounded-lg text-xs space-y-1">
          <div className="font-bold text-slate-900 text-sm">{part.name}</div>
          <div className="text-slate-600 flex items-center justify-between">
            <span>OEM / Kod: <strong className="text-blue-700 font-mono">{part.code}</strong></span>
            <span>Mevcut Stok: <strong className="text-slate-900">{part.stockQuantity} {part.unit}</strong></span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setType('GIRIS');
                setAmount(5);
              }}
              className={`p-2.5 rounded-lg border font-bold flex items-center justify-center gap-1.5 transition-colors ${
                type === 'GIRIS'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <ArrowUpCircle className="w-4 h-4" />
              Stoğa Ekle (Giriş)
            </button>

            <button
              type="button"
              onClick={() => {
                setType('DUZELTME');
                setAmount(part.stockQuantity);
              }}
              className={`p-2.5 rounded-lg border font-bold flex items-center justify-center gap-1.5 transition-colors ${
                type === 'DUZELTME'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              Sayım Düzeltmesi
            </button>
          </div>

          <div>
            <label className="text-slate-600 font-medium block mb-1">
              {type === 'GIRIS' ? `Eklenecek Miktar (${part.unit})` : `Yeni Kesin Stok Miktarı (${part.unit})`}
            </label>
            <input
              type="number"
              min={type === 'GIRIS' ? 1 : 0}
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="text-slate-600 font-medium block mb-1">Açıklama / Fatura No (Opsiyonel)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Örn: Toptancı faturası no 9872"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
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
              {loading ? 'Güncelleniyor...' : 'Stoğu Kaydet'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
