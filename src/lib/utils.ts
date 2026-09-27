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
