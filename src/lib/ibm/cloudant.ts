import { CloudantV1 } from '@ibm-cloud/cloudant';
import { IamAuthenticator } from 'ibm-cloud-sdk-core';

export function getCloudantClient(): CloudantV1 {
  const url = process.env.IBM_CLOUDANT_URL;
  const apiKey = process.env.IBM_CLOUDANT_API_KEY;

  if (!url || !apiKey) {
    throw new Error('CONFIGURAÇÃO FALTANDO: Verifique o seu arquivo .env.local');
  }

  const authenticator = new IamAuthenticator({ apikey: apiKey });
  
  return new CloudantV1({
    authenticator: authenticator,
    serviceUrl: url,
  });
}