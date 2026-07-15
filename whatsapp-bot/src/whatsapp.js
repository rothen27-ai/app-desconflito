// Tradução entre a WhatsApp Cloud API (Meta) e o mundo interno.
// Só este arquivo sabe o formato do webhook e como enviar mensagens.

const GRAPH = "https://graph.facebook.com/v21.0";

// Verificação do webhook (GET) exigida pela Meta ao configurar.
export function verifyWebhook(req, res) {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
}

// Extrai {from, text} de um webhook de entrada, ou null se não for mensagem de texto.
export function parseInbound(body) {
  const value = body?.entry?.[0]?.changes?.[0]?.value;
  const msg = value?.messages?.[0];
  if (!msg || msg.type !== "text") return null; // ignora status, mídia, etc.
  return { from: msg.from, text: msg.text.body, id: msg.id };
}

// Envia uma mensagem de texto.
export async function sendText(to, text) {
  const res = await fetch(`${GRAPH}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    }),
  });
  if (!res.ok) console.error("Erro ao enviar WhatsApp:", res.status, await res.text());
}
