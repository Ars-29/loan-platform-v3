import { NextRequest, NextResponse } from 'next/server';
import { redisCache } from '@/lib/redis';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
    const tpl = await redisCache.getSelection(userId);
    return NextResponse.json({ success: true, data: tpl });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, template } = body || {};
    if (!userId || !template) return NextResponse.json({ success: false, error: 'Missing payload' }, { status: 400 });
    await redisCache.setSelection(userId, template);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Server error' }, { status: 500 });
  }
}



