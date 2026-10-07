import express from "express";
import Groq from "groq-sdk";

const app = express();
const chave = (process.env.GROQ_API_KEY || "").replace(/[^A-Za-z0-9_]/g, "");
const groq = new Groq({ apiKey: chave });

const SISTEMA = `You write scripts for faceless YouTube videos.
Return ONLY valid JSON in this format:
{"titulo": "...", "cenas": [{"narracao": "...", "palavra_chave": "..."}]}
Rules: 6 to 10 scenes. Each narration is 1-2 short punchy sentences with a curiosity hook in the first scene. palavra_chave is 1-3 English words to search stock footage. Write the narration in the same language as the user's prompt.`;

app.get("/diagnostico", (req, res) => {
  res.json({
    comprimento: chave.length,
    comeca_com_gsk: chave.startsWith("gsk_")
  });
});

app.get("/roteiro", async (req, res) => {
  try {
    const prompt = req.query.prompt;
    if (!prompt) return res.status(400).json({ erro: "Falta o prompt" });

    const r = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SISTEMA },
        { role: "user", content: prompt }
      ]
    });

    res.json(JSON.parse(r.choices[0].message.content));
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

app.listen(process.env.PORT || 3000);
