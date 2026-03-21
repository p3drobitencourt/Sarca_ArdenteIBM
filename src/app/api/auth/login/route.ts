import { NextRequest, NextResponse } from 'next/server';

/**
 * IBM App ID OAuth 2.0 Login Initiator
 * 
 * Rota: GET /api/auth/login
 * 
 * Fluxo: Authorization Code Grant (OIDC)
 * 1. Redireciona o usuário para o endpoint de autorização do App ID
 * 2. Usuário autentica no App ID
 * 3. App ID redireciona para /api/auth/callback com `code` e `state`
 */
export async function GET(request: NextRequest) {
  try {
    // Validar variáveis de ambiente
    const requiredEnvVars = [
      'APPID_TENANT_ID',
      'APPID_OAUTH_SERVER_URL',
      'APPID_CLIENT_ID',
      'APPID_REDIRECT_URI',
    ];

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        console.error(`Missing environment variable: ${envVar}`);
        return NextResponse.json(
          { error: `Missing configuration: ${envVar}` },
          { status: 500 }
        );
      }
    }

    // Gerar state (CSRF protection)
    const state = Buffer.from(Math.random().toString()).toString('base64').slice(0, 32);

    // Construir authorization URL
    const authorizationUrl = new URL(
      `${process.env.APPID_OAUTH_SERVER_URL}/authorization`
    );

    authorizationUrl.searchParams.append('client_id', process.env.APPID_CLIENT_ID!);
    authorizationUrl.searchParams.append('response_type', 'code');
    authorizationUrl.searchParams.append('redirect_uri', process.env.APPID_REDIRECT_URI!);
    authorizationUrl.searchParams.append('scope', 'openid profile email');
    authorizationUrl.searchParams.append('state', state);

    console.log(`[Auth] Initiating OAuth flow with App ID`);
    console.log(`[Auth] Redirect URL: ${authorizationUrl.toString().replace(/client_id=.*&/, 'client_id=***&')}`);

    // Redirecionar para o App ID
    return NextResponse.redirect(authorizationUrl.toString());
  } catch (error) {
    console.error('[Auth] Login initiation failed:', error);
    return NextResponse.json(
      { error: 'Internal server error during login initialization' },
      { status: 500 }
    );
  }
}
