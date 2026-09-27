'use client';

import React, { useState } from 'react';
import { Vehicle, Customer, Part, ServiceItem, ServiceStatus } from '@/types/index';
import { formatCurrency } from '@/lib/utils';
import { X, Plus, Trash2, Car, Wrench, Package, AlertCircle } from 'lucide-react';

interface NewOrderModalProps {
  vehicles: (Vehicle & { customer?: Customer })[];
  parts: Part[];
  initialVehicle?: Vehicle | null;
  onClose: () => void;
  onSubmit: (orderData: any) => Promise<void>;
}

export default function NewOrderModal({
  vehicles,
  parts,
  initialVehicle,
  onClose,
  onSubmit
}: NewOrderModalProps) {
  const [isExistingVehicle, setIsExistingVehicle] = useState(Boolean(initialVehicle) || vehicles.length > 0);
  const [selectedVehicleId, setSelectedVehicleId] = useState(initialVehicle?.id || (vehicles[0]?.id || ''));

  // Yeni araç formu (eğer mevcut değilse)
  const [newPlate, setNewPlate] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newYear, setNewYear] = useState(new Date().getFullYear());
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');

  // İş emri detayları
  const [kmAtEntry, setKmAtEntry] = useState(initialVehicle?.currentKm || 100000);
  const [customerComplaint, setCustomerComplaint] = useState('');
  const [technicianNotes, setTechnicianNotes] = useState('');
  const [assignedTechnician, setAssignedTechnician] = useState('Murat Usta');
  const [status, setStatus] = useState<ServiceStatus>('IN_PROGRESS');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');
  const [nextMaintenanceKm, setNextMaintenanceKm] = useState(kmAtEntry + 10000);
  const [discount, setDiscount] = useState(0);

  // İş emri kalemleri (Parça & İşçilik)
  const [items, setItems] = useState<ServiceItem[]>([
    {
      id: `item-${Date.now()}-1`,
      type: 'LABOR',
      name: 'Periyodik Bakım ve Kontrol İşçiliği',
      quantity: 1,
      unitPrice: 1000,
      vatRate: 20,
      totalPrice: 1000
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Kalem ekleme
  const addItem = (type: 'PART' | 'LABOR') => {
    if (type === 'PART') {
      const firstPart = parts[0];
      setItems((prev) => [
        ...prev,
        {
          id: `item-${Date.now()}`,
          type: 'PART',
          partId: firstPart?.id,
          name: firstPart ? firstPart.name : 'Yedek Parça',
          quantity: 1,
          unitPrice: firstPart ? firstPart.salePrice : 0,
          vatRate: 20,
          totalPrice: firstPart ? firstPart.salePrice : 0
        }
      ]);
    } else {
      setItems((prev) => [
        ...prev,
        {
          id: `item-${Date.now()}`,
          type: 'LABOR',
          name: 'Mekanik Onarım İşçiliği',
          quantity: 1,
          unitPrice: 500,
          vatRate: 20,
          totalPrice: 500
        }
      ]);
    }
  };

  const updateItemPart = (itemId: string, partId: string) => {
    const selectedPart = parts.find((p) => p.id === partId);
    if (!selectedPart) return;

    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              partId: selectedPart.id,
              name: selectedPart.name,
              unitPrice: selectedPart.salePrice,
              vatRate: selectedPart.vatRate,
              totalPrice: selectedPart.salePrice * item.quantity
            }
          : item
      )
    );
  };

  const updateItemQty = (itemId: string, qty: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: Math.max(1, qty),
              totalPrice: item.unitPrice * Math.max(1, qty)
            }
          : item
      )
    );
  };

  const updateItemPrice = (itemId: string, price: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              unitPrice: price,
              totalPrice: price * item.quantity
            }
          : item
      )
    );
  };

  const updateItemName = (itemId: string, name: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, name } : item))
    );
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  // Toplam hesaplamaları
  let partsTotal = 0;
  let laborTotal = 0;
  let taxTotal = 0;
  items.forEach((it) => {
    const total = it.quantity * it.unitPrice;
    if (it.type === 'PART') partsTotal += total;
    else laborTotal += total;
    taxTotal += total * (it.vatRate / 100);
  });
  const subtotal = partsTotal + laborTotal;
  const grandTotal = Math.max(0, subtotal - discount + taxTotal);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let vehicleId = selectedVehicleId;
      let customerId = '';

      if (!isExistingVehicle) {
        if (!newPlate.trim() || !newBrand.trim() || !newModel.trim()) {
          throw new Error('Lütfen yeni aracın plaka, marka ve modelini girin.');
        }
        if (!newCustomerName.trim() || !newCustomerPhone.trim()) {
          throw new Error('Lütfen müşteri ad ve telefon bilgisini girin.');
        }

        const vRes = await fetch('/api/vehicles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plate: newPlate.trim().toUpperCase(),
            brand: newBrand.trim(),
            model: newModel.trim(),
            year: Number(newYear) || new Date().getFullYear(),
            currentKm: Number(kmAtEntry) || 0,
            customer: {
              fullName: newCustomerName.trim(),
              phone: newCustomerPhone.trim()
            }
          })
        });

        const vData = await vRes.json();
        if (!vRes.ok) {
          throw new Error(vData.error || 'Araç kaydedilemedi');
        }

        vehicleId = vData.id;
        customerId = vData.customerId;
      } else {
        const foundVeh = vehicles.find((v) => v.id === vehicleId);
        if (!foundVeh) throw new Error('Seçilen araç bulunamadı');
        customerId = foundVeh.customerId;
      }

      await onSubmit({
        vehicleId,
        customerId,
        entryDate: new Date().toISOString(),
        estimatedDeliveryDate: estimatedDeliveryDate || undefined,
        status,
        customerComplaint: customerComplaint.trim() || 'Periyodik bakım ve arıza kontrolü',
        technicianNotes: technicianNotes.trim() || undefined,
        assignedTechnician,
        kmAtEntry: Number(kmAtEntry),
        nextMaintenanceKm: Number(nextMaintenanceKm) || undefined,
        items,
        discount: Number(discount) || 0,
        paymentStatus: 'UNPAID',
        paidAmount: 0
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'Hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto text-slate-900">
        
        {/* Üst Başlık */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-blue-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Yeni Araç Kabul & Servis İş Emri</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          
          {/* Araç Seçim Modu (Kayıtlı vs Yeni) */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Araç & Müşteri Seçimi</span>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsExistingVehicle(true)}
                  className={`px-3 py-1 rounded-md font-bold transition-colors ${
                    isExistingVehicle ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  Kayıtlı Araçlardan Seç
                </button>
                <button
                  type="button"
                  onClick={() => setIsExistingVehicle(false)}
                  className={`px-3 py-1 rounded-md font-bold transition-colors ${
                    !isExistingVehicle ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  + Yeni Araç & Müşteri
                </button>
              </div>
            </div>

            {isExistingVehicle ? (
              <div>
                <label className="text-xs text-slate-500 block mb-1">Servise Alınacak Araç:</label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => {
                    setSelectedVehicleId(e.target.value);
                    const v = vehicles.find((veh) => veh.id === e.target.value);
                    if (v) {
                      setKmAtEntry(v.currentKm);
                      setNextMaintenanceKm(v.currentKm + 10000);
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      [{v.plate}] {v.brand} {v.model} ({v.year}) - Müşteri: {v.customer?.fullName || 'Belirtilmedi'}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Araç Plakası *</label>
                  <input
                    type="text"
                    required
                    value={newPlate}
                    onChange={(e) => setNewPlate(e.target.value.toUpperCase())}
                    placeholder="34 ABC 123"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-mono font-bold tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Marka & Model *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={newBrand}
                      onChange={(e) => setNewBrand(e.target.value)}
                      placeholder="Renault"
                      className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <input
                      type="text"
                      required
                      value={newModel}
                      onChange={(e) => setNewModel(e.target.value)}
                      placeholder="Megane 4"
                      className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Müşteri Ad Soyad *</label>
                  <input
                    type="text"
                    required
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    placeholder="Ahmet Yılmaz"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Müşteri Telefon *</label>
                  <input
                    type="text"
                    required
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    placeholder="0532 111 22 33"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Servis Kabul Detayları */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Servise Giriş KM *</label>
              <input
                type="number"
                required
                value={kmAtEntry}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setKmAtEntry(val);
                  setNextMaintenanceKm(val + 10000);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 block mb-1">Sorumlu Usta</label>
              <input
                type="text"
                value={assignedTechnician}
                onChange={(e) => setAssignedTechnician(e.target.value)}
                placeholder="Murat Usta"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 block mb-1">Başlangıç Durumu</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ServiceStatus)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              >
                <option value="IN_PROGRESS">Tamirde / Liftte</option>
                <option value="DIAGNOSIS">Teşhis & Ekspertiz</option>
                <option value="WAITING_PARTS">Parça Bekleniyor</option>
                <option value="PENDING">Sırada / Beklemede</option>
              </select>
            </div>
          </div>

          {/* Şikayet ve Usta Notu */}
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Müşteri Şikayeti / Arıza Beyanı *</label>
              <textarea
                required
                rows={2}
                value={customerComplaint}
                onChange={(e) => setCustomerComplaint(e.target.value)}
                placeholder="Örn: Yağ ve filtre bakımı yapılacak. Frene basınca titreme ve ötme var..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 block mb-1">Usta Teşhis / Ön İnceleme Notu (Opsiyonel)</label>
              <input
                type="text"
                value={technicianNotes}
                onChange={(e) => setTechnicianNotes(e.target.value)}
                placeholder="Örn: Ön diskler incelmiş, balatalar bitik değişecek."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Kullanılacak Parçalar ve İşçilikler */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Kullanılacak Parçalar & İşçilik ({items.length})
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => addItem('PART')}
                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Package className="w-3.5 h-3.5" /> + Parça Ekle (Stoktan)
                </button>
                <button
                  type="button"
                  onClick={() => addItem('LABOR')}
                  className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Wrench className="w-3.5 h-3.5" /> + İşçilik Ekle
                </button>
              </div>
            </div>

            {items.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Henüz parça veya işçilik eklenmedi.</p>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs"
                  >
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      item.type === 'PART' ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {item.type === 'PART' ? 'PARÇA' : 'İŞÇİLİK'}
                    </span>

                    {/* Parça Seçimi veya İşçilik Adı */}
                    <div className="flex-1 w-full sm:w-auto">
                      {item.type === 'PART' ? (
                        <select
                          value={item.partId || ''}
                          onChange={(e) => updateItemPart(item.id, e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900 focus:outline-none"
                        >
                          {parts.map((p) => (
                            <option key={p.id} value={p.id}>
                              [{p.code}] {p.name} - Stok: {p.stockQuantity} {p.unit} ({formatCurrency(p.salePrice)})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItemName(item.id, e.target.value)}
                          placeholder="İşçilik açıklaması"
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900 focus:outline-none"
                        />
                      )}
                    </div>

                    {/* Miktar */}
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-slate-500">Adet:</span>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItemQty(item.id, Number(e.target.value))}
                        className="w-14 px-2 py-1.5 bg-white border border-slate-300 rounded text-xs text-center text-slate-900 font-mono focus:outline-none"
                      />
                    </div>

                    {/* Birim Fiyat */}
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-slate-500">Fiyat:</span>
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => updateItemPrice(item.id, Number(e.target.value))}
                        className="w-20 px-2 py-1.5 bg-white border border-slate-300 rounded text-xs text-right text-slate-900 font-mono focus:outline-none"
                      />
                    </div>

                    {/* Toplam */}
                    <div className="font-mono font-bold text-slate-900 shrink-0 min-w-[70px] text-right">
                      {formatCurrency(item.totalPrice)}
                    </div>

                    {/* Sil */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Kalemi Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fatura Toplamı & İskonto */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-medium">İskonto / İndirim (TL):</span>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-24 px-2 py-1.5 bg-white border border-slate-300 rounded text-slate-900 font-mono focus:outline-none"
              />
            </div>

            <div className="text-right space-y-0.5">
              <div className="text-slate-500 text-xs">
                Ara Toplam: <span className="font-mono font-bold text-slate-800">{formatCurrency(subtotal)}</span> + KDV (%20): <span className="font-mono font-bold text-slate-800">{formatCurrency(taxTotal)}</span>
              </div>
              <div className="text-base font-black text-blue-700">
                GENEL TOPLAM: {formatCurrency(grandTotal)}
              </div>
            </div>
          </div>

          {/* Alt Butonlar */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md shadow-blue-500/20 text-xs sm:text-sm flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Car className="w-4 h-4 stroke-[2.5]" />
              {loading ? 'Kaydediliyor...' : 'İş Emrini Başlat & Stoğu Düş'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
