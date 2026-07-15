# DesConflito Bot — WhatsApp 🌿

Assistente conversacional de relacionamento no WhatsApp, guiado pela metodologia ACL (Anna R. Nabergoi). Cada pessoa conversa em privado; casais podem se vincular por código, e o bot usa o contexto dos dois **sem nunca revelar** o que um disse ao outro (modelo "confidente separado").

## Arquitetura

```
WhatsApp (Meta Cloud API) ──webhook──▶ Backend Node/Express
                                          ├─ whatsapp.js  (traduz Meta ↔ interno)
                                          ├─ router.js    (onboarding / pareamento / conversa)
                                          ├─ claude.js    (fala com o Claude)
                                          └─ db.js        (Supabase: usuários, msgs, resumos)
                                                   │
                                          Supabase (Postgres)   API Claude (Opus 4.8)
```

## Setup

### 1. Banco (Supabase)
1. Crie um projeto em [supabase.com](https://supabase.com).
2. SQL Editor → cole e rode o conteúdo de `db/schema.sql`.
3. Settings → API → copie a **Project URL** e a chave **`service_role`**.

### 2. Variáveis de ambiente
```bash
cp .env.example .env
# preencha ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY
# e invente um WHATSAPP_VERIFY_TOKEN (qualquer texto secreto)
```

### 3. Rodar localmente
```bash
npm install
npm run dev        # http://localhost:3000
```

### 4. Expor pra internet (a Meta precisa de HTTPS público)
Em desenvolvimento, use ngrok:
```bash
npx ngrok http 3000
# copie a URL https://xxxx.ngrok-free.app
```

## Conectar ao WhatsApp (Meta Cloud API)

1. **Conta Meta for Developers:** [developers.facebook.com](https://developers.facebook.com) → *My Apps* → *Create App* → tipo **Business**.
2. No app, adicione o produto **WhatsApp**.
3. Na aba **API Setup**:
   - Copie o **Temporary access token** → `WHATSAPP_TOKEN`
   - Copie o **Phone number ID** (do número de teste que a Meta te dá) → `WHATSAPP_PHONE_NUMBER_ID`
   - Adicione o **seu** número em *"To"* para poder testar recebendo mensagens.
4. **Configurar o webhook:** aba **Configuration** → Webhook → *Edit*:
   - **Callback URL:** `https://xxxx.ngrok-free.app/webhook`
   - **Verify token:** o mesmo valor de `WHATSAPP_VERIFY_TOKEN`
   - Clique *Verify and save* (o servidor precisa estar rodando).
   - Em *Webhook fields*, assine **`messages`**.
5. Mande uma mensagem do seu WhatsApp para o número de teste. Deve responder 🌿

### Ir para produção
- O token temporário expira em ~24h. Gere um **token permanente**: crie um *System User* no [Business Manager](https://business.facebook.com), dê acesso ao app, e gere um token permanente com a permissão `whatsapp_business_messaging`.
- Registre um número próprio (verificação da Meta) em vez do número de teste.
- Faça deploy num host com HTTPS (Railway, Render, Fly, ou uma VPS) e aponte a Callback URL pra lá.
- **LGPD:** você guarda conversas sensíveis. Antes de abrir ao público, defina política de privacidade, consentimento e retenção/exclusão de dados.

## Comandos do usuário
- `meu código` — gera um código de 6 dígitos pra vincular o par.
- `vincular 123456` — entra no código do par.
- Qualquer outra coisa — conversa normal com o assistente.

## Trocar o modelo
Em `src/claude.js`, `MODEL = "claude-opus-4-8"`. Para reduzir custo/latência, troque por `"claude-sonnet-5"`.
