import { NextResponse } from 'next/server';
import { getVehicles, getVehicleByPlate, createVehicle } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId') || 'shop-1';
    const plate = searchParams.get('plate');

    if (plate) {
      const vehicle = getVehicleByPlate(shopId, plate);
      if (!vehicle) {
        return NextResponse.json({ error: 'Araç bulunamadı' }, { status: 404 });
      }
      return NextResponse.json(vehicle);
    }

    const search = searchParams.get('search') || undefined;
    const vehicles = getVehicles(shopId, search);
    return NextResponse.json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json({ error: 'Araçlar yüklenemedi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const shopId = body.shopId || 'shop-1';

    if (!body.plate || !body.brand || !body.model) {
      return NextResponse.json({ error: 'Plaka, marka ve model zorunludur' }, { status: 400 });
    }

    const existing = getVehicleByPlate(shopId, body.plate);
    if (existing) {
      return NextResponse.json({ error: 'Bu plaka zaten kayıtlı!', vehicle: existing }, { status: 409 });
    }

    const vehicle = createVehicle(
      shopId,
      {
        customerId: body.customerId || '',
        plate: body.plate.trim().toUpperCase(),
        brand: body.brand.trim(),
        model: body.model.trim(),
        year: Number(body.year) || new Date().getFullYear(),
        chassisNo: body.chassisNo?.trim().toUpperCase(),
        engineNo: body.engineNo?.trim().toUpperCase(),
        fuelType: body.fuelType || 'Dizel',
        transmission: body.transmission || 'Manuel',
        currentKm: Number(body.currentKm) || 0,
        color: body.color?.trim() || 'Beyaz',
        notes: body.notes?.trim()
      },
      body.customer
        ? {
            fullName: body.customer.fullName,
            phone: body.customer.phone,
            address: body.customer.address
          }
        : undefined
    );

    return NextResponse.json(vehicle, { status: 201 });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    return NextResponse.json({ error: 'Araç kaydedilemedi' }, { status: 500 });
  }
}
