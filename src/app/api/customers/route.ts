import { NextResponse } from 'next/server';
import { getCustomers } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId') || 'shop-1';

    const customers = getCustomers(shopId);
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Müşteriler yüklenemedi' }, { status: 500 });
  }
}
