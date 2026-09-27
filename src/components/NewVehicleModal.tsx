'use client';

import React, { useState } from 'react';
import { Car, X, AlertCircle } from 'lucide-react';

interface NewVehicleModalProps {
  onClose: () => void;
  onSubmit: (vehicleData: any) => Promise<void>;
}

export default function NewVehicleModal({
  onClose,
  onSubmit
}: NewVehicleModalProps) {
  const [plate, setPlate] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [currentKm, setCurrentKm] = useState(120000);
  const [fuelType, setFuelType] = useState('Dizel');
  const [transmission, setTransmission] = useState('Manuel');
  const [chassisNo, setChassisNo] = useState('');
  const [color, setColor] = useState('Beyaz');

  // Müşteri bilgileri
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate.trim() || !brand.trim() || !model.trim()) {
      setError('Lütfen plaka, marka ve model alanlarını doldurun.');
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      setError('Lütfen müşteri adı ve telefon numarasını doldurun.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit({
        plate: plate.trim().toUpperCase(),
        brand: brand.trim(),
        model: model.trim(),
        year: Number(year),
        currentKm: Number(currentKm),
        fuelType,
        transmission,
        chassisNo: chassisNo.trim().toUpperCase() || undefined,
        color: color.trim() || undefined,
        customer: {
          fullName: customerName.trim(),
          phone: customerPhone.trim(),
          address: customerAddress.trim() || undefined
        }
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Araç kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto text-slate-900">
        
        {/* Başlık */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-blue-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Yeni Araç & Müşteri Kaydı</h2>
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

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
          
          {/* Müşteri Bilgileri */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-3">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block">
              1. Müşteri (Araç Sahibi) Bilgileri
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-600 font-medium block mb-1">Müşteri Ad Soyad *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ahmet Yılmaz"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-medium"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Telefon Numarası *</label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="0532 111 22 33"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-600 font-medium block mb-1">Adres / Not (Opsiyonel)</label>
              <input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Örn: Başakşehir 4. Etap, Şirket Yetkilisi"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Araç Bilgileri */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-3">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block">
              2. Araç Bilgileri
            </span>

            <div>
              <label className="text-slate-600 font-medium block mb-1">Plaka *</label>
              <input
                type="text"
                required
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                placeholder="34 ABC 123"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono font-bold tracking-wider text-base focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-600 font-medium block mb-1">Marka *</label>
                <input
                  type="text"
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Volkswagen, Renault..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Model & Paket *</label>
                <input
                  type="text"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Passat 1.6 TDI..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-slate-600 font-medium block mb-1">Model Yılı</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-600 font-medium block mb-1">Güncel KM</label>
                <input
                  type="number"
                  value={currentKm}
                  onChange={(e) => setCurrentKm(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-slate-900 font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-600 font-medium block mb-1">Renk</label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="Beyaz, Gri..."
                  className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-600 font-medium block mb-1">Yakıt Türü</label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none"
                >
                  <option value="Dizel">Dizel</option>
                  <option value="Benzin">Benzin</option>
                  <option value="LPG">LPG / Benzin</option>
                  <option value="Hibrit">Hibrit</option>
                  <option value="Elektrik">Elektrik</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Vites Tipi</label>
                <select
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none"
                >
                  <option value="Manuel">Manuel</option>
                  <option value="Otomatik">Otomatik</option>
                  <option value="Yarı Otomatik">Yarı Otomatik</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-600 font-medium block mb-1">Şasi No (VIN - Opsiyonel)</label>
              <input
                type="text"
                value={chassisNo}
                onChange={(e) => setChassisNo(e.target.value.toUpperCase())}
                placeholder="17 Haneli Şasi Numarası"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 font-mono focus:outline-none"
              />
            </div>

          </div>

          {/* Alt Butonlar */}
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
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md shadow-blue-500/20 text-xs sm:text-sm transition-all disabled:opacity-50"
            >
              {loading ? 'Kaydediliyor...' : 'Aracı Sisteme Ekle'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
