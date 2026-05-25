const express = require("express");
const path = require("path");

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.redirect("/DesConflito_App_v12.html");
});

// ─── CONFIGURE SUA API KEY AQUI ───────────────────────────────────
const API_KEY = process.env.ANTHROPIC_API_KEY || "SUA_API_KEY_AQUI";
// ──────────────────────────────────────────────────────────────────

app.post("/api/chat", async (req, res) => {
  try {
    const { model, max_tokens, system, messages } = req.body;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({
        model: model || "claude-sonnet-4-20250514",
        max_tokens: max_tokens || 1500,
        system,
        messages,
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Erro na chamada API:", err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log("");
  console.log("  ✅  DesConflito Demo rodando!");
  console.log(`  →   Abra no Chrome: http://localhost:${PORT}`);
  console.log("");
  if (API_KEY === "SUA_API_KEY_AQUI") {
    console.log("  ⚠️  API Key não configurada.");
    console.log("      Edite server.js e substitua SUA_API_KEY_AQUI pela sua chave.");
    console.log("");
  }
});
