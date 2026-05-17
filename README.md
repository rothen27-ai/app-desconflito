# DesConflito / Acordo Entre Nós

**Espaço para construir a relação com mais clareza** 🌿

Aplicativo para casais — comunicação, acordos, autoconhecimento e projetos em comum. Baseado na metodologia ACL de Anna R. Nabergoi.

---

## Arquitetura atual

Arquivo único HTML (`DesConflito_App_vNN.html`) com React 18 via CDN e Babel Standalone. Sem build necessário. Backend leve em Express (`server.js`) para proxy da API Claude em ambiente local.

```
desconflito/
├── DesConflito_App_v10.html   # App principal (versão ativa)
├── server.js                  # Proxy Node/Express para API Claude (uso local)
├── package.json
└── README.md
```

---

## Modos de acesso

### Demo Mode
Sem API Key, sem cadastro. Respostas da IA são pré-escritas (mock). Ideal para apresentação e testes de usabilidade.

### Modo Real (Supabase + API Claude)
Casal cria conta via Supabase (dados persistidos). IA ativa via chamada direta à API Claude com chave própria, ou via proxy local (`server.js`).

---

## Funcionalidades

### 🤝 Mapa de Acordos
Mapeamento de acordos por áreas de vida. Quatro status: **Expresso**, **Tácito**, **Conflitante**, **Inexistente**. IA gera reflexões e perguntas por status, e propõe compromissos concretos via Console do Acordo.

### 💬 Comunicação Assertiva (CNV)
Quatro campos guiados: Observo / Sinto / Necessito / Peço. IA revisa e refina a mensagem, ou sinaliza quando falta contexto. Inclui **Emocionário**: etimologia, significado e poesia clássica para nomear a emoção.

### 🎯 Projetos em Comum
Criação e acompanhamento de projetos do casal com dicas geradas por IA.

### 💓 Check-in Relacional
Termômetro do clima da relação em quatro dimensões: Humor, Abertura, Tensão, Conexão. Cada parceiro responde individualmente; o app compara as perspectivas.

### 📖 Meu Enredo
Auto-reflexão guiada em cinco temas: A Mente Humana, Medos e Tensões, Eu Autêntico, Causa ou Efeito, Meu Enredo de Vida. IA gera síntese personalizada ao final.

### 📚 Leituras
Biblioteca de artigos temáticos sobre comunicação, conflito, conexão, sexualidade, finanças, parentalidade e autoconhecimento. IA gera o conteúdo completo sob demanda.

### 📋 Histórico de Acordos
Registro cronológico de todos os acordos criados.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 (CDN), Babel Standalone, Fraunces + DM Sans |
| IA | Claude Sonnet (`claude-sonnet-4-20250514`) via API Anthropic |
| Backend (local) | Node.js + Express (proxy de API Key) |
| Banco de dados | Supabase (modo real) / localStorage (sessão demo) |
| Auth | Código de casal gerado pelo Supabase |

---

## Setup local (com IA ativa)

```bash
# Instalar dependência
npm install

# Configurar API Key
export ANTHROPIC_API_KEY="sua_chave_aqui"

# Iniciar servidor proxy
npm start
# → http://localhost:3000
```

Abrir `http://localhost:3000` no Chrome. O `server.js` serve o HTML e faz proxy das chamadas para `api.anthropic.com`.

---

## Design System

Cores base:
- Primary: `#2D4A3E` (verde escuro)
- Accent: `#5C8A6A` (verde médio)
- Background: `#F4F6F3` (off-white)
- Text: `#1A2820`
- Muted: `#6B7F72`

Componentes: `Card`, `Btn`, `Tag`, `TA` (textarea), `In` (input), `Hdr` (header sticky), `Dots` (loading), `Spinner`.

---

## Versionamento

Cada feature relevante gera nova versão do arquivo HTML. Convenção: `DesConflito_App_vNN.html`. Versões antigas são mantidas em `legacy/` antes de serem removidas.

---

## Corpus ACL

A base teórica do app vem do corpus ACL (Anna R. Nabergoi), organizado em vault Obsidian. Arquivos `ACL_C0X_*.md` no projeto são transcrições curadas dos 7 cursos. Fase 2 prevê integração via RAG.

---

## Roadmap

- **v11+** — revisões e novas features conforme roadmap interno
- **Fase 2** — backend persistente (React Native + PostgreSQL), contas de casal, memória de IA em três camadas, integração RAG com corpus ACL
- **Compliance** — revisão LGPD antes do lançamento público

---

## Notas de privacidade

- Modo Demo: dados apenas em memória de sessão
- Modo Real: dados no Supabase, nenhum dado de conversa armazenado pela IA
- Revisão LGPD pendente antes de produção pública
