import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

/**
 * IBM App ID OAuth 2.0 Callback Handler
 * 
 * Rota: GET /api/auth/callback
 * 
 * Query Parameters:
 * - code: Authorization code from App ID
 * - state: CSRF protection token
 * 
 * Fluxo:
 * 1. Recebe o authorization code
 * 2. Valida o state (CSRF protection)
 * 3. Troca o code por tokens (Token Endpoint)
 * 4. Decodifica e valida os JWT tokens
 * 5. Armazena sessão em cookie HttpOnly
 * 6. Redireciona para dashboard
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  try {
    // Erro do App ID
    const error = searchParams.get('error');
    const error_description = searchParams.get('error_description');

    if (error) {
      console.error(`[Auth] OAuth error from App ID: ${error}`);
      console.error(`[Auth] Description: ${error_description}`);
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent(error_description || 'Authentication failed')}`,
          request.url
        )
      );
    }

    // Validar se recebemos o authorization code
    if (!code) {
      console.error('[Auth] No authorization code received');
      return NextResponse.redirect(
        new URL('/login?error=No authorization code', request.url)
      );
    }

    // Validar variáveis de ambiente
    const requiredEnvVars = [
      'APPID_OAUTH_SERVER_URL',
      'APPID_CLIENT_ID',
      'APPID_CLIENT_SECRET',
      'APPID_REDIRECT_URI',
    ];

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        console.error(`[Auth] Missing environment variable: ${envVar}`);
        return NextResponse.redirect(
          new URL('/login?error=Server configuration error', request.url)
        );
      }
    }

    // Step 1: Exchange authorization code for tokens (Token Endpoint)
    console.log('[Auth] Exchanging authorization code for tokens...');

    const tokenUrl = `${process.env.APPID_OAUTH_SERVER_URL}/token`;

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: process.env.APPID_CLIENT_ID!,
        client_secret: process.env.APPID_CLIENT_SECRET!,
        redirect_uri: process.env.APPID_REDIRECT_URI!,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('[Auth] Token exchange failed:', errorData);
      return NextResponse.redirect(
        new URL(`/login?error=Token exchange failed: ${errorData.error}`, request.url)
      );
    }

    const tokens = await tokenResponse.json();

    console.log('[Auth] Tokens received successfully');

    // Step 2: Decode and validate JWT tokens
    let idTokenPayload: any;
    let accessTokenPayload: any;

    try {
      idTokenPayload = jwtDecode(tokens.id_token);
      accessTokenPayload = jwtDecode(tokens.access_token);
    } catch (decodeError) {
      console.error('[Auth] JWT decode failed:', decodeError);
      return NextResponse.redirect(
        new URL('/login?error=Invalid token format', request.url)
      );
    }

    // Extract user information from ID token
    const user = {
      id: idTokenPayload.sub || idTokenPayload.oid, // Subject or Object ID
      email: idTokenPayload.email,
      name: idTokenPayload.name,
      picture: idTokenPayload.picture,
      iss: idTokenPayload.iss, // Issuer (tenant)
      aud: idTokenPayload.aud, // Audience (client_id)
      iat: idTokenPayload.iat, // Issued at
      exp: idTokenPayload.exp, // Expiration time
    };

    console.log(`[Auth] User authenticated: ${user.email} (ID: ${user.id})`);

    // Step 3: Create session object
    const session = {
      user: user,
      accessToken: tokens.access_token,
      idToken: tokens.id_token,
      refreshToken: tokens.refresh_token || null,
      expiresIn: tokens.expires_in,
      tokenType: tokens.token_type,
      scope: tokens.scope,
      issuedAt: Date.now(),
    };

    // Step 4: Create response with secure cookie
    const response = NextResponse.redirect(new URL('/', request.url));

    // Set HttpOnly secure cookie with session
    response.cookies.set('appid_session', JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in, // Cookie expires when token expires
      path: '/',
    });

    // Also store user info in localStorage-compatible way via response header
    // (frontend will read this and store in localStorage)
    response.headers.set('X-User-Session', JSON.stringify(session));

    return response;
  } catch (error) {
    console.error('[Auth] Callback handler error:', error);
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent('Authentication process failed')}`,
        request.url
      )
    );
  }
}
