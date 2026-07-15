// Orquestrador do Claude: monta o prompt e chama a API. Só ele "fala" com o Claude.
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, contextoParceiro, SUMMARY_PROMPT } from "./prompt.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Troque por "claude-sonnet-5" se quiser reduzir custo/latência.
const MODEL = "claude-opus-4-8";

// Gera a resposta do bot para a conversa atual.
export async function gerarResposta({ historico, nome, resumoParceiro }) {
  let system = SYSTEM_PROMPT;
  if (nome) system += `\n\nO nome de quem você está ajudando é ${nome}.`;
  system += contextoParceiro(resumoParceiro);

  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    thinking: { type: "adaptive" },
    system,
    messages: historico,
  });

  return resp.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}

// Destila o histórico da pessoa num resumo emocional (sem falas cruas),
// usado como contexto interno para o parceiro. Barato e curto.
export async function gerarResumo(historico) {
  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: 400,
    system: SUMMARY_PROMPT,
    messages: [
      {
        role: "user",
        content:
          "Conversa a resumir:\n\n" +
          historico.map((m) => `${m.role === "user" ? "Pessoa" : "Bot"}: ${m.content}`).join("\n"),
      },
    ],
  });

  return resp.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}
