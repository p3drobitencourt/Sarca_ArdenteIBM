# IBM Cloud Deployment Guide - Sarça Ardente

## 📋 Pré-requisitos

- Conta IBM Cloud ativa
- IBM Cloud CLI instalado: https://cloud.ibm.com/docs/cli
- Node.js 18+ instalado
- Git

## 🚀 Passo 1: Instalar IBM Cloud CLI

```bash
# Windows (PowerShell como Admin)
iex(New-Object Net.WebClient).DownloadString('https://ibm.biz/ibm-cli-installer-windows')

# macOS
curl -fsSL https://clis.cloud.ibm.com/install/osx | sh

# Linux
curl -fsSL https://clis.cloud.ibm.com/install/linux | sh
```

## 🔑 Passo 2: Autenticar no IBM Cloud

```bash
# Login com email e senha
ibmcloud login -u seu-email@exemplo.com

# Ou com credenciais da API
ibmcloud login --apikey SEU_API_KEY

# Selecionar a conta e região
ibmcloud target -r us-south
```

## 📦 Passo 3: Criar Serviços IBM Cloud

### 3.1 Criar instância de Cloudant (banco de dados)

```bash
ibmcloud resource service-instance-create cloudant-sarca cloudantnosqldb lite us-south
```

### 3.2 Criar instância de App ID (autenticação)

```bash
ibmcloud resource service-instance-create appid-sarca appid lite us-south
```

### 3.3 Criar instância de Watson Assistant (IA)

```bash
ibmcloud resource service-instance-create watson-assistant-sarca conversation-v1 lite us-south
```

## 🔐 Passo 4: Obter Credenciais dos Serviços

### Credenciais Cloudant
```bash
ibmcloud resource service-key-create cloudant-sarca-key Manager --instance-name cloudant-sarca

# Copiar URL e API Key do output
```

### Credenciais App ID
```bash
ibmcloud resource service-key-create appid-sarca-key Manager --instance-name appid-sarca
```

### Credenciais Watson Assistant
```bash
ibmcloud resource service-key-create watson-assistant-sarca-key Manager --instance-name watson-assistant-sarca
```

## 🔧 Passo 5: Configurar Variáveis de Ambiente

Criar arquivo `.env.local` (desenvolvimento) e `.env.production` (produção):

```bash
# IBM Cloudant
IBM_CLOUDANT_URL=https://xxxxx-bluemix.cloudant.com
IBM_CLOUDANT_API_KEY=sua-chave-api

# IBM App ID
IBM_APPID_INSTANCE=sua-instancia-appid
IBM_APPID_CLIENT_ID=seu-client-id
IBM_APPID_CLIENT_SECRET=seu-client-secret
IBM_APPID_REDIRECT_URI=https://sarca-ardente.cloud.ibm.com/auth/callback
IBM_APPID_REGION=us-south

# IBM Watson Assistant
IBM_WATSON_ASSISTANT_URL=https://api.us-south.assistant.watson.cloud.ibm.com
IBM_WATSON_ASSISTANT_API_KEY=sua-watson-api-key
IBM_WATSON_ASSISTANT_ID=seu-assistant-id
IBM_WATSON_ASSISTANT_VERSION=2023-06-15

# Next.js
NEXT_PUBLIC_API_URL=https://sarca-ardente.cloud.ibm.com
NODE_ENV=production
```

## 📚 Passo 6: Instalar Dependências IBM Cloud

```bash
npm install @ibm-cloud/cloudant ibm-cloud-sdk-core
npm install axios # Para Watson API calls
```

## 🗄️ Passo 7: Criar Databases no Cloudant

Após configurar `.env.local`, execute:

```bash
npm run setup:cloudant
```

Este comando:
- Conecta ao Cloudant
- Cria 4 databases: `membros`, `classes`, `reunioes`, `presencas`
- Cria índices para melhor performance

**Script ref:** `scripts/setup-cloudant.ts`

## 🏗️ Passo 8: Preparar a Aplicação

### Substituir imports Firebase → IBM Cloud

Atualizar em todos os componentes:

**De:**
```typescript
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
```

**Para:**
```typescript
import { getCloudant } from '@/lib/ibm/cloudant';
import { getAppIDConfig } from '@/lib/ibm/appid';
```

### Alterar AuthContext para App ID

Ver `src/context/AuthContext-IBM.tsx`

### Atualizar páginas de Login

Ver `src/app/login/page-ibm.tsx`

## 📦 Passo 9: Build e Deploy

### Build da aplicação
```bash
npm run build
```

### Deploy no IBM Cloud App Engine

```bash
# Usando manifest.yml
ibmcloud cf push sarca-ardente

# Ou usando App Engine CLI
ibmcloud app engine application create sarca-ardente \
  --source . \
  --build-type nodejs \
  --port 3000
```

### Verificar status do deploy
```bash
ibmcloud app logs sarca-ardente --recent
ibmcloud app env sarca-ardente
```

## 🧪 Passo 10: Testes Pós-Deploy

1. **Acessar a aplicação**
   - https://sarca-ardente.cloud.ibm.com

2. **Teste de autenticação**
   - Fazer login com credenciais cadastradas no App ID

3. **Teste de banco de dados**
   - Criar novo membro
   - Verificar em Cloudant dashboard

4. **Teste de IA Watson**
   - Acessar componentes com integração Watson
   - Verificar respostas de IA

## 📊 Monitoramento

### Ver logs
```bash
ibmcloud cf logs sarca-ardente --follow
```

### Ver métricas
```bash
ibmcloud app summary sarca-ardente
```

### Acessar dashboards
- Cloudant: https://cloud.ibm.com/resources
- App ID: https://cloud.ibm.com/resources
- Watson: https://cloud.ibm.com/resources

## 🆘 Resolução de Problemas

### Problema: "Service credentials not found"
```bash
# Verificar serviços vinculados
ibmcloud cf services

# Vincular manualmente
ibmcloud cf bind-service sarca-ardente cloudant-sarca
ibmcloud cf bind-service sarca-ardente appid-sarca
```

### Problema: "Connection timeout to Cloudant"
- Verificar se IBM_CLOUDANT_URL está correto
- Verificar API Key
- Verificar firewall/VPN

### Problema: "Token validation failed"
- Regenerar App ID credentials
- Verificar IBM_APPID_CLIENT_ID e CLIENT_SECRET
- Limpar cookies do navegador

## 📚 Referências

- [IBM Cloud CLI](https://cloud.ibm.com/docs/cli)
- [Cloudant Documentation](https://cloud.ibm.com/docs/Cloudant)
- [App ID Documentation](https://cloud.ibm.com/docs/appid)
- [Watson Assistant Documentation](https://cloud.ibm.com/docs/assistant)

---

## 💡 Dicas

1. **Desenvolvimento local**: Use `.env.local` com credenciais de teste
2. **Staging**: Use `.env.staging` com ambiente de teste
3. **Produção**: Use variáveis de ambiente do IBM Cloud
4. **Logs**: Sempre monitorar aplicação nas primeiras 24h após deploy
5. **Scaling**: Ajustar instâncias conforme necessário via `manifest.yml`

---

**Grupo**: Enrique, Pedro, Luis Gustavo, João Henrique  
**Data**: 26/03 - 20:45  
**Disciplina**: Computação em Nuvem - SI 2025
