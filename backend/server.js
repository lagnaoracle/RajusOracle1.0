import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";
import dotenv from "dotenv";
import { calculateLagna } from "./utils/lagna.js"; // <-- uses swisseph-latest

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan("dev"));

// Root route
app.get("/", (req, res) => {
  res.send("🔥 Raju's Oracle Backend is running!");
});

// Lagna calculation endpoint
app.post("/api/lagna", async (req, res) => {
  try {
    const { date, time, lat, lon, tz } = req.body;

    if (!date || !time || lat === undefined || lon === undefined || tz === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const lagnaResult = await calculateLagna(date, time, lat, lon, tz);
    res.json({ success: true, data: lagnaResult });
  } catch (error) {
    console.error("Error in /api/lagna:", error);
    res.status(500).json({ error: "Failed to calcu
