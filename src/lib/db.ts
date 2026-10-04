import fs from 'fs';
import path from 'path';
import { AppDatabase, Shop, Customer, Vehicle, Part, ServiceOrder, StockMovement, User } from '../types/index';
import { initialData } from './initialData';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function ensureDbFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

export function readDb(): AppDatabase {
  ensureDbFile();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const db = JSON.parse(raw) as AppDatabase;
    if (!Array.isArray(db.users) || db.users.length === 0) {
      db.users = initialData.users || [];
      writeDb(db);
    }
    return db;
  } catch (error) {
    console.error('Error reading db.json, falling back to initial data:', error);
    return initialData;
  }
}

export function writeDb(data: AppDatabase): void {
  ensureDbFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// ----------------- SHOP OPERATIONS -----------------
export function getShops(): Shop[] {
  return readDb().shops;
}

export function getShopById(id: string): Shop | undefined {
  return readDb().shops.find((s) => s.id === id);
}

export function createShop(shopData: Omit<Shop, 'id' | 'createdAt'>): Shop {
  const db = readDb();
  const newShop: Shop = {
    ...shopData,
    id: `shop-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  db.shops.push(newShop);
  writeDb(db);
  return newShop;
}

// ----------------- VEHICLE & CUSTOMER OPERATIONS -----------------
export function getVehicles(shopId: string, searchPlate?: string): (Vehicle & { customer?: Customer })[] {
  const db = readDb();
  let vehicles = db.vehicles.filter((v) => v.shopId === shopId);
  
  if (searchPlate && searchPlate.trim() !== '') {
    const cleanSearch = searchPlate.trim().toUpperCase().replace(/\s+/g, '');
    vehicles = vehicles.filter((v) => v.plate.replace(/\s+/g, '').toUpperCase().includes(cleanSearch));
  }

  return vehicles.map((v) => ({
    ...v,
    customer: db.customers.find((c) => c.id === v.customerId)
  }));
}

export function getVehicleByPlate(shopId: string, plate: string): (Vehicle & { customer?: Customer }) | undefined {
  const db = readDb();
  const clean = plate.trim().toUpperCase().replace(/\s+/g, '');
  const v = db.vehicles.find((veh) => veh.shopId === shopId && veh.plate.replace(/\s+/g, '').toUpperCase() === clean);
  if (!v) return undefined;
  return {
    ...v,
    customer: db.customers.find((c) => c.id === v.customerId)
  };
}

export function createVehicle(
  shopId: string,
  vehicleData: Omit<Vehicle, 'id' | 'shopId' | 'createdAt'>,
  customerData?: { fullName: string; phone: string; address?: string }
): Vehicle {
  const db = readDb();
  let customerId = vehicleData.customerId;

  if (customerData && customerData.fullName) {
    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      shopId,
      fullName: customerData.fullName,
      phone: customerData.phone,
      address: customerData.address,
      createdAt: new Date().toISOString()
    };
    db.customers.push(newCustomer);
    customerId = newCustomer.id;
  }

  const newVehicle: Vehicle = {
    ...vehicleData,
    id: `veh-${Date.now()}`,
    shopId,
    customerId,
    plate: vehicleData.plate.trim().toUpperCase(),
    createdAt: new Date().toISOString()
  };

  db.vehicles.push(newVehicle);
  writeDb(db);
  return newVehicle;
}

export function getCustomers(shopId: string): Customer[] {
  return readDb().customers.filter((c) => c.shopId === shopId);
}

// ----------------- PART / INVENTORY OPERATIONS -----------------
export function getParts(shopId: string, options?: { search?: string; category?: string; lowStockOnly?: boolean }): Part[] {
  const db = readDb();
  let parts = db.parts.filter((p) => p.shopId === shopId);

  if (options?.category && options.category !== 'ALL') {
    parts = parts.filter((p) => p.category === options.category);
  }

  if (options?.lowStockOnly) {
    parts = parts.filter((p) => p.stockQuantity <= p.minStockLevel);
  }

  if (options?.search && options.search.trim()) {
    const q = options.search.trim().toLowerCase();
    parts = parts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.toLowerCase().includes(q))
    );
  }

  return parts;
}

export function createPart(shopId: string, partData: Omit<Part, 'id' | 'shopId' | 'createdAt'>): Part {
  const db = readDb();
  const newPart: Part = {
    ...partData,
    id: `part-${Date.now()}`,
    shopId,
    createdAt: new Date().toISOString()
  };

  db.parts.push(newPart);

  // Initial stock movement
  if (newPart.stockQuantity > 0) {
    db.stockMovements.push({
      id: `mov-${Date.now()}`,
      shopId,
      partId: newPart.id,
      partName: newPart.name,
      type: 'GIRIS',
      quantity: newPart.stockQuantity,
      notes: 'İlk stok girişi (Yeni parça kartı)',
      createdAt: new Date().toISOString()
    });
  }

  writeDb(db);
  return newPart;
}

export function updatePart(id: string, updates: Partial<Part>): Part | null {
  const db = readDb();
  const idx = db.parts.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  db.parts[idx] = { ...db.parts[idx], ...updates };
  writeDb(db);
  return db.parts[idx];
}

export function adjustPartStock(
  shopId: string,
  partId: string,
  quantityChange: number,
  type: StockMovement['type'],
  notes?: string
): Part | null {
  const db = readDb();
  const part = db.parts.find((p) => p.id === partId && p.shopId === shopId);
  if (!part) return null;

  part.stockQuantity = Math.max(0, part.stockQuantity + quantityChange);

  db.stockMovements.push({
    id: `mov-${Date.now()}`,
    shopId,
    partId: part.id,
    partName: part.name,
    type,
    quantity: Math.abs(quantityChange),
    notes,
    createdAt: new Date().toISOString()
  });

  writeDb(db);
  return part;
}

// ----------------- SERVICE ORDER OPERATIONS -----------------
export type EnrichedServiceOrder = ServiceOrder & {
  vehicle?: Vehicle;
  customer?: Customer;
};

export function getServiceOrders(
  shopId: string,
  filter?: { status?: string; search?: string }
): EnrichedServiceOrder[] {
  const db = readDb();
  let orders = db.serviceOrders.filter((o) => o.shopId === shopId);

  if (filter?.status && filter.status !== 'ALL') {
    orders = orders.filter((o) => o.status === filter.status);
  }

  const enriched = orders.map((o) => {
    const vehicle = db.vehicles.find((v) => v.id === o.vehicleId);
    const customer = db.customers.find((c) => c.id === o.customerId);
    return { ...o, vehicle, customer };
  });

  if (filter?.search && filter.search.trim()) {
    const q = filter.search.trim().toLowerCase();
    return enriched.filter(
      (o) =>
        o.orderNo.toLowerCase().includes(q) ||
        (o.vehicle && o.vehicle.plate.toLowerCase().replace(/\s+/g, '').includes(q.replace(/\s+/g, ''))) ||
        (o.customer && o.customer.fullName.toLowerCase().includes(q)) ||
        (o.customer && o.customer.phone.includes(q))
    );
  }

  // En son oluşturulan en üstte
  return enriched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getServiceOrderById(id: string): EnrichedServiceOrder | null {
  const db = readDb();
  const o = db.serviceOrders.find((ord) => ord.id === id);
  if (!o) return null;
  const vehicle = db.vehicles.find((v) => v.id === o.vehicleId);
  const customer = db.customers.find((c) => c.id === o.customerId);
  return { ...o, vehicle, customer };
}

export function createServiceOrder(
  shopId: string,
  orderData: Omit<ServiceOrder, 'id' | 'orderNo' | 'shopId' | 'createdAt'>
): ServiceOrder {
  const db = readDb();
  const currentYear = new Date().getFullYear();
  const countThisYear = db.serviceOrders.filter((o) => o.shopId === shopId).length + 1;
  const orderNo = `ISEMR-${currentYear}-${String(countThisYear).padStart(4, '0')}`;

  const newOrder: ServiceOrder = {
    ...orderData,
    id: `srv-${Date.now()}`,
    orderNo,
    shopId,
    createdAt: new Date().toISOString()
  };

  // Stok düşme işlemi: İş emrindeki parçalar için stok azaltılır
  for (const item of newOrder.items) {
    if (item.type === 'PART' && item.partId) {
      const part = db.parts.find((p) => p.id === item.partId && p.shopId === shopId);
      if (part) {
        part.stockQuantity = Math.max(0, part.stockQuantity - item.quantity);
        db.stockMovements.push({
          id: `mov-${Date.now()}-${item.partId}`,
          shopId,
          partId: part.id,
          partName: part.name,
          type: 'SERVIS_CIKIS',
          quantity: item.quantity,
          serviceOrderId: newOrder.id,
          notes: `${newOrder.orderNo} nolu iş emri için parça kullanımı`,
          createdAt: new Date().toISOString()
        });
      }
    }
  }

  // Aracın mevcut kilometresini güncelle
  const vehicle = db.vehicles.find((v) => v.id === newOrder.vehicleId);
  if (vehicle && newOrder.kmAtEntry > vehicle.currentKm) {
    vehicle.currentKm = newOrder.kmAtEntry;
  }

  db.serviceOrders.push(newOrder);
  writeDb(db);
  return newOrder;
}

export function updateServiceOrder(
  id: string,
  updates: Partial<ServiceOrder>
): ServiceOrder | null {
  const db = readDb();
  const idx = db.serviceOrders.findIndex((o) => o.id === id);
  if (idx === -1) return null;

  db.serviceOrders[idx] = { ...db.serviceOrders[idx], ...updates };
  writeDb(db);
  return db.serviceOrders[idx];
}

// ----------------- DASHBOARD / STATS -----------------
export function getShopStats(shopId: string) {
  const db = readDb();
  const orders = db.serviceOrders.filter((o) => o.shopId === shopId);
  const parts = db.parts.filter((p) => p.shopId === shopId);
  const vehicles = db.vehicles.filter((v) => v.shopId === shopId);

  const activeInService = orders.filter((o) =>
    ['PENDING', 'DIAGNOSIS', 'WAITING_PARTS', 'IN_PROGRESS', 'TESTING'].includes(o.status)
  ).length;

  const readyForDelivery = orders.filter((o) => o.status === 'READY').length;
  const completedCount = orders.filter((o) => o.status === 'COMPLETED').length;

  const lowStockParts = parts.filter((p) => p.stockQuantity <= p.minStockLevel);

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + o.grandTotal, 0);

  const pendingReceivables = orders
    .filter((o) => o.paymentStatus !== 'PAID')
    .reduce((sum, o) => sum + (o.grandTotal - (o.paidAmount || 0)), 0);

  return {
    activeInService,
    readyForDelivery,
    completedCount,
    totalVehicles: vehicles.length,
    totalParts: parts.length,
    lowStockCount: lowStockParts.length,
    lowStockParts: lowStockParts.slice(0, 5),
    totalRevenue,
    pendingReceivables,
    recentOrders: orders.slice(-5).reverse()
  };
}

// ----------------- USER OPERATIONS -----------------
export function getUsers(shopId?: string): User[] {
  const db = readDb();
  if (shopId) {
    return db.users.filter((u) => u.shopId === shopId);
  }
  return db.users;
}

export function getUserById(id: string): User | undefined {
  const db = readDb();
  return db.users.find((u) => u.id === id);
}

export function getUserByUsername(username: string): User | undefined {
  const db = readDb();
  const clean = username.trim().toLowerCase();
  return db.users.find((u) => u.username.toLowerCase() === clean);
}

export function createUser(
  shopId: string,
  userData: Omit<User, 'id' | 'shopId' | 'createdAt'>
): User {
  const db = readDb();
  const newUser: User = {
    ...userData,
    id: `usr-${Date.now()}`,
    shopId,
    createdAt: new Date().toISOString()
  };
  db.users.push(newUser);
  writeDb(db);
  return newUser;
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const db = readDb();
  const idx = db.users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  db.users[idx] = { ...db.users[idx], ...updates, updatedAt: new Date().toISOString() };
  writeDb(db);
  return db.users[idx];
}

export function deleteUser(id: string): boolean {
  const db = readDb();
  const initialLength = db.users.length;
  // Admin kullanıcısının yanlışlıkla silinmesini engelle
  const userToDelete = db.users.find((u) => u.id === id);
  if (!userToDelete || userToDelete.username === 'admin') {
    return false;
  }
  db.users = db.users.filter((u) => u.id !== id);
  if (db.users.length !== initialLength) {
    writeDb(db);
    return true;
  }
  return false;
}

export function updateShop(id: string, updates: Partial<Shop>): Shop | null {
  const db = readDb();
  const idx = db.shops.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  db.shops[idx] = { ...db.shops[idx], ...updates };
  writeDb(db);
  return db.shops[idx];
}

