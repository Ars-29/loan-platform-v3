'use client'

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { colors, spacing, borderRadius, shadows, typography } from '@/theme/theme';

function InvitePageContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [companyInfo, setCompanyInfo] = useState<{name: string, email: string} | null>(null);
  const [user, setUser] = useState<any>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const companyId = searchParams.get('company');
  const isOfficerInvite = searchParams.get('officer') === 'true';

  useEffect(() => {
    // Listen for auth state changes to handle invite flow
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
        setUser(session.user);
        await fetchCompanyInfo(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setError('Please check your email and click the invite link to continue.');
      }
    });

    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        await fetchCompanyInfo(user);
      } else {
        // If no user is logged in, show the password creation form
        // This handles the case where someone clicks an invite link
        setUser({ email: 'invite@example.com' } as any); // Temporary user object
        await fetchCompanyInfo(null);
      }
    };

    checkUser();

    return () => subscription.unsubscribe();
  }, []);

  const fetchCompanyInfo = async (currentUser: any) => {
    if (!companyId) {
      setError('Invalid invite link. Missing company ID.');
      return;
    }

    try {
      if (isOfficerInvite) {
        // For loan officer invites, check if the company exists and get its info
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('name, admin_email')
          .eq('id', companyId)
          .single();

        if (companyError || !company) {
          setError('Company not found or invite is invalid.');
          return;
        }

        // If user is logged in, check if they have access to this company
        if (currentUser) {
          const { data: userCompany, error: userError } = await supabase
            .from('user_companies')
            .select('is_active')
            .eq('user_id', currentUser.id)
            .eq('company_id', companyId)
            .eq('role', 'employee')
            .single();

          if (userError || !userCompany) {
            setError('You are not authorized to access this company.');
            return;
          }

          if (userCompany.is_active) {
            setError('You have already completed your setup. Please login to access your dashboard.');
            return;
          }
        }

        setCompanyInfo({
          name: company.name,
          email: company.admin_email
        });
      } else {
        // For company admin invites, check companies table
        const { data: company, error } = await supabase
          .from('companies')
          .select('name, admin_email, invite_status, invite_expires_at')
          .eq('id', companyId)
          .single();

        if (error || !company) {
          setError('Company not found or invite is invalid.');
          return;
        }

        if (company.invite_status === 'accepted') {
          setSuccess('This invite has already been accepted. You can login now.');
          setTimeout(() => router.push('/auth'), 3000);
          return;
        }

        if (company.invite_status === 'expired' || 
            (company.invite_expires_at && new Date() > new Date(company.invite_expires_at))) {
          setError('This invite has expired. Please contact your administrator for a new invite.');
          return;
        }

        setCompanyInfo({
          name: company.name,
          email: company.admin_email || (currentUser ? currentUser.email : '')
        });
      }
    } catch (error) {
      setError('Failed to load company information.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      // For invite links, we need to handle the authentication differently
      if (!user || user.email === 'invite@example.com') {
        // This is an invite link - we need to get the user from the invite
        const { data: { user: currentUser }, error: getUserError } = await supabase.auth.getUser();
        
        if (getUserError || !currentUser) {
          setError('Please click the invite link from your email to continue.');
          setLoading(false);
          return;
        }
        
        setUser(currentUser);
      }

      // Update user password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        throw updateError;
      }

      if (isOfficerInvite) {
        // Update user and user-company to active for loan officer
        const { error: userError } = await supabase
          .from('users')
          .update({ is_active: true })
          .eq('id', user.id);

        if (userError) {
          throw userError;
        }

        // Update user_companies entry to active
        const { error: companyError } = await supabase
          .from('user_companies')
          .update({ is_active: true })
          .eq('user_id', user.id)
          .eq('company_id', companyId);

        if (companyError) {
          console.error('❌ Error updating user_companies:', companyError);
          throw companyError;
        }

        console.log('✅ User-company relationship activated successfully');

        // Create personal templates for the loan officer when they activate their account
        try {
          console.log('🎨 Creating personal templates for activated loan officer:', user.id);
          const firstName = user.user_metadata?.first_name || '';
          const lastName = user.user_metadata?.last_name || '';
          
          // Validate user ID format
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          if (!uuidRegex.test(user.id)) {
            throw new Error(`Invalid user ID format: ${user.id}`);
          }
          
          // Call API to create personal templates
          const response = await fetch('/api/templates/create-personal', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
            },
            body: JSON.stringify({
              userId: user.id,
              firstName,
              lastName
            })
          });

          if (response.ok) {
            const result = await response.json();
            console.log('✅ Personal templates created successfully:', result.data.templatesCreated);
          } else {
            const errorText = await response.text();
            console.error('❌ Error creating personal templates:', errorText);
            // Don't fail the activation process if template creation fails
          }
        } catch (templateError) {
          console.error('❌ Error creating personal templates:', templateError);
          // Don't fail the activation process if template creation fails
        }
      } else {
        // Update company status to accepted and activate for company admin
        const { error: companyError } = await supabase
          .from('companies')
          .update({
            invite_status: 'accepted',
            admin_email_verified: true,
            admin_user_id: user.id,
            is_active: true, // Activate company when invite is accepted
            updated_at: new Date().toISOString()
          })
          .eq('id', companyId);

        if (companyError) {
          throw companyError;
        }
      }

      // Add user to users table with correct role
      await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email!,
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          role: isOfficerInvite ? 'employee' : 'company_admin',
          is_active: true
        });

      // Link user to company with correct role
      await supabase
        .from('user_companies')
        .upsert({
          user_id: user.id,
          company_id: companyId,
          role: isOfficerInvite ? 'employee' : 'admin',
          is_active: true
        });

      setSuccess('🎉 Welcome! Your account has been set up successfully. Redirecting to your dashboard...');
      
      setTimeout(() => {
        if (isOfficerInvite) {
          router.push('/officers/dashboard');
        } else {
          router.push('/admin/dashboard');
        }
      }, 2000);

    } catch (error) {
      console.error('Error accepting invite:', error);
      setError(error instanceof Error ? error.message : 'Failed to accept invite. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.email === 'invite@example.com') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(to bottom right, ${colors.primary[50]}, ${colors.darkPurple[100]})` }}>
        <Card className="max-w-md w-full">
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: spacing.xl2, height: spacing.xl2, backgroundColor: colors.blue[50], borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', marginBottom: spacing.md }}>
              <Icon name="email" size={32} color={colors.blue[600]} />
            </div>
            <h1 style={{ fontSize: typography.h1.fontSize, fontWeight: typography.h1.fontWeight, color: colors.text.primary, marginBottom: spacing.sm }}>Check Your Email</h1>
            <p style={{ color: colors.text.secondary, marginBottom: spacing.md }}>Please check your email and click the invite link to continue with the setup.</p>
            <p style={{ fontSize: typography.sm.fontSize, color: colors.text.muted }}>If you don't see the email, check your spam folder.</p>
            <div style={{ marginTop: spacing.md, padding: spacing.md, backgroundColor: colors.yellow[50], border: `1px solid ${colors.yellow[200]}`, borderRadius: borderRadius.lg }}>
              <p style={{ fontSize: typography.sm.fontSize, color: colors.yellow[800] }}>
                <strong>Note:</strong> Make sure to click the invite link from your email. The link will automatically sign you in.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!companyId) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(to bottom right, ${colors.primary[50]}, ${colors.darkPurple[100]})` }}>
        <Card className="max-w-md w-full">
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: spacing.xl2, height: spacing.xl2, backgroundColor: colors.red[50], borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', marginBottom: spacing.md }}>
              <Icon name="warning" size={32} color={colors.red[600]} />
            </div>
            <h1 style={{ fontSize: typography.h1.fontSize, fontWeight: typography.h1.fontWeight, color: colors.text.primary, marginBottom: spacing.sm }}>Invalid Invite Link</h1>
            <p style={{ color: colors.text.secondary }}>This invite link is invalid or missing required information.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(to bottom right, ${colors.primary[50]}, ${colors.darkPurple[100]})` }}>
      <Card className="max-w-md w-full">
        <div style={{ textAlign: 'center', marginBottom: spacing.xl }}>
          <div style={{ width: spacing.xl2, height: spacing.xl2, backgroundColor: colors.primary[50], borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', marginBottom: spacing.md }}>
            <Icon name="check" size={32} color={colors.primary[600]} />
          </div>
          <h1 style={{ fontSize: typography.h1.fontSize, fontWeight: typography.h1.fontWeight, color: colors.text.primary, marginBottom: spacing.sm }}>Complete Your Setup</h1>
          <p style={{ color: colors.text.secondary }}>
            {isOfficerInvite 
              ? 'Create a password to access your loan officer dashboard.' 
              : 'Create a password to access your company dashboard.'
            }
          </p>
          {companyInfo && (
            <div style={{ marginTop: spacing.md, padding: spacing.md, backgroundColor: colors.gray[50], borderRadius: borderRadius.lg }}>
              <p style={{ fontSize: typography.sm.fontSize, color: colors.text.secondary }}>
                <strong>Company:</strong> {companyInfo.name}<br />
                <strong>Email:</strong> {companyInfo.email}
              </p>
            </div>
          )}
        </div>

          {error && (
            <div style={{ marginBottom: spacing.md, padding: spacing.md, backgroundColor: colors.red[50], border: `1px solid ${colors.red[200]}`, borderRadius: borderRadius.lg }}>
              <p style={{ color: colors.red[700], fontSize: typography.sm.fontSize }}>{error}</p>
            </div>
          )}

          {success && (
            <div style={{ marginBottom: spacing.md, padding: spacing.md, backgroundColor: colors.green[50], border: `1px solid ${colors.green[200]}`, borderRadius: borderRadius.lg }}>
              <p style={{ color: colors.green[700], fontSize: typography.sm.fontSize }}>{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
            <div>
              <label htmlFor="password" style={{ display: 'block', fontSize: typography.sm.fontSize, fontWeight: typography.sm.fontWeight, color: colors.text.secondary, marginBottom: spacing.sm }}>
                Create Password
              </label>
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                minLength={8}
                disabled={loading}
              />
              <p style={{ fontSize: typography.xs.fontSize, color: colors.text.muted, marginTop: spacing.xs }}>Password must be at least 8 characters long</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" style={{ display: 'block', fontSize: typography.sm.fontSize, fontWeight: typography.sm.fontWeight, color: colors.text.secondary, marginBottom: spacing.sm }}>
                Confirm Password
              </label>
              <Input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                minLength={8}
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              loading={loading}
              className="w-full"
            >
              {loading ? 'Setting up account...' : 'Complete Setup & Go to Dashboard'}
            </Button>
          </form>

        <div style={{ marginTop: spacing.lg, textAlign: 'center' }}>
          <p style={{ fontSize: typography.sm.fontSize, color: colors.text.secondary }}>
            Need help?{' '}
            <a href="mailto:support@loanplatform.com" style={{ color: colors.primary[600], textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>
              Contact Support
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ animation: 'spin 1s linear infinite', borderRadius: '50%', height: '8rem', width: '8rem', borderBottom: `2px solid ${colors.primary[600]}` }}></div>
      </div>
    }>
      <InvitePageContent />
    </Suspense>
  );
}
