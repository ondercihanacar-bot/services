import { NextResponse } from 'next/server';
import { getParts, createPart, adjustPartStock, updatePart } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId') || 'shop-1';
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const lowStockOnly = searchParams.get('lowStockOnly') === 'true';

    const parts = getParts(shopId, { category, search, lowStockOnly });
    return NextResponse.json(parts);
  } catch (error) {
    console.error('Error fetching parts:', error);
    return NextResponse.json({ error: 'Parçalar yüklenemedi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const shopId = body.shopId || 'shop-1';

    if (!body.name || !body.code) {
      return NextResponse.json({ error: 'Parça adı ve parça/OEM kodu zorunludur' }, { status: 400 });
    }

    const part = createPart(shopId, {
      code: body.code.trim().toUpperCase(),
      barcode: body.barcode?.trim(),
      name: body.name.trim(),
      brand: body.brand?.trim() || 'Genel',
      category: body.category || 'Diğer',
      shelfLocation: body.shelfLocation?.trim() || 'Belirtilmedi',
      unit: body.unit || 'Adet',
      purchasePrice: Number(body.purchasePrice) || 0,
      salePrice: Number(body.salePrice) || 0,
      vatRate: Number(body.vatRate) || 20,
      stockQuantity: Number(body.stockQuantity) || 0,
      minStockLevel: Number(body.minStockLevel) || 3,
      compatibleVehicles: body.compatibleVehicles?.trim() || ''
    });

    return NextResponse.json(part, { status: 201 });
  } catch (error) {
    console.error('Error creating part:', error);
    return NextResponse.json({ error: 'Parça eklenemedi' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, shopId, action, quantity, type, notes, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Parça ID zorunludur' }, { status: 400 });
    }

    if (action === 'ADJUST_STOCK') {
      const part = adjustPartStock(
        shopId || 'shop-1',
        id,
        Number(quantity),
        type || 'DUZELTME',
        notes || 'Manuel stok güncelleme'
      );
      if (!part) {
        return NextResponse.json({ error: 'Parça bulunamadı' }, { status: 404 });
      }
      return NextResponse.json(part);
    }

    const updated = updatePart(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Parça bulunamadı' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating part:', error);
    return NextResponse.json({ error: 'Parça güncellenemedi' }, { status: 500 });
  }
}
