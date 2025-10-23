import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  console.log('🚨 MIDDLEWARE RUNNING FOR:', request.nextUrl.pathname);
  
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // TEMPORARILY DISABLED - Using getSession() which requires Pro plan
  // const {
  //   data: { session },
  // } = await supabase.auth.getSession();

  // Protected routes
  const protectedRoutes = ['/customizer', '/admin', '/api/auth'];
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  // Public routes that redirect authenticated users
  const publicRoutes = ['/auth', '/login', '/register', '/forgot-password'];
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  // TEMPORARILY DISABLED - Let client-side handle auth
  // Redirect unauthenticated users from protected routes
  // if (isProtectedRoute && !session) {
  //   return NextResponse.redirect(new URL('/auth', request.url));
  // }

  // // Redirect authenticated users from public auth routes
  // if (isPublicRoute && session) {
  //   return NextResponse.redirect(new URL('/dashboard', request.url));
  // }

  // API route protection - TEMPORARILY DISABLED
  // if (request.nextUrl.pathname.startsWith('/api/') && !request.nextUrl.pathname.startsWith('/api/auth')) {
  //   if (!session) {
  //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  //   }
  // }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};