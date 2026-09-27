'use client';

import React, { useState } from 'react';
import { EnrichedServiceOrder } from '@/lib/db';
import { Shop } from '@/types/index';
import { formatCurrency, generateExtraApprovalWhatsAppMessage, generateWhatsAppLink } from '@/lib/utils';
import { AlertTriangle, X, MessageCircle, Send, CheckCircle2, XCircle } from 'lucide-react';

interface ExtraApprovalModalProps {
  order: EnrichedServiceOrder;
  shop: Shop;
  onClose: () => void;
  onSaveStatus: (orderId: string, status: 'NONE' | 'REQUESTED' | 'APPROVED' | 'REJECTED', notes: string, amount: number) => Promise<void>;
}

export default function ExtraApprovalModal({
  order,
  shop,
  onClose,
  onSaveStatus
}: ExtraApprovalModalProps) {
  const [discoveredFault, setDiscoveredFault] = useState(
    order.extraApprovalNotes || 'Ön fren disklerinde aşırı incelme ve çatlak tespit edildi.'
  );
  const [technicianAdvice, setTechnicianAdvice] = useState(
    'Yeni balata takıldığında eski çatlak disk üzerinde fren titremesi yapacak ve fren mesafesini uzatacaktır. Güvenliğiniz için disklerin de yenilenmesi tavsiye edilir.'
  );
  const [estimatedCost, setEstimatedCost] = useState<number>(order.extraApprovalAmount || 1800);
  const [saving, setSaving] = useState(false);

  const customerName = order.customer?.fullName || 'Müşteri';
  const customerPhone = order.customer?.phone || '';
  const plate = order.vehicle?.plate || '';
  const brandModel = `${order.vehicle?.brand || ''} ${order.vehicle?.model || ''}`.trim();

  // WhatsApp Önizleme Metni
  const previewMessage = generateExtraApprovalWhatsAppMessage({
    customerName,
    plate,
    brandModel,
    discoveredFault,
    technicianAdvice,
    estimatedCost: Number(estimatedCost) || 0,
    shopName: shop.name,
    shopPhone: shop.phone
  });

  const handleSendWhatsApp = async () => {
    if (!customerPhone) {
      alert('Müşteri telefon numarası bulunamadı!');
      return;
    }
    const link = generateWhatsAppLink(customerPhone, previewMessage);
    window.open(link, '_blank');

    // Durumu otomatik olarak 'REQUESTED' olarak güncelle
    setSaving(true);
    try {
      await onSaveStatus(order.id, 'REQUESTED', discoveredFault, Number(estimatedCost) || 0);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSetStatus = async (status: 'APPROVED' | 'REJECTED') => {
    setSaving(true);
    try {
      await onSaveStatus(order.id, status, discoveredFault, Number(estimatedCost) || 0);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[94vh] overflow-y-auto text-slate-900 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Üst Başlık */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 text-white rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/15 rounded-xl backdrop-blur-xs">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">
                Usta Ekstra Parça / Masraf Onay Talebi
              </h2>
              <p className="text-xs text-amber-100">
                Söküm ve teşhis sırasında çıkan arızalar için müşteriden WhatsApp onayı isteme
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* Araç & Müşteri Özet Kartı */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-sm bg-slate-900 text-white px-2.5 py-0.5 rounded-md">
                {plate}
              </span>
              <span className="font-bold text-slate-800 text-sm">
                {brandModel}
              </span>
            </div>
            <div className="text-slate-600">
              <strong className="text-slate-800">Müşteri:</strong> {customerName} ({customerPhone})
            </div>
          </div>

          {/* Form Alanları */}
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Yeni Tespit Edilen Arıza / Değişecek Ek Parça:
              </label>
              <input
                type="text"
                value={discoveredFault}
                onChange={(e) => setDiscoveredFault(e.target.value)}
                placeholder="Örn: Ön Fren Disklerinde Derin Aşınma & Çatlak"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Usta Tavsiyesi & Gerekçe:
              </label>
              <textarea
                rows={2}
                value={technicianAdvice}
                onChange={(e) => setTechnicianAdvice(e.target.value)}
                placeholder="Müşteriye neden değişmesi gerektiğini açıklayan kısa not..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Tahmini Ek Maliyet / Parça Fiyatı (TL):
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">TL</span>
              </div>
            </div>
          </div>

          {/* WhatsApp Canlı Önizleme */}
          <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Müşterinin WhatsApp'ına Gidecek Mesaj Taslağı:</span>
            </div>
            <pre className="text-[11px] font-sans text-slate-700 whitespace-pre-wrap bg-white border border-emerald-100 p-3 rounded-lg max-h-36 overflow-y-auto leading-relaxed">
              {previewMessage}
            </pre>
          </div>

          {/* Mevcut Onay Durumu */}
          {order.extraApprovalStatus && order.extraApprovalStatus !== 'NONE' && (
            <div className="flex items-center justify-between p-3 bg-slate-100 rounded-xl text-xs">
              <span className="text-slate-600 font-medium">Mevcut Durum:</span>
              {order.extraApprovalStatus === 'REQUESTED' && (
                <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  ⏳ Müşteriden Onay Bekleniyor
                </span>
              )}
              {order.extraApprovalStatus === 'APPROVED' && (
                <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Müşteri Onayladı
                </span>
              )}
              {order.extraApprovalStatus === 'REJECTED' && (
                <span className="font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Müşteri Reddetti
                </span>
              )}
            </div>
          )}

          {/* Aksiyon Butonları */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleSetStatus('APPROVED')}
                disabled={saving}
                className="flex-1 sm:flex-none px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Müşteri Sözlü Onayladı
              </button>
              <button
                type="button"
                onClick={() => handleSetStatus('REJECTED')}
                disabled={saving}
                className="flex-1 sm:flex-none px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                Reddetti
              </button>
            </div>

            <button
              type="button"
              onClick={handleSendWhatsApp}
              disabled={saving || !customerPhone}
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
              <span>WhatsApp ile Onay İste</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
