import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import { calculateLagna } from "./utils/lagna.js";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors()); // If you want to restrict: app.use(cors({ origin: ["https://<your-vercel-domain>"] }))
app.use(bodyParser.json());
app.use(morgan("dev"));

const PORT = process.env.PORT || 10000;

// Small helper to coerce & validate
function parseInputs(body) {
  const date = String(body.date || "").trim();   // "YYYY-MM-DD"
  const time = String(body.time || "").trim();   // "HH:mm" (24h)
  const lat = parseFloat(body.lat);
  const lon = parseFloat(body.lon);
  const tz  = parseFloat(body.tz);

  const errors = [];
  if (!date) errors.push("date is required (YYYY-MM-DD).");
  if (!time) errors.push("time is required (HH:mm 24h).");
  if (!Number.isFinite(lat)) errors.push("lat must be a number.");
  if (!Number.isFinite(lon)) errors.push("lon must be a number.");
  if (!Number.isFinite(tz))  errors.push("tz must be a number (e.g. -4, 5.5).");

  return { date, time, lat, lon, tz, errors };
}

// Health
app.get("/", (_req, res) => {
  res.json({ ok: true, service: "raju-oracle-backend" });
});

// ✅ Lagna route - always return { lagnaData: ... }
app.post("/api/lagna", (req, res) => {
  try {
    const { date, time, lat, lon, tz, errors } = parseInputs(req.body);
    if (errors.length) return res.status(400).json({ error: errors.join(" ") });

    const lagnaData = calculateLagna(date, time, lat, lon, tz);

    // If your calculator signals failure, surface it
    if (!lagnaData || !Array.isArray(lagnaData.houses) || lagnaData.houses.length === 0) {
      return res.status(422).json({ error: "Failed to compute chart.", lagnaData });
    }

    res.json({ lagnaData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lagna calculation failed" });
  }
});

// ✅ AI Reading route - uses same validated inputs
app.post("/api/reading", async (req, res) => {
  try {
    const { date, time, lat, lon, tz, errors } = parseInputs(req.body);
    if (errors.length) return res.status(400).json({ error: errors.join(" ") });

    const lagnaData = calculateLagna(date, time, lat, lon, tz);

    if (!lagnaData || !Array.isArray(lagnaData.houses) || lagnaData.houses.length === 0) {
      // Still return a friendly message but surface the issue so the frontend can show a toast
      return res.status(422).json({
        error: "Chart could not be computed. Check your inputs.",
        lagnaData
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY on server." });
    }

    const openai = new OpenAI({ apiKey });

    const prompt = `
You are an expert Vedic astrologer. Based on the following planetary and ascendant data,
write a personal astrology reading in natural, warm, encouraging language (avoid technical jargon).

--- DATA ---
${JSON.stringify(lagnaData, null, 2)}
--- END DATA ---
    `.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a kind and insightful Vedic astrologer." },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
    });

    const reading = completion.choices?.[0]?.message?.content ?? "";
    res.json({ reading, lagnaData });
  } catch (err) {
    console.error("AI reading error:", err);
    res.status(500).json({ error: "Failed to generate reading" });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
