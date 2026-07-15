// Decide o que fazer com cada mensagem recebida: onboarding, comando de
// pareamento, ou conversa normal. Devolve o(s) texto(s) a enviar de volta.
import * as db from "./db.js";
import { gerarResposta, gerarResumo } from "./claude.js";

const RESUMO_A_CADA = 4; // regenera o resumo do parceiro a cada N falas da pessoa

export async function tratarMensagem(phone, texto) {
  let user = (await db.getUser(phone)) ?? (await db.createUser(phone));

  // ── Onboarding ──────────────────────────────────────────
  if (user.state === "new") {
    await db.updateUser(phone, { state: "awaiting_name" });
    return [
      "Oi 🌿 Eu sou o DesConflito, um espaço pra pensar a sua relação com mais clareza.",
      "Antes de começar, como você gosta de ser chamado(a)?",
    ];
  }

  if (user.state === "awaiting_name") {
    const nome = texto.trim().split(/\s+/)[0].slice(0, 40);
    await db.updateUser(phone, { name: nome, state: "active" });
    return [
      `Prazer, ${nome}. Aqui você pode desabafar, organizar o que quer dizer pro seu par, ou pensar um conflito com calma. É só me contar o que está acontecendo.`,
      'Se quiser, você e seu par podem se vincular: digite *meu código* pra gerar um código, ou *vincular 123456* pra entrar no código da outra pessoa. Vinculados, eu entendo melhor a dinâmica de vocês — sempre respeitando a privacidade de cada um.',
    ];
  }

  // ── Comandos de pareamento ──────────────────────────────
  const t = texto.trim().toLowerCase();

  if (t === "meu código" || t === "meu codigo" || t === "gerar código" || t === "gerar codigo") {
    if (user.couple_id) return ["Você já está vinculado(a) a um par 💛"];
    const code = await db.createCoupleFor(phone);
    return [
      `Seu código de vínculo é *${code}*.`,
      `Peça pro seu par me mandar aqui: *vincular ${code}*`,
    ];
  }

  const m = t.match(/^vincular\s+(\d{6})$/);
  if (m) {
    if (user.couple_id) return ["Você já está vinculado(a) a um par 💛"];
    const r = await db.joinCoupleByCode(phone, m[1]);
    if (!r.ok && r.reason === "not_found") return ["Não achei esse código. Confere com seu par se está certinho?"];
    if (!r.ok && r.reason === "full") return ["Esse casal já está completo com duas pessoas."];
    return ["Pronto, vocês estão vinculados 💛 Suas conversas continuam privadas — eu só uso o contexto dos dois pra te ajudar melhor, nunca revelo o que o outro diz."];
  }

  // ── Conversa normal ─────────────────────────────────────
  await db.addMessage(phone, "user", texto);
  const historico = await db.getRecentMessages(phone, 20);

  // Contexto interno do parceiro (só o resumo destilado, nunca falas cruas).
  const partnerPhone = await db.getPartnerPhone(phone, user.couple_id);
  const resumoParceiro = partnerPhone ? await db.getSummary(partnerPhone) : null;

  const resposta = await gerarResposta({ historico, nome: user.name, resumoParceiro });
  await db.addMessage(phone, "assistant", resposta);

  // Atualiza, de vez em quando, o resumo desta pessoa (para o parceiro ver como
  // contexto interno). Roda em background pra não atrasar a resposta.
  const n = await db.countUserMessages(phone);
  if (user.couple_id && n % RESUMO_A_CADA === 0) {
    gerarResumo(historico)
      .then((resumo) => db.upsertSummary(phone, resumo))
      .catch((e) => console.error("Falha ao gerar resumo:", e.message));
  }

  return [resposta];
}
