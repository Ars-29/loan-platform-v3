import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { redisCache } from '@/lib/redis';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, serviceKey);

function toEtag(userId: string, lastLoginAt: string | null) {
  const base = `${userId}:${lastLoginAt ?? 'nover'}`;
  return `"${Buffer.from(base).toString('base64')}"`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
    }

    // Try Redis first
    const cached = await redisCache.getProfile<any>(userId);
    if (cached) {
      const etag = toEtag(userId, cached?.profile?.lastLoginAt ?? null);
      const inm = req.headers.get('if-none-match');
      if (inm === etag) {
        return new NextResponse(null, { status: 304, headers: { ETag: etag, 'Cache-Control': 'private, max-age=0, stale-while-revalidate=60' } });
      }
      const res = NextResponse.json({ success: true, data: cached });
      res.headers.set('ETag', etag);
      res.headers.set('Cache-Control', 'private, max-age=0, stale-while-revalidate=60');
      return res;
    }

    // Build profile from DB
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, phone, avatar, last_login_at')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const { data: companyData } = await supabase
      .from('user_companies')
      .select('role, companies!inner(id, name, logo, website, phone, email)')
      .eq('user_id', userId)
      .eq('is_active', true)
      .limit(1)
      .single();

    const isOnline = userData.last_login_at
      ? new Date(userData.last_login_at).getTime() > (Date.now() - 5 * 60 * 1000)
      : false;

    const profile = {
      id: userData.id,
      firstName: userData.first_name || userData.email?.split('@')[0] || 'User',
      lastName: userData.last_name || 'Smith',
      email: userData.email,
      phone: userData.phone || null,
      avatar: userData.avatar,
      nmlsNumber: null,
      title: null,
      company: companyData?.companies ? {
        id: (companyData.companies as any).id,
        name: (companyData.companies as any).name,
        logo: (companyData.companies as any).logo,
        website: (companyData.companies as any).website,
        phone: (companyData.companies as any).phone,
        email: (companyData.companies as any).email,
      } : undefined,
      isOnline,
      lastLoginAt: userData.last_login_at,
    };

    const payload = {
      profile,
      userId,
      userEmail: userData.email,
      cachedAt: new Date().toISOString(),
      lastLoginAt: profile.lastLoginAt,
    };

    await redisCache.setProfile(userId, payload);
    const etag = toEtag(userId, profile.lastLoginAt);
    const res = NextResponse.json({ success: true, data: payload });
    res.headers.set('ETag', etag);
    res.headers.set('Cache-Control', 'private, max-age=0, stale-while-revalidate=60');
    return res;
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Server error' }, { status: 500 });
  }
}


