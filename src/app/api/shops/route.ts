import { NextResponse } from 'next/server';
import { getShops, createShop } from '@/lib/db';

export async function GET() {
  try {
    const shops = getShops();
    return NextResponse.json(shops);
  } catch (error) {
    console.error('Error fetching shops:', error);
    return NextResponse.json({ error: 'Dükkanlar yüklenemedi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.phone) {
      return NextResponse.json({ error: 'Dükkan adı ve telefon zorunludur' }, { status: 400 });
    }

    const shop = createShop({
      name: body.name,
      slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      phone: body.phone,
      email: body.email || '',
      city: body.city || 'İstanbul',
      district: body.district || 'Sanayi',
      address: body.address || '',
      taxNumber: body.taxNumber,
      taxOffice: body.taxOffice
    });

    return NextResponse.json(shop, { status: 201 });
  } catch (error) {
    console.error('Error creating shop:', error);
    return NextResponse.json({ error: 'Dükkan oluşturulamadı' }, { status: 500 });
  }
}
