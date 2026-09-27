import { NextResponse } from 'next/server';
import { getShopStats } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId') || 'shop-1';

    const stats = getShopStats(shopId);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'İstatistikler yüklenemedi' }, { status: 500 });
  }
}
