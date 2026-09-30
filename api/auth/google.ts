/**
 * Step 1 of "Continue with Google": send the browser to Google's consent screen.
 * Lives on Vercel (not in Supabase Auth), so the Google client secret never leaves the server.
 *
 * Env (Vercel → Project → Settings → Environment Variables, server-side only, NO "VITE_" prefix):
 *   GOOGLE_CLIENT_ID
 */
import { randomBytes } from 'node:crypto';

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function handler(req: any, res: any) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    res.status(500).json({ error: 'Google sign-in is not configured' });
    return;
  }

  const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const origin = `${proto.split(',')[0]}://${req.headers.host}`;
  const redirectUri = `${origin}/api/auth/callback/google`;

  // CSRF protection: the same random value must come back from Google and match this cookie.
  const state = randomBytes(24).toString('hex');
  const secure = proto.startsWith('https') ? '; Secure' : '';
  res.setHeader('Set-Cookie', `nd_oauth_state=${state}; HttpOnly; SameSite=Lax; Path=/api/auth; Max-Age=600${secure}`);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
  });

  res.redirect(302, `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
