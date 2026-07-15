// Ponto de entrada: recebe webhooks da Meta e responde via Claude.
import express from "express";
import { verifyWebhook, parseInbound, sendText } from "./whatsapp.js";
import { tratarMensagem } from "./router.js";

const app = express();
app.use(express.json());

// Meta chama isto (GET) uma vez, ao configurar o webhook.
app.get("/webhook", verifyWebhook);

// Dedupe simples: a Meta reenvia se você demorar a responder 200.
const processados = new Set();

app.post("/webhook", async (req, res) => {
  res.sendStatus(200); // responde rápido; processa depois

  const msg = parseInbound(req.body);
  if (!msg) return;
  if (processados.has(msg.id)) return;
  processados.add(msg.id);
  if (processados.size > 1000) processados.clear();

  try {
    const respostas = await tratarMensagem(msg.from, msg.text);
    for (const texto of respostas) await sendText(msg.from, texto);
  } catch (err) {
    console.error("Erro ao tratar mensagem:", err);
    await sendText(msg.from, "Tive um probleminha aqui 😕 Pode tentar de novo em instantes?");
  }
});

app.get("/", (_req, res) => res.send("DesConflito bot no ar 🌿"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ DesConflito bot rodando na porta ${PORT}`));
