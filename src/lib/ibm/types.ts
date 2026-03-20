/**
 * IBM Cloud Types & Interfaces
 * Compatível com a estrutura de tipos do seu projeto
 */

/**
 * Timestamp IBM Cloudant
 * Cloudant usa timestamps Unix (números)
 * Mapeado para compatibilidad com Firestore Timestamp
 */
export class Timestamp {
  constructor(private milliseconds: number) {}

  /**
   * Obter timestamp atual
   */
  static now(): Timestamp {
    return new Timestamp(Date.now());
  }

  /**
   * Criar a partir de data
   */
  static fromDate(date: Date): Timestamp {
    return new Timestamp(date.getTime());
  }

  /**
   * Converter para Date
   */
  toDate(): Date {
    return new Date(this.milliseconds);
  }

  /**
   * Obter valor em milissegundos
   */
  toMillis(): number {
    return this.milliseconds;
  }

  /**
   * Converter para ISO string
   */
  toISOString(): string {
    return new Date(this.milliseconds).toISOString();
  }
}

/**
 * Interface para documento armazenado em Cloudant
 */
export interface CloudantDocument {
  _id?: string;
  _rev?: string;
  [key: string]: any;
}

/**
 * ============================================
 * TIPOS DO PROJETO (Compatível com original)
 * ============================================
 */

// Interface para a coleção 'membros'
export interface Member extends CloudantDocument {
  id?: string;
  nomeCompleto: string;
  telefone?: string;
  dataNascimento: Timestamp | number | Date;
  dataDeIngresso: Timestamp | number | Date;
  ativo: boolean;
  professo: boolean;
  criadoEm?: Timestamp;
  atualizadoEm?: Timestamp;
}

// Interface para a coleção 'classes'
export interface Classe extends CloudantDocument {
  id?: string;
  nome: string;
  descricao?: string;
  criadoEm?: Timestamp;
}

// Interface para a coleção 'reunioes'
export interface Reuniao extends CloudantDocument {
  id?: string;
  nome: string;
  descricao?: string;
  criadoEm?: Timestamp;
}

// Interface para a coleção 'presencas'
export interface Presenca extends CloudantDocument {
  id?: string;
  dataRegistro: Timestamp | number | Date;
  membroId: string;
  membroNome: string; // Denormalizado
  classeId: string;
  classeNome: string; // Denormalizado
  reuniaoId: string;
  reuniaoNome: string; // Denormalizado
  registradoPorId: string; // UserID do Auth (App ID)
  arquivado?: boolean;
}

/**
 * ============================================
 * TIPOS ADICIONAIS PARA IBM CLOUD
 * ============================================
 */

// Sessão do usuário (App ID)
export interface AppIDSession {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  expiresIn: number;
  user: AppIDUser;
}

// Usuário do App ID
export interface AppIDUser {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  [key: string]: any;
}

// Resposta de conversa Watson
export interface WatsonResponse {
  generic: Array<{
    response_type: string;
    text?: string;
    title?: string;
    options?: Array<{ label: string; value: string }>;
  }>;
  intents: Array<{
    intent: string;
    confidence: number;
  }>;
  entities: Array<{
    entity: string;
    value: string;
    confidence: number;
  }>;
  context?: Record<string, any>;
}

/**
 * ============================================
 * UTILITÁRIOS DE CONVERSÃO
 * ============================================
 */

/**
 * Converter Timestamp para valor Cloudant
 */
export function toCloudantValue(value: any): any {
  if (value instanceof Timestamp) {
    return value.toMillis();
  }
  if (value instanceof Date) {
    return value.getTime();
  }
  if (typeof value === 'number') {
    return value;
  }
  return value;
}

/**
 * Converter valor Cloudant para Timestamp
 */
export function fromCloudantValue(value: any): Timestamp | any {
  if (typeof value === 'number') {
    return new Timestamp(value);
  }
  if (typeof value === 'string') {
    return new Timestamp(new Date(value).getTime());
  }
  return value;
}

/**
 * Preparar documento para Cloudant (remover campos internos)
 */
export function prepareDocumentForStorage(doc: any): CloudantDocument {
  const { id, ...rest } = doc;
  
  // Converter timestamps
  const prepared: CloudantDocument = {};
  
  for (const [key, value] of Object.entries(rest)) {
    if (value instanceof Timestamp) {
      prepared[key] = value.toMillis();
    } else if (value instanceof Date) {
      prepared[key] = value.getTime();
    } else if (typeof value === 'object' && value !== null) {
      prepared[key] = prepareDocumentForStorage(value);
    } else {
      prepared[key] = value;
    }
  }
  
  return prepared;
}

/**
 * Reconstruir documento após busca (adicionar timestamps)
 */
export function reconstructDocumentFromStorage(doc: CloudantDocument): any {
  const reconstructed: any = {
    id: doc._id,
  };
  
  for (const [key, value] of Object.entries(doc)) {
    if (key === '_id' || key === '_rev') continue;
    
    // Se o campo é um campo de timestamp, converter
    if (
      (key.includes('Data') || key.includes('data') || key.includes('Tempo') || key.includes('tempo')) &&
      typeof value === 'number'
    ) {
      reconstructed[key] = new Timestamp(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      reconstructed[key] = reconstructDocumentFromStorage(value);
    } else {
      reconstructed[key] = value;
    }
  }
  
  return reconstructed;
}
