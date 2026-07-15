# Instruções para o Claude Code — Finalizar o DesConflito Bot (WhatsApp)

> **Leia isto primeiro.** Este arquivo é um roteiro pra VOCÊ, Claude Code, conduzir o dono deste projeto (que não é programador) até colocar o chatbot no ar. Ele recebeu um "start" pronto de um amigo e precisa terminar a configuração. Conduza com paciência, **um passo de cada vez**, confirmando cada etapa antes de seguir.

## Como você deve agir

- Fale de forma simples, sem jargão. O usuário pode não saber o que é terminal, API, webhook. Explique o mínimo necessário em cada passo.
- Vá **um passo por vez**. Depois de cada passo, verifique que deu certo antes de avançar.
- Rode você mesmo os comandos de terminal quando puder. Os passos de navegador (criar contas, copiar chaves) o usuário faz — dê instruções cliqueáveis e peça pra ele colar de volta o que precisa.
- Nunca peça pra ele colar segredos no chat sem necessidade; o lugar dos segredos é o arquivo `.env`. Se ele colar uma chave, ajude a colocá-la no `.env` e siga.
- Marque o progresso. Ao terminar cada item, diga o que já está feito e o que falta.

## O que este projeto é

Um chatbot de WhatsApp que ajuda casais a se comunicarem melhor, guiado pela metodologia ACL. Cada pessoa conversa em privado; casais podem se vincular por um código e o bot usa o contexto dos dois **sem nunca revelar** o que um disse ao outro ("confidente separado"). A inteligência é o Claude (API da Anthropic).

## O que JÁ está pronto (não precisa mexer)

Todo o código do backend, testado e funcionando:

- `src/server.js` — recebe as mensagens do WhatsApp e responde
- `src/whatsapp.js` — conversa com a API do WhatsApp (Meta)
- `src/router.js` — decide o que fazer: boas-vindas, vínculo de casal, ou conversa
- `src/claude.js` — chama o Claude para gerar as respostas
- `src/prompt.js` — a "personalidade" e o método ACL do bot
- `src/db.js` — guarda usuários, mensagens e resumos no Supabase
- `db/schema.sql` — as tabelas do banco de dados

O `README.md` tem a referência técnica completa. Este arquivo é o passo a passo guiado.

## O que FALTA fazer (seu roteiro)

Conduza o usuário por estes passos, nesta ordem.

### Passo 0 — Pré-requisitos
Verifique se o Node.js está instalado: rode `node --version`. Precisa ser 20 ou maior (idealmente 22+, por causa do `--env-file`).
- Se não tiver, oriente a instalar em https://nodejs.org (versão LTS).
Depois, dentro da pasta `whatsapp-bot`, rode `npm install`.

### Passo 1 — Banco de dados (Supabase)
O bot precisa de um banco pra lembrar as conversas. Usaremos o Supabase (tem plano grátis).
1. Peça pro usuário criar conta e um projeto novo em https://supabase.com (guarde a senha do banco).
2. No projeto: menu **SQL Editor** → **New query** → ele cola TODO o conteúdo do arquivo `db/schema.sql` → **Run**. Isso cria as tabelas. (Você pode abrir o arquivo e mostrar o conteúdo pra ele copiar.)
3. Menu **Settings → API**: ele copia dois valores:
   - **Project URL**
   - **service_role** (é uma chave secreta longa; NÃO é a "anon")
4. Guarde esses dois valores pro Passo 3.

### Passo 2 — Chave do Claude (Anthropic)
1. Peça pro usuário criar conta em https://console.anthropic.com e adicionar créditos (o uso é pago por mensagem).
2. Em **API Keys**, criar uma chave nova e copiar. Guarde pro Passo 3.

### Passo 3 — Arquivo de configuração (.env)
1. Copie o modelo: rode `cp .env.example .env`.
2. Abra o `.env` e preencha com os valores coletados:
   - `ANTHROPIC_API_KEY` = chave do Passo 2
   - `SUPABASE_URL` = Project URL do Passo 1
   - `SUPABASE_SERVICE_KEY` = chave service_role do Passo 1
   - `WHATSAPP_VERIFY_TOKEN` = invente qualquer texto secreto (ex: `desconflito-2025-xyz`). Anote, será usado no Passo 6.
   - Os dois `WHATSAPP_*` restantes ficam pro Passo 5.
