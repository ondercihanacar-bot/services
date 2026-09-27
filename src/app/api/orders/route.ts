import { NextResponse } from 'next/server';
import { getServiceOrders, getServiceOrderById, createServiceOrder, updateServiceOrder } from '@/lib/db';
import { ServiceStatus } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId') || 'shop-1';
    const id = searchParams.get('id');

    if (id) {
      const order = getServiceOrderById(id);
      if (!order) {
        return NextResponse.json({ error: 'İş emri bulunamadı' }, { status: 404 });
      }
      return NextResponse.json(order);
    }

    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const orders = getServiceOrders(shopId, { status, search });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'İş emirleri yüklenemedi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const shopId = body.shopId || 'shop-1';

    if (!body.vehicleId || !body.customerId) {
      return NextResponse.json({ error: 'Araç ve Müşteri seçimi zorunludur' }, { status: 400 });
    }

    const items = body.items || [];
    let partsTotal = 0;
    let laborTotal = 0;
    let taxTotal = 0;

    for (const item of items) {
      const itemTotal = (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1);
      item.totalPrice = itemTotal;
      const vat = itemTotal * ((Number(item.vatRate) || 20) / 100);
      taxTotal += vat;

      if (item.type === 'PART') {
        partsTotal += itemTotal;
      } else {
        laborTotal += itemTotal;
      }
    }

    const discount = Number(body.discount) || 0;
    const subtotal = partsTotal + laborTotal;
    const grandTotal = Math.max(0, subtotal - discount + taxTotal);

    const order = createServiceOrder(shopId, {
      vehicleId: body.vehicleId,
      customerId: body.customerId,
      entryDate: body.entryDate || new Date().toISOString(),
      estimatedDeliveryDate: body.estimatedDeliveryDate,
      status: (body.status as ServiceStatus) || 'IN_PROGRESS',
      customerComplaint: body.customerComplaint || 'Genel bakım / arıza',
      technicianNotes: body.technicianNotes,
      assignedTechnician: body.assignedTechnician || 'Usta Atanmadı',
      kmAtEntry: Number(body.kmAtEntry) || 0,
      nextMaintenanceKm: body.nextMaintenanceKm ? Number(body.nextMaintenanceKm) : undefined,
      nextMaintenanceDate: body.nextMaintenanceDate,
      items,
      partsTotal,
      laborTotal,
      discount,
      taxTotal,
      grandTotal,
      fuelLevel: body.fuelLevel,
      damageNotes: body.damageNotes,
      intakePhotos: body.intakePhotos,
      extraApprovalStatus: body.extraApprovalStatus,
      extraApprovalNotes: body.extraApprovalNotes,
      extraApprovalAmount: body.extraApprovalAmount ? Number(body.extraApprovalAmount) : undefined,
      readyNotificationSent: body.readyNotificationSent,
      paymentStatus: body.paymentStatus || 'UNPAID',
      paymentMethod: body.paymentMethod,
      paidAmount: Number(body.paidAmount) || 0
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating service order:', error);
    return NextResponse.json({ error: 'İş emri oluşturulamadı' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'İş Emri ID zorunludur' }, { status: 400 });
    }

    if (updates.status === 'COMPLETED' && !updates.completionDate) {
      updates.completionDate = new Date().toISOString();
    }

    const updated = updateServiceOrder(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'İş emri bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating service order:', error);
    return NextResponse.json({ error: 'İş emri güncellenemedi' }, { status: 500 });
  }
}
