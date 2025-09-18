import { NextRequest, NextResponse } from 'next/server';
import { redisCache } from '@/lib/redis';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const slug = searchParams.get('slug');
    if (!userId || !slug) {
      return NextResponse.json({ success: false, error: 'Missing userId or slug' }, { status: 400 });
    }
    const data = await redisCache.getTemplate(userId, slug);
    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, slug, data } = body || {};
    if (!userId || !slug || !data) {
      return NextResponse.json({ success: false, error: 'Missing payload' }, { status: 400 });
    }
    await redisCache.setTemplate(userId, slug, data);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const slug = searchParams.get('slug');
    if (!userId || !slug) {
      return NextResponse.json({ success: false, error: 'Missing userId or slug' }, { status: 400 });
    }
    await redisCache.delete(redisCache.getTemplateKey(userId, slug));
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Server error' }, { status: 500 });
  }
}