3. Confirme que o `.env` **não** vai pro Git (o `.gitignore` já cuida disso).

### Passo 4 — Rodar localmente
Rode `npm run dev`. Deve aparecer "✅ DesConflito bot rodando na porta 3000".
Teste rápido: em outro terminal, `curl http://localhost:3000/` deve responder "DesConflito bot no ar 🌿".
Deixe rodando.

### Passo 5 — Conectar ao WhatsApp (Meta Cloud API)
Esta é a parte mais trabalhosa; vá com calma.
1. **Expor o servidor pra internet:** em outro terminal, `npx ngrok http 3000`. Copie a URL `https://...ngrok-free.app` que aparecer. (A Meta exige um endereço público com HTTPS.)
2. Conta de desenvolvedor: https://developers.facebook.com → **My Apps** → **Create App** → tipo **Business**.
3. No app, adicione o produto **WhatsApp**.
4. Aba **API Setup**: o usuário copia
   - **Temporary access token** → coloque em `WHATSAPP_TOKEN` no `.env`
   - **Phone number ID** (do número de teste que a Meta fornece) → `WHATSAPP_PHONE_NUMBER_ID` no `.env`
   - Em **"To"**, adicione o número de WhatsApp pessoal dele, pra poder testar.
5. Como você mudou o `.env`, reinicie o servidor (pare com Ctrl+C e rode `npm run dev` de novo).

### Passo 6 — Configurar o webhook
1. Ainda no app da Meta: aba **Configuration** (ou "Webhooks") → **Edit**.
   - **Callback URL:** a URL do ngrok + `/webhook` (ex: `https://xxxx.ngrok-free.app/webhook`)
   - **Verify token:** exatamente o mesmo `WHATSAPP_VERIFY_TOKEN` do `.env`
   - Clique **Verify and save** (o servidor e o ngrok precisam estar rodando).
2. Em **Webhook fields**, assine o campo **`messages`**.

### Passo 7 — Testar 🎉
Peça pro usuário mandar uma mensagem, do WhatsApp dele, para o número de teste da Meta. O bot deve responder com as boas-vindas. Se travar, veja o terminal onde o `npm run dev` está rodando — os erros aparecem lá.

Fluxo esperado: bot pergunta o nome → depois é só conversar. Comandos: `meu código` gera código de vínculo; `vincular 123456` entra no código do par.

## Depois que funcionar — passos de produção

Avise que o que temos até aqui é um protótipo rodando na máquina dele. Pra virar algo de verdade:

1. **Token permanente:** o token da Meta do Passo 5 expira em ~24h. Oriente a criar um *System User* no https://business.facebook.com, dar acesso ao app e gerar um token permanente com a permissão `whatsapp_business_messaging`.
2. **Deploy:** subir o backend num serviço que fica sempre no ar (Railway, Render ou Fly.io), em vez do ngrok. Assim a Callback URL vira fixa. (Você pode ajudar com isso quando ele pedir.)
3. **Número próprio:** registrar e verificar um número de WhatsApp real, no lugar do número de teste.
4. **LGPD (importante):** o bot guarda conversas íntimas de casais. Antes de abrir pra outras pessoas, é preciso: aviso de privacidade, consentimento, e um jeito de apagar os dados de alguém que peça. Sugira implementar um comando `apagar meus dados` — ofereça-se pra fazer isso quando ele quiser.

## Se algo der errado
- Erro ao subir o servidor → geralmente falta preencher o `.env` ou rodar `npm install`.
- "Verify and save" falha na Meta → confira que o servidor e o ngrok estão rodando e que o Verify token bate exatamente.
- Bot não responde → olhe o terminal do `npm run dev`; confirme que o campo `messages` foi assinado no webhook.
- Trocar o modelo de IA (custo/velocidade): em `src/claude.js`, a linha `MODEL`. `claude-opus-4-8` é o mais capaz; `claude-sonnet-5` é mais barato e rápido.
