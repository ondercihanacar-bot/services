'use client';

import React, { useState } from 'react';
import { Part } from '@/types';
import { Package, X, ArrowUpCircle, ArrowDownCircle, RefreshCw } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-md w-full p-5 text-slate-100">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">Hızlı Stok Girişi / Güncelleme</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-4 p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1">
          <div className="font-bold text-white text-sm">{part.name}</div>
          <div className="text-slate-400 flex items-center justify-between">
            <span>OEM / Kod: <strong className="text-amber-400 font-mono">{part.code}</strong></span>
            <span>Mevcut Stok: <strong className="text-white">{part.stockQuantity} {part.unit}</strong></span>
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
              className={`p-2.5 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                type === 'GIRIS'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <ArrowUpCircle className="w-4 h-4 text-emerald-400" />
              Stoğa Ekle (Giriş)
            </button>

            <button
              type="button"
              onClick={() => {
                setType('DUZELTME');
                setAmount(part.stockQuantity);
              }}
              className={`p-2.5 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                type === 'DUZELTME'
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <RefreshCw className="w-4 h-4 text-blue-400" />
              Sayım Düzeltmesi
            </button>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">
              {type === 'GIRIS' ? `Eklenecek Miktar (${part.unit})` : `Yeni Kesin Stok Miktarı (${part.unit})`}
            </label>
            <input
              type="number"
              min={type === 'GIRIS' ? 1 : 0}
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono font-bold text-base focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Açıklama / Fatura No (Opsiyonel)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Örn: Toptancı faturası no 9872"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold rounded-lg shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Güncelleniyor...' : 'Stoğu Kaydet'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
