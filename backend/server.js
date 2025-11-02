import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { computeLagna } from "./utils/lagna.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("✅ Raju's Oracle backend is running!");
});

app.post("/api/lagna", async (req, res) => {
  try {
    const { date, time, lat, lon, tz } = req.body;
    if (!date || !time || lat === undefined || lon === undefined)
      return res.status(400).json({ error: "Missing parameters" });

    const result = await computeLagna({ date, time, lat, lon, tz: tz || 0 });
    res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Computation failed" });
  }
});

app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "API is alive!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
