export interface Shop {
  id: string;
  name: string;
  slug: string;
  phone: string;
  email: string;
  city: string;
  district: string;
  address: string;
  taxNumber?: string;
  taxOffice?: string;
  iban?: string; // Servis Banka IBAN No
  bankName?: string; // Banka Adı (örn: Garanti BBVA)
  accountHolder?: string; // Hesap Sahibi
  createdAt: string;
}

export interface Customer {
  id: string;
  shopId: string;
  fullName: string;
  phone: string;
  secondaryPhone?: string;
  tcNo?: string; // TC Kimlik No veya Vergi No
  email?: string;
  city?: string;
  address?: string;
  notes?: string;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  shopId: string;
  customerId: string;
  plate: string; // Örn: 34 ABC 123
  brand: string; // Örn: Renault
  model: string; // Örn: Megane IV 1.5 dCi
  year: number; // Örn: 2020
  chassisNo?: string; // VIN
  engineNo?: string;
  fuelType: 'Benzin' | 'Dizel' | 'LPG' | 'Hibrit' | 'Elektrik';
  transmission: 'Manuel' | 'Otomatik' | 'Yarı Otomatik';
  currentKm: number;
  color?: string;
  inspectionDate?: string; // TÜVTÜRK Muayene Geçerlilik Tarihi (YYYY-MM-DD)
  lastMaintenanceDate?: string;
  lastMaintenanceKm?: number;
  notes?: string;
  createdAt: string;
}

export interface Part {
  id: string;
  shopId: string;
  code: string; // OEM veya Parça Kodu (Örn: 7701479159)
  barcode?: string;
  name: string; // Örn: Ön Fren Balata Takımı
  brand: string; // Örn: Bosch, Valeo, Castrol
  category: string; // Örn: Fren Sistemi, Motor Yağları, Filtreler, vb.
  shelfLocation?: string; // Örn: Raf A-3, Kutu 12
  unit: 'Adet' | 'Litre' | 'Takım' | 'Metre';
  purchasePrice: number; // Alış Fiyatı (TL)
  salePrice: number; // Satış Fiyatı (TL)
  vatRate: number; // KDV % (örn: 20)
  stockQuantity: number; // Mevcut Stok
  minStockLevel: number; // Kritik Stok Sınırı
  compatibleVehicles?: string; // Uyumlu Araçlar
  createdAt: string;
}

export type ServiceStatus =
  | 'PENDING' // Beklemede / Sıraya Alındı
  | 'DIAGNOSIS' // Ekspertiz / Arıza Tespiti
  | 'WAITING_PARTS' // Parça Bekleniyor
  | 'IN_PROGRESS' // Tamirde / Liftte
  | 'TESTING' // Test Sürüşü & Kontrol
  | 'READY' // Hazır / Müşteri Bilgilendirildi
  | 'COMPLETED' // Teslim Edildi
  | 'CANCELLED'; // İptal Edildi

export interface ServiceItem {
  id: string;
  type: 'PART' | 'LABOR';
  partId?: string; // Eğer stoktaki parçaysa
  name: string; // Parça adı veya İşçilik adı (Örn: Yağ Filtresi veya Ön Takım İşçiliği)
  quantity: number;
  unitPrice: number;
  vatRate: number;
  totalPrice: number;
}

export interface ServiceOrder {
  id: string;
  orderNo: string; // Örn: IS-2026-0001
  shopId: string;
  vehicleId: string;
  customerId: string;
  entryDate: string;
  estimatedDeliveryDate?: string;
  completionDate?: string;
  status: ServiceStatus;
  customerComplaint: string; // Müşteri Şikayeti / İstek
  technicianNotes?: string; // Usta Teşhis Notları
  assignedTechnician?: string; // Sorumlu Usta
  kmAtEntry: number; // Servise Giriş KM
  nextMaintenanceKm?: number; // Bir sonraki bakım KM (örn: +10.000)
  nextMaintenanceDate?: string;
  serviceType?: 'PERIYODIK_BAKIM' | 'MEKANIK_ONARIM' | 'AGIR_BAKIM' | 'FREN_SISTEMI' | 'ELEKTRIK_ELEKTRONIK' | 'KAPORTA_BOYA' | 'GENEL_KONTROL';
  // Fotoğraflı Giriş Ekspertiz & Hasar Tespiti
  fuelLevel?: 'EMPTY' | 'QUARTER' | 'HALF' | 'THREE_QUARTERS' | 'FULL';
  damageNotes?: string; // Kaporta çizik, göçük ve mevcut hasar notları
  intakePhotos?: string[]; // Araç kabul fotoğrafları (Base64 veya URL)
  // Usta Ekstra Parça / Masraf Onayı
  extraApprovalStatus?: 'NONE' | 'REQUESTED' | 'APPROVED' | 'REJECTED';
  extraApprovalNotes?: string;
  extraApprovalAmount?: number;
  // Teslim & Hazır Bildirimi
  readyNotificationSent?: boolean;
  readyNotificationSentAt?: string;
  reminderSent?: boolean;
  reminderSentAt?: string;
  items: ServiceItem[];
  partsTotal: number;
  laborTotal: number;
  discount: number;
  taxTotal: number;
  grandTotal: number;
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID';
  paymentMethod?: 'NAKIT' | 'KREDI_KARTI' | 'HAVALE_EFT' | 'VERESIYE_CARI';
  paidAmount: number;
  createdAt: string;
}

export interface StockMovement {
  id: string;
  shopId: string;
  partId: string;
  partName: string;
  type: 'GIRIS' | 'SERVIS_CIKIS' | 'SATIS_CIKIS' | 'DUZELTME';
  quantity: number;
  serviceOrderId?: string;
  notes?: string;
  createdAt: string;
}

export type UserRole = 'ADMIN' | 'USER';

export type AppMenuItem =
  | 'dashboard'
  | 'orders'
  | 'inventory'
  | 'vehicles'
  | 'accounts'
  | 'reminders'
  | 'reports'
  | 'settings';

export interface User {
  id: string;
  shopId: string;
  username: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: UserRole;
  passwordHash: string;
  allowedMenus: AppMenuItem[];
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AppDatabase {
  shops: Shop[];
  customers: Customer[];
  vehicles: Vehicle[];
  parts: Part[];
  serviceOrders: ServiceOrder[];
  stockMovements: StockMovement[];
  users: User[];
}
