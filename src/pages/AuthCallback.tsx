import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

/** Landing page after Google sign-in: turns the one-time token from /api/auth/callback/google into a session. */
export default function AuthCallback() {
  const navigate = useNavigate();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // React strict mode runs effects twice; the token is single-use
    ran.current = true;

    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const tokenHash = params.get('token_hash');
    window.history.replaceState(null, '', window.location.pathname);

    if (!tokenHash) {
      navigate('/auth?error=session_failed', { replace: true });
      return;
    }

    supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'magiclink' }).then(({ error }) => {
      // /auth sends admins to /admin and everyone else to /dashboard once the role check finishes
      navigate(error ? '/auth?error=session_failed' : '/auth', { replace: true });
    });
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-muted-foreground" role="status">
      <Loader2 className="w-8 h-8 animate-spin text-primary" aria-hidden="true" />
      Signing you in...
    </div>
  );
}
