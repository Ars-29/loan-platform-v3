'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function TestRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log('❌ No user found, redirecting to /auth');
          router.push('/auth');
          return;
        }

        console.log('✅ User found:', user.email);

        // Get user role from database
        const { data: userData, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('❌ Error fetching user role:', error);
          router.push('/auth');
          return;
        }

        console.log('✅ User role:', userData.role);

        // Redirect based on role
        if (userData.role === 'super_admin') {
          console.log('🔄 Redirecting to /admin/companies');
          router.push('/admin/companies');
        } else if (userData.role === 'company_admin') {
          console.log('🔄 Redirecting to /admin/employees');
          router.push('/admin/employees');
        } else {
          console.log('🔄 Redirecting to /officers/dashboard (default)');
          router.push('/officers/dashboard');
        }
      } catch (error) {
        console.error('❌ Error in checkUserAndRedirect:', error);
        router.push('/auth');
      }
    };

    checkUserAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Checking user and redirecting...</p>
        <p className="text-sm text-gray-500">Check console for details</p>
      </div>
    </div>
  );
}
