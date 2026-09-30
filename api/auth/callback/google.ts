/**
 * Step 2 of "Continue with Google": Google sends the user back here with a one-time code.
 * We exchange it (using the client secret) for the user's verified Google profile, make sure a
 * Supabase user exists for that email, and hand the browser a single-use token to open a session.
 *
 * Env (Vercel → Project → Settings → Environment Variables, server-side only, NO "VITE_" prefix):
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
 *   SUPABASE_URL              (same value as VITE_SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY (Supabase → Project Settings → API; never expose this to the browser)
 */
import { timingSafeEqual } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

/* eslint-disable @typescript-eslint/no-explicit-any */

function readCookie(header: string | undefined, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return null;
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export default async function handler(req: any, res: any) {
  const proto = ((req.headers['x-forwarded-proto'] as string) || 'https').split(',')[0];
  const origin = `${proto}://${req.headers.host}`;
  const secure = proto === 'https' ? '; Secure' : '';
  const fail = (code: string) => {
    res.setHeader('Set-Cookie', `nd_oauth_state=; HttpOnly; SameSite=Lax; Path=/api/auth; Max-Age=0${secure}`);
    res.redirect(302, `${origin}/auth?error=${encodeURIComponent(code)}`);
  };

  const { code, state, error } = req.query as Record<string, string | undefined>;
  if (error) return fail('google_denied');

  const expected = readCookie(req.headers.cookie, 'nd_oauth_state');
  if (!code || !state || !expected || !safeEqual(state, expected)) return fail('invalid_state');

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!clientId || !clientSecret || !supabaseUrl || !serviceKey) return fail('not_configured');

  try {
    // 1. Trade the code for tokens. This request goes straight to Google over TLS.
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${origin}/api/auth/callback/google`,
        grant_type: 'authorization_code',
      }),
    });
    if (!tokenRes.ok) return fail('token_exchange');
    const tokens = (await tokenRes.json()) as { id_token?: string };
    if (!tokens.id_token) return fail('token_exchange');

    // 2. Read the profile from the id_token (safe to trust: it came from Google's token endpoint, not the browser).
    const payload = JSON.parse(Buffer.from(tokens.id_token.split('.')[1], 'base64url').toString('utf8')) as {
      aud?: string; iss?: string; email?: string; email_verified?: boolean; name?: string; picture?: string;
    };
    const issuerOk = payload.iss === 'https://accounts.google.com' || payload.iss === 'accounts.google.com';
    if (payload.aud !== clientId || !issuerOk || !payload.email || !payload.email_verified) return fail('unverified_email');

    // 3. Make sure a Supabase user exists and mint a one-time login token for them.
    const admin = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data, error: linkError } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: payload.email,
      options: { data: { full_name: payload.name ?? null, avatar_url: payload.picture ?? null } },
    });
    const tokenHash = data?.properties?.hashed_token;
    if (linkError || !tokenHash) return fail('session_failed');

    // 4. Back to the site. The token goes in the URL fragment so it is never sent to a server or logged.
    res.setHeader('Set-Cookie', `nd_oauth_state=; HttpOnly; SameSite=Lax; Path=/api/auth; Max-Age=0${secure}`);
    res.redirect(302, `${origin}/auth/callback#token_hash=${encodeURIComponent(tokenHash)}&type=magiclink`);
  } catch (err) {
    console.error('google callback failed', err);
    return fail('server_error');
  }
}
