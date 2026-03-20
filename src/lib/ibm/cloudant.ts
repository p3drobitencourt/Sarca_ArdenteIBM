/**
 * IBM Cloudant Database Wrapper
 * Substitui Firestore do Firebase
 * API: CouchDB-compatible (DocumentDB)
 */

import { CloudantV1 } from '@ibm-cloud/cloudant';
import { IamAuthenticator } from 'ibm-cloud-sdk-core';

interface CloudantConfig {
  url: string;
  apiKey: string;
}

// Inicializar cliente Cloudant
let cloudantClient: CloudantV1 | null = null;

export function initializeCloudant(): CloudantV1 {
  if (cloudantClient) return cloudantClient;

  const config: CloudantConfig = {
    url: process.env.IBM_CLOUDANT_URL || '',
    apiKey: process.env.IBM_CLOUDANT_API_KEY || '',
  };

  if (!config.url || !config.apiKey) {
    throw new Error(
      'IBM Cloudant credentials not configured. Set IBM_CLOUDANT_URL and IBM_CLOUDANT_API_KEY'
    );
  }

  const authenticator = new IamAuthenticator({
    apikey: config.apiKey,
  });

  cloudantClient = new CloudantV1({
    authenticator: authenticator,
    serviceUrl: config.url,
  });

  return cloudantClient;
}

export function getCloudant(): CloudantV1 {
  if (!cloudantClient) {
    return initializeCloudant();
  }
  return cloudantClient;
}

// ============================================
// DATABASE OPERATIONS
// ============================================

/**
 * Buscar todos os documentos de uma coleção
 */
export async function getCollection(dbName: string, selector?: Record<string, any>) {
  const cloudant = getCloudant();
  
  try {
    const response = await cloudant.postFind({
      db: dbName,
      selector: selector || { _id: { $exists: true } },
      limit: 1000,
    });
    
    return response.result?.docs || [];
  } catch (error) {
    console.error(`Erro ao buscar coleção ${dbName}:`, error);
    throw error;
  }
}

/**
 * Buscar um documento específico por ID
 */
export async function getDocument(dbName: string, docId: string) {
  const cloudant = getCloudant();
  
  try {
    const response = await cloudant.getDocument({
      db: dbName,
      docId: docId,
    });
    return response.result;
  } catch (error) {
    console.error(`Erro ao buscar documento ${docId}:`, error);
    throw error;
  }
}

/**
 * Criar novo documento
 */
export async function createDocument(
  dbName: string,
  data: Record<string, any>
) {
  const cloudant = getCloudant();
  
  try {
    // Remover _id e _rev se existirem (deixar o Cloudant gerar)
    const { _id, _rev, ...cleanData } = data;
    
    const response = await cloudant.postDocument({
      db: dbName,
      document: cleanData,
    });
    
    return {
      id: response.result?.id,
      ...response.result,
    };
  } catch (error) {
    console.error(`Erro ao criar documento em ${dbName}:`, error);
    throw error;
  }
}

/**
 * Atualizar documento
 */
export async function updateDocument(
  dbName: string,
  docId: string,
  data: Record<string, any>
) {
  const cloudant = getCloudant();
  
  try {
    // Primeiro buscar o documento para pegar _rev
    const doc = await cloudant.getDocument({
      db: dbName,
      docId: docId,
    });
    
    const updateData = {
      ...doc.result,
      ...data,
      _id: docId,
      _rev: doc.result?._rev,
    };
    
    const response = await cloudant.putDocument({
      db: dbName,
      docId: docId,
      document: updateData,
    });
    
    return response.result;
  } catch (error) {
    console.error(`Erro ao atualizar documento ${docId}:`, error);
    throw error;
  }
}

/**
 * Deletar documento
 */
export async function deleteDocument(dbName: string, docId: string) {
  const cloudant = getCloudant();
  
  try {
    const doc = await cloudant.getDocument({
      db: dbName,
      docId: docId,
    });
    
    const response = await cloudant.deleteDocument({
      db: dbName,
      docId: docId,
      rev: doc.result?._rev,
    });
    
    return response.result;
  } catch (error) {
    console.error(`Erro ao deletar documento ${docId}:`, error);
    throw error;
  }
}

/**
 * Criar ou verificar database
 */
export async function createDatabaseIfNotExists(dbName: string) {
  const cloudant = getCloudant();
  
  try {
    await cloudant.putDatabase({ db: dbName });
    console.log(`Database ${dbName} criada com sucesso`);
  } catch (error: any) {
    if (error.status === 412) {
      console.log(`Database ${dbName} já existe`);
    } else {
      console.error(`Erro ao criar database ${dbName}:`, error);
      throw error;
    }
  }
}

/**
 * Batch write - múltiplos documentos
 */
export async function batchWriteDocuments(
  dbName: string,
  documents: Record<string, any>[]
) {
  const cloudant = getCloudant();
  
  try {
    const response = await cloudant.postBulkDocs({
      db: dbName,
      bulkDocs: {
        docs: documents,
      },
    });
    
    return response.result;
  } catch (error) {
    console.error(`Erro ao escrever múltiplos documentos em ${dbName}:`, error);
    throw error;
  }
}

/**
 * Query com filtro (similar ao Firestore query)
 */
export async function queryDocuments(
  dbName: string,
  field: string,
  operator: '$eq' | '$gt' | '$gte' | '$lt' | '$lte' | '$ne' | '$in',
  value: any
) {
  const cloudant = getCloudant();
  
  try {
    const selector = {
      [field]: { [operator]: value },
    };
    
    const response = await cloudant.postFind({
      db: dbName,
      selector: selector as Record<string, any>,
      limit: 1000,
    });
    
    return response.result?.docs || [];
  } catch (error) {
    console.error(`Erro ao consultar documentos em ${dbName}:`, error);
    throw error;
  }
}

/**
 * Criar índice para melhor performance
 */
export async function createIndex(
  dbName: string,
  fields: string[]
) {
  const cloudant = getCloudant();
  
  try {
    const response = await cloudant.postIndex({
      db: dbName,
      index: {
        fields: fields.map(f => ({ [f]: 'asc' })),
      },
    });
    
    return response.result;
  } catch (error) {
    console.error(`Erro ao criar índice em ${dbName}:`, error);
    throw error;
  }
}
