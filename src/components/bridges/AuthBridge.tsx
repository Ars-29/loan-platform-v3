'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase/client';
import { useAppDispatch } from '@/store/hooks';
import { setSession, clearSession } from '@/store/slices/authSlice';
import { templateApi } from '@/store/apis/templateApi';

export default function AuthBridge() {
  const dispatch = useAppDispatch();
  const { user, userRole, companyId, loading } = useAuth();

  useEffect(() => {
    let cancelled = false;

    const syncSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const accessToken = session?.access_token || null;

        if (cancelled) return;

        if (user && accessToken) {
          dispatch(setSession({
            userId: user.id,
            email: user.email ?? null,
            role: userRole?.role ?? null,
            companyId: companyId ?? null,
            accessToken,
          }));

          // Prefetch common templates once authenticated
          dispatch(
            templateApi.util.prefetch('getUserTemplate', { slug: 'template1' }, { force: false })
          );
          dispatch(
            templateApi.util.prefetch('getUserTemplate', { slug: 'template2' }, { force: false })
          );
        } else if (!loading) {
          // Clear session when not authenticated
          dispatch(clearSession());
        }
      } catch (e) {
        // Fail quietly, store will remain consistent
      }
    };

    syncSession();

    return () => {
      cancelled = true;
    };
  }, [dispatch, user, userRole?.role, companyId, loading]);

  return null;
}
