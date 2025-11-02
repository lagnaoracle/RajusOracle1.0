import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import { calculateLagna } from "./utils/lagna.js";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(morgan("dev"));

const PORT = process.env.PORT || 10000;

// ✅ Lagna route
app.post("/api/lagna", (req, res) => {
  try {
    const { date, time, lat, lon, tz } = req.body;
    const result = calculateLagna(date, time, lat, lon, tz);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lagna calculation failed" });
  }
});

// ✅ AI Reading route
app.post("/api/reading", async (req, res) => {
  try {
    const { date, time, lat, lon, tz } = req.body;
    const lagnaData = calculateLagna(date, time, lat, lon, tz);

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
    You are an expert Vedic astrologer. Based on the following planetary and ascendant data,
    write a personal astrology reading in natural, poetic language (avoid technical jargon).

    --- DATA ---
    ${JSON.stringify(lagnaData, null, 2)}
    --- END DATA ---
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a kind and insightful Vedic astrologer." },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
    });

    const reading = completion.choices[0].message.content;
    res.json({ reading, lagnaData });
  } catch (err) {
    console.error("AI reading error:", err);
    res.status(500).json({ error: "Failed to generate reading" });
  }
});

// ✅ Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
