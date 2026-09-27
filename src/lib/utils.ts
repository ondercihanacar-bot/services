import { ServiceStatus } from '../types/index';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatDateOnly(dateString: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatPlate(plate: string): string {
  if (!plate) return '';
  return plate.trim().toUpperCase();
}

export const STATUS_LABELS: Record<ServiceStatus, { label: string; color: string; bg: string; border: string }> = {
  PENDING: {
    label: 'Sırada / Beklemede',
    color: 'text-amber-800',
    bg: 'bg-amber-50',
    border: 'border-amber-200'
  },
  DIAGNOSIS: {
    label: 'Teşhis & Ekspertiz',
    color: 'text-indigo-800',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200'
  },
  WAITING_PARTS: {
    label: 'Parça Bekleniyor',
    color: 'text-orange-800',
    bg: 'bg-orange-50',
    border: 'border-orange-200'
  },
  IN_PROGRESS: {
    label: 'Tamirde / Liftte',
    color: 'text-blue-800',
    bg: 'bg-blue-50',
    border: 'border-blue-200'
  },
  TESTING: {
    label: 'Test & Son Kontrol',
    color: 'text-purple-800',
    bg: 'bg-purple-50',
    border: 'border-purple-200'
  },
  READY: {
    label: 'Hazır (Teslim Bekliyor)',
    color: 'text-emerald-800',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200'
  },
  COMPLETED: {
    label: 'Teslim Edildi',
    color: 'text-slate-700',
    bg: 'bg-slate-100',
    border: 'border-slate-200'
  },
  CANCELLED: {
    label: 'İptal Edildi',
    color: 'text-rose-800',
    bg: 'bg-rose-50',
    border: 'border-rose-200'
  }
};

export const SERVICE_TYPE_LABELS: Record<string, string> = {
  PERIYODIK_BAKIM: 'Periyodik Bakım',
  MEKANIK_ONARIM: 'Mekanik Onarım',
  AGIR_BAKIM: 'Ağır Bakım (Triger/Debriyaj)',
  FREN_SISTEMI: 'Fren Sistemi',
  ELEKTRIK_ELEKTRONIK: 'Elektrik & Elektronik',
  KAPORTA_BOYA: 'Kaporta & Boya',
  GENEL_KONTROL: 'Genel Kontrol & Check-up'
};

export function cleanPhoneNumber(phone: string): string {
  if (!phone) return '';
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) {
    clean = '90' + clean.slice(1);
  } else if (clean.startsWith('5')) {
    clean = '90' + clean;
  }
  return clean;
}

export function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = cleanPhoneNumber(phone);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

export const FUEL_LEVEL_LABELS: Record<string, string> = {
  EMPTY: 'Rezerv / Boş Depo',
  QUARTER: '1/4 Çeyrek Depo',
  HALF: '1/2 Yarım Depo',
  THREE_QUARTERS: '3/4 Üç Çeyrek Depo',
  FULL: 'Dolu Depo (Tam)'
};

export function generateReadyWhatsAppMessage(params: {
  customerName: string;
  plate: string;
  brandModel: string;
  orderNo: string;
  grandTotal: number;
  remainingAmount: number;
  shopName: string;
  shopPhone: string;
  shopAddress: string;
}): string {
  const remainingText = params.remainingAmount > 0
    ? `Kalan Ödeme Tutarı: ${formatCurrency(params.remainingAmount)}`
    : 'Ödemesi Tamamlanmıştır';

  return `*Sayın ${params.customerName}*,

Aracınızın servis işlem ve kontrolleri tamamlanmıştır.

🚗 *Araç:* ${params.plate} (${params.brandModel})
📋 *İş Emri No:* ${params.orderNo}
💰 *Toplam Tutar:* ${formatCurrency(params.grandTotal)} (${remainingText})

Aracınızı dilediğiniz zaman servisimizden teslim alabilirsiniz.

📍 *${params.shopName}*
📞 *İletişim:* ${params.shopPhone}
🏢 *Adres:* ${params.shopAddress}

Bizi tercih ettiğiniz için teşekkür eder, iyi yolculuklar dileriz!`;
}

export function generateExtraApprovalWhatsAppMessage(params: {
  customerName: string;
  plate: string;
  brandModel: string;
  discoveredFault: string;
  technicianAdvice: string;
  estimatedCost: number;
  shopName: string;
  shopPhone: string;
}): string {
  return `⚠️ *ONAY TALEBİ / EKSTRA İŞLEM BİLGİLENDİRMESİ*

*Sayın ${params.customerName}*,
${params.plate} (${params.brandModel}) plakalı aracınız servisimizde işlem görürken aşağıdaki durum tespit edilmiştir:

🔧 *Tespit Edilen Arıza / Değişecek Parça:*
${params.discoveredFault}

📝 *Usta Tavsiyesi & Gerekçe:*
${params.technicianAdvice}

💵 *Tahmini Ek Maliyet:* ${formatCurrency(params.estimatedCost)}

Bu işlemi onaylamanız durumunda derhal parçanın teminine ve montajına başlanacaktır.
Lütfen işleme devam edebilmemiz için bu mesaja *ONAYLIYORUM* veya *ONAYLAMIYORUM* şeklinde yanıt veriniz.

🏢 *${params.shopName}*
📞 *İletişim:* ${params.shopPhone}`;
}

export function generateAccountStatementWhatsAppMessage(params: {
  customerName: string;
  totalDebt: number;
  plateList: string[];
  shopName: string;
  shopIban?: string;
  bankName?: string;
  accountHolder?: string;
  shopPhone: string;
}): string {
  const ibanText = params.shopIban
    ? `\n💳 *Banka:* ${params.bankName || 'Banka Hesabımız'}\n🏦 *IBAN:* ${params.shopIban}\n👤 *Hesap Sahibi:* ${params.accountHolder || params.shopName}`
    : '';

  return `*Sayın ${params.customerName}*,

${params.shopName} nezdindeki güncel cari hesap bakiye durumunuz aşağıda bilgilerinize sunulmuştur:

🚗 *İlgili Araç(lar):* ${params.plateList.join(', ')}
💰 *Toplam Açık Hesap / Kalan Bakiye:* *${formatCurrency(params.totalDebt)}*
${ibanText}

Ödemenizi gerçekleştirdikten sonra dekontu bu mesaj üzerinden iletmenizi rica eder, iş ortaklığınız için teşekkür ederiz.

🏢 *${params.shopName}*
📞 *İletişim:* ${params.shopPhone}`;
}

