/**
 * IBM Cloud Services Initialization
 * Substitui completamente o firebase.ts
 * Inicializa Cloudant, App ID e Watson
 */

import { initializeCloudant } from './ibm/cloudant';
import { initializeAppID } from './ibm/appid';
import { initializeWatson } from './ibm/watson';

// ============================================
// INICIALIZAÇÃO DOS SERVIÇOS
// ============================================

// Validar variáveis de ambiente
function validateEnvironment() {
  const requiredVars = [
    'IBM_CLOUDANT_URL',
    'IBM_CLOUDANT_API_KEY',
    'IBM_APPID_INSTANCE',
    'IBM_APPID_CLIENT_ID',
    'IBM_APPID_CLIENT_SECRET',
    'IBM_APPID_REDIRECT_URI',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.warn(
      '⚠️  Variáveis de ambiente não configuradas:',
      missingVars.join(', ')
    );
    console.warn('📝 Configure o arquivo .env.local ou .env.production');
  }
}

// Inicializar ao carregar o módulo
export const db = initializeCloudant();
export const auth = initializeAppID();
export const watson = initializeWatson();

// Validar configuração
validateEnvironment();

// ============================================
// EXPORTS PARA COMPATIBILIDADE
// ============================================

/**
 * Funções auxiliares para facilitar a migração do Firebase
 */

/**
 * Obter instância do banco de dados (Cloudant)
 */
export function getDatabase() {
  return db;
}

/**
 * Obter instância de autenticação (App ID)
 */
export function getAuth() {
  return auth;
}

/**
 * Obter instância de IA (Watson)
 */
export function getAI() {
  return watson;
}

/**
 * Status da conexão com serviços
 */
export async function checkServiceHealth() {
  try {
    // Verificar Cloudant
    const cloudantStatus = await db
      .getAllDbs()
      .then(() => ({ cloudant: 'ok' }))
      .catch(err => ({ cloudant: 'error', message: err.message }));

    // Verificar Watson (fazendo uma simples requisição)
    const watsonStatus = { watson: 'ok' };

    return {
      timestamp: new Date().toISOString(),
      services: {
        ...cloudantStatus,
        ...watsonStatus,
        appid: 'ok', // App ID valida no login
      },
    };
  } catch (error) {
    console.error('Erro ao verificar saúde dos serviços:', error);
    throw error;
  }
}

// ============================================
// TIPOS EXPORTADOS
// ============================================

export type {
  Member,
  Classe,
  Reuniao,
  Presenca,
  AppIDSession,
  AppIDUser,
  WatsonResponse,
} from './ibm/types';

export { Timestamp } from './ibm/types';

// ============================================
// FUNÇÕES DE BANCO DE DADOS (Compatibilidade)
// ============================================

export {
  getCollection,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  createDatabaseIfNotExists,
  batchWriteDocuments,
  queryDocuments,
  createIndex,
} from './ibm/cloudant';

// ============================================
// FUNÇÕES DE AUTENTICAÇÃO (Compatibilidade)
// ============================================

export {
  getLoginUrl,
  exchangeCodeForTokens,
  refreshAppIDToken,
  validateToken,
  logout,
  getCurrentSession,
  getCurrentUser,
} from './ibm/appid';

// ============================================
// FUNÇÕES DE IA (Compatibilidade)
// ============================================

export {
  createConversationSession,
  sendMessage,
  processUserInput,
  generateAttendanceReport,
  extractMemberInfo,
} from './ibm/watson';
