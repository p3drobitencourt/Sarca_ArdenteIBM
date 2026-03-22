# Guia Rápido: Configuração IBM App ID para Desenvolvimento Local

## 📋 Pré-requisitos
- Ter acesso ao IBM Cloud Console
- Ter um serviço IBM Cloud App ID criado
- Ter um app registrado no App ID

## 🔧 Passo 1: Encontrar Tenant ID

1. Acesse: https://cloud.ibm.com/
2. Vá para **App ID** → **Manage Authentication** (sua instância)
3. Clique em **Overview**
4. Copie o **Tenant ID**

```
APPID_TENANT_ID=<copie daqui>
```

## 🌐 Passo 2: OAuth Server URL

Na mesma página **Overview**, você verá:
- OAuth Server URL (exemplo: `https://us-south.appid.cloud.ibm.com`)

```
APPID_OAUTH_SERVER_URL=https://<region>.appid.cloud.ibm.com
```

## 🔐 Passo 3: Client ID e Client Secret

1. Vá para **Applications** (no menu esquerdo)
2. Clique na sua aplicação ou crie uma nova
3. Copie:
   - **Client ID**
   - **Client Secret**

```
APPID_CLIENT_ID=<copie>
APPID_CLIENT_SECRET=<copie>
```

## 🔄 Passo 4: Redirect URI

1. Na mesma página de Application, vá para **Redirect URLs**
2. Adicione a URL de callback para desenvolvimento local:

```
http://localhost:3000/api/auth/callback
```

3. Cole no `.env.local`:

```
APPID_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

## ☁️ Passo 5: Cloudant (Banco de Dados)

1. Acesse seu serviço Cloudant
2. Em **Service credentials**, copie:
   - **apikey** (API Key)
   - **url** (Database URL)

```
CLOUDANT_APIKEY=<copie>
CLOUDANT_URL=<copie>
CLOUDANT_DB_NAME=sarca_ardente
```

## ✅ Validação

Após preencher `.env.local`, execute:

```bash
npm run dev
```

Você deve ver:
```
  ▲ Next.js 15.3.3
  - Local:        http://localhost:3000
```

## 🧪 Teste do OAuth

1. Acesse http://localhost:3000
2. Clique em **"Fazer Login com IBM App ID"**
3. Você será redirecionado para o IBM App ID
4. Após se autenticar, deve voltar para `/dashboard`

## ⚠️ Troubleshooting

| Erro | Solução |
|------|---------|
| `invalid_client` | Verifique Client ID e Secret |
| `redirect_uri_mismatch` | Certifique-se que a URL em `.env.local` é idêntica ao registrado no App ID |
| `Connection refused` | Verifique Cloudant URL e credenciais |
| `APPID_TENANT_ID is missing` | Preencha `APPID_TENANT_ID` no `.env.local` |

## 📱 Próximas etapas

Depois de validar o login:
1. Implemente página de membros (`/members`) com Cloudant CRUD
2. Crie página de attendance (`/attendance/record`)
3. Configure rota de logout (`/api/auth/logout`)
