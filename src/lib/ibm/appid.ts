/**
 * IBM Cloud App ID Authentication
 * Substitui Firebase Auth
 * OAuth 2.0 / OpenID Connect
 */

import { RequestContext } from 'ibm-cloud-sdk-core';

interface AppIDConfig {
  instanceId: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  region: string;
}

interface AppIDUser {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  [key: string]: any;
}

interface AppIDSession {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  expiresIn: number;
  user: AppIDUser;
}

// Configuração local
let appIdConfig: AppIDConfig | null = null;
let currentSession: AppIDSession | null = null;

export function initializeAppID(): AppIDConfig {
  if (appIdConfig) return appIdConfig;

  const instanceId = process.env.IBM_APPID_INSTANCE;
  const clientId = process.env.IBM_APPID_CLIENT_ID;
  const clientSecret = process.env.IBM_APPID_CLIENT_SECRET;
  const redirectUri = process.env.IBM_APPID_REDIRECT_URI;
  const region = process.env.IBM_APPID_REGION || 'us-south';

  if (!instanceId || !clientId || !clientSecret || !redirectUri) {
    throw new Error(
      'IBM App ID credentials not configured. Set IBM_APPID_INSTANCE, IBM_APPID_CLIENT_ID, IBM_APPID_CLIENT_SECRET, and IBM_APPID_REDIRECT_URI'
    );
  }

  appIdConfig = {
    instanceId,
    clientId,
    clientSecret,
    redirectUri,
    region,
  };

  return appIdConfig;
}

export function getAppIDConfig(): AppIDConfig {
  if (!appIdConfig) {
    return initializeAppID();
  }
  return appIdConfig;
}

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

/**
 * Gerar URL de login (OAuth 2.0 Authorization Code Flow)
 */
export function getLoginUrl(state?: string): string {
  const config = getAppIDConfig();
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: 'openid profile email',
    state: state || Math.random().toString(36).substring(7),
  });
  
  return `https://${config.instanceId}.${config.region}.appauthen.cloud.ibm.com/oauth/authorize?${params.toString()}`;
}

/**
 * Trocar authorization code por tokens
 */
export async function exchangeCodeForTokens(code: string): Promise<AppIDSession> {
  const config = getAppIDConfig();
  
  try {
    const response = await fetch(
      `https://${config.instanceId}.${config.region}.appauthen.cloud.ibm.com/oauth/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: config.redirectUri,
        }).toString(),
      }
    );
    
    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Decodificar ID Token para obter informações do usuário
    const user = decodeJWT(data.id_token);
    
    currentSession = {
      accessToken: data.access_token,
      idToken: data.id_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      user: {
        id: user.sub,
        email: user.email,
        name: user.name,
        picture: user.picture,
        ...user,
      },
    };
    
    return currentSession;
  } catch (error) {
    console.error('Erro ao trocar código por tokens:', error);
    throw error;
  }
}

/**
 * Atualizar token usando refresh token
 */
export async function refreshAppIDToken(refreshToken: string): Promise<AppIDSession> {
  const config = getAppIDConfig();
  
  try {
    const response = await fetch(
      `https://${config.instanceId}.${config.region}.appauthen.cloud.ibm.com/oauth/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }).toString(),
      }
    );
    
    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    const user = decodeJWT(data.id_token);
    
    currentSession = {
      accessToken: data.access_token,
      idToken: data.id_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresIn: data.expires_in,
      user: {
        id: user.sub,
        email: user.email,
        name: user.name,
        picture: user.picture,
        ...user,
      },
    };
    
    return currentSession;
  } catch (error) {
    console.error('Erro ao atualizar token:', error);
    throw error;
  }
}

/**
 * Validar token de acesso
 */
export async function validateToken(accessToken: string): Promise<AppIDUser> {
  const config = getAppIDConfig();
  
  try {
    const response = await fetch(
      `https://${config.instanceId}.${config.region}.appauthen.cloud.ibm.com/oauth/introspect`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          token: accessToken,
        }).toString(),
      }
    );
    
    if (!response.ok) {
      throw new Error('Token validation failed');
    }
    
    const data = await response.json();
    
    if (!data.active) {
      throw new Error('Token is inactive or expired');
    }
    
    return {
      id: data.sub,
      email: data.email,
      name: data.name,
      ...data,
    };
  } catch (error) {
    console.error('Erro ao validar token:', error);
    throw error;
  }
}

/**
 * Logout (invalidar token)
 */
export async function logout(accessToken: string): Promise<void> {
  const config = getAppIDConfig();
  
  try {
    await fetch(
      `https://${config.instanceId}.${config.region}.appauthen.cloud.ibm.com/oauth/logout`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    currentSession = null;
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    throw error;
  }
}

/**
 * Obter sessão atual
 */
export function getCurrentSession(): AppIDSession | null {
  return currentSession;
}

/**
 * Obter usuário atual
 */
export function getCurrentUser(): AppIDUser | null {
  return currentSession?.user || null;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Decodificar JWT (sem verificação de assinatura)
 * Nota: Em produção, sempre valide a assinatura!
 */
function decodeJWT(token: string): Record<string, any> {
  const parts = token.split('.');
  
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }
  
  const payload = Buffer.from(parts[1], 'base64').toString('utf-8');
  return JSON.parse(payload);
}

/**
 * Verificar se o token está expirado
 */
export function isTokenExpired(session: AppIDSession): boolean {
  const expirationTime = Date.now() + session.expiresIn * 1000;
  return expirationTime <= Date.now();
}
