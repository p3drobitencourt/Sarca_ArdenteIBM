/**
 * IBM Watson Assistant Integration
 * Substitui Google Genkit + Gemini
 * Watson AI para conversas e análises
 */

import axios, { AxiosInstance } from 'axios';

interface WatsonConfig {
  url: string;
  apiKey: string;
  authType: string;
  version: string;
}

interface WatsonMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

interface WatsonResponse {
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

interface WatsonConversation {
  sessionId: string;
  messages: WatsonMessage[];
  context: Record<string, any>;
}

// Inicializar cliente Watson
let watsonClient: AxiosInstance | null = null;
let watsonConfig: WatsonConfig | null = null;

export function initializeWatson(): AxiosInstance {
  if (watsonClient) return watsonClient;

  const url = process.env.IBM_WATSON_ASSISTANT_URL;
  const apiKey = process.env.IBM_WATSON_ASSISTANT_API_KEY;

  if (!url || !apiKey) {
    throw new Error(
      'IBM Watson credentials not configured. Set IBM_WATSON_ASSISTANT_URL and IBM_WATSON_ASSISTANT_API_KEY'
    );
  }

  watsonConfig = {
    url: url,
    apiKey: apiKey,
    authType: process.env.IBM_WATSON_ASSISTANT_AUTH_TYPE || 'iam',
    version: process.env.IBM_WATSON_ASSISTANT_VERSION || '2023-06-15',
  };

  watsonClient = axios.create({
    baseURL: watsonConfig.url,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  return watsonClient;
}

export function getWatson(): AxiosInstance {
  if (!watsonClient) {
    return initializeWatson();
  }
  return watsonClient;
}

// ============================================
// CONVERSATION MANAGEMENT
// ============================================

/**
 * Criar nova sessão de conversa
 */
export async function createConversationSession(): Promise<string> {
  const client = getWatson();
  const config = watsonConfig || initializeWatson() as any;

  try {
    const response = await client.post('/v2/sessions', {}, {
      params: {
        version: config.version,
      },
    });

    return response.data.session_id;
  } catch (error) {
    console.error('Erro ao criar sessão Watson:', error);
    throw error;
  }
}

/**
 * Enviar mensagem para Watson Assistant
 */
export async function sendMessage(
  sessionId: string,
  message: string,
  context?: Record<string, any>
): Promise<WatsonResponse> {
  const client = getWatson();
  const config = watsonConfig;

  if (!config) {
    throw new Error('Watson not initialized');
  }

  try {
    const response = await client.post(
      `/v2/assistants/${process.env.IBM_WATSON_ASSISTANT_ID}/sessions/${sessionId}/message`,
      {
        input: {
          message_type: 'text',
          text: message,
        },
        context: context || {},
      },
      {
        params: {
          version: config.version,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Erro ao enviar mensagem Watson:', error);
    throw error;
  }
}

/**
 * Processar entrada de texto com Watson
 * Retorna intenção, entidades e resposta
 */
export async function processUserInput(
  sessionId: string,
  userInput: string,
  context?: Record<string, any>
): Promise<{
  response: string;
  intent: string;
  confidence: number;
  entities: Array<{ entity: string; value: string }>;
  context: Record<string, any>;
}> {
  try {
    const watsonResponse = await sendMessage(sessionId, userInput, context);

    const responseText =
      watsonResponse.generic?.find(g => g.response_type === 'text')?.text ||
      'Desculpe, não consegui processar sua mensagem.';

    const mainIntent = watsonResponse.intents?.[0];
    const entities = watsonResponse.entities?.map(e => ({
      entity: e.entity,
      value: e.value,
    })) || [];

    return {
      response: responseText,
      intent: mainIntent?.intent || 'unknown',
      confidence: mainIntent?.confidence || 0,
      entities: entities,
      context: watsonResponse.context || {},
    };
  } catch (error) {
    console.error('Erro ao processar entrada do usuário:', error);
    throw error;
  }
}

/**
 * Análise de sentimento
 */
export async function analyzeSentiment(text: string): Promise<{
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  summary: string;
}> {
  // Usando Watson Natural Language Understanding
  // Alternativa: usar endpoint separado ou integrar com NLU

  try {
    const client = getWatson();

    const response = await client.post('/v1/analyze', {
      text: text,
      features: {
        sentiment: {},
      },
    });

    const sentiment = response.data.sentiment;

    return {
      sentiment: sentiment.document.label as 'positive' | 'negative' | 'neutral',
      score: sentiment.document.score,
      summary: sentiment.document.label,
    };
  } catch (error) {
    console.error('Erro ao analisar sentimento:', error);
    throw error;
  }
}

/**
 * Gerar resposta para relatório de presença
 * Usa Watson para análise inteligente
 */
export async function generateAttendanceReport(
  sessionId: string,
  attendanceData: {
    totalMembers: number;
    presentMembers: number;
    absentMembers: number;
    percentage: number;
    comment?: string;
  }
): Promise<string> {
  const reportText = `
    Relatório de Presença:
    - Total de membros: ${attendanceData.totalMembers}
    - Presentes: ${attendanceData.presentMembers}
    - Ausentes: ${attendanceData.absentMembers}
    - Percentual de presença: ${attendanceData.percentage}%
    ${attendanceData.comment ? `- Observação: ${attendanceData.comment}` : ''}
  `;

  try {
    const watsonResponse = await sendMessage(
      sessionId,
      `Gere um sumário de presença baseado nestes dados: ${reportText}`
    );

    return (
      watsonResponse.generic?.find(g => g.response_type === 'text')?.text ||
      reportText
    );
  } catch (error) {
    console.error('Erro ao gerar relatório com Watson:', error);
    return reportText;
  }
}

/**
 * Extrair informações de membros (NER - Named Entity Recognition)
 */
export async function extractMemberInfo(text: string): Promise<{
  name?: string;
  email?: string;
  phone?: string;
  othersEntities: Array<{ entity: string; value: string }>;
}> {
  // Usar Watson NLU para extração de entidades

  try {
    // Implementar extração de entidades
    const client = getWatson();

    const response = await client.post('/v1/analyze', {
      text: text,
      features: {
        entities: {
          sentiment: true,
          emotion: false,
        },
      },
    });

    const entities = response.data.entities || [];

    const extracted = {
      name: undefined,
      email: undefined,
      phone: undefined,
      othersEntities: [] as Array<{ entity: string; value: string }>,
    };

    entities.forEach((entity: any) => {
      if (entity.type === 'PERSON') {
        extracted.name = entity.text;
      } else if (entity.type === 'EMAIL') {
        extracted.email = entity.text;
      } else if (entity.type === 'PHONE_NUMBER') {
        extracted.phone = entity.text;
      } else {
        extracted.othersEntities.push({
          entity: entity.type,
          value: entity.text,
        });
      }
    });

    return extracted;
  } catch (error) {
    console.error('Erro ao extrair informações:', error);
    throw error;
  }
}

/**
 * Deletar sessão (limpeza)
 */
export async function deleteSession(sessionId: string): Promise<void> {
  const client = getWatson();
  const config = watsonConfig;

  if (!config) {
    throw new Error('Watson not initialized');
  }

  try {
    await client.delete(
      `/v2/assistants/${process.env.IBM_WATSON_ASSISTANT_ID}/sessions/${sessionId}`,
      {
        params: {
          version: config.version,
        },
      }
    );
  } catch (error) {
    console.error('Erro ao deletar sessão Watson:', error);
    throw error;
  }
}
