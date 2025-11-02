import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { calculateLagna } from "./utils/lagna.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan("dev"));

// Health check
app.get("/", (req, res) => {
  res.send("🪐 Raju's Oracle backend is running!");
});

// API endpoint
app.post("/api/lagna", (req, res) => {
  try {
    const { date, time, lat, lon, tz } = req.body;
    const result = calculateLagna(date, time, lat, lon, tz);
    res.json(result);
  } catch (error) {
    console.error("Lagna error:", error);
    res.status(500).json({ error: "Failed to calculate Lagna." });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
