// frontend/src/main.jsx
import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import axios from "axios";
import "./index.css";
import LagnaChart from "./components/LagnaChart";

// --- Config ---
const API_BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, "") ||
  "https://rajusoracle1-0.onrender.com";
const VITE_OPENCAGE_KEY = import.meta.env.VITE_OPENCAGE_KEY || "";

// Axios
const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

function App() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [tz, setTz] = useState("");
  const [reading, setReading] = useState("");
  const [lagna, setLagna] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // City autocomplete (OpenCage)
  const handleCitySearch = async (q) => {
    setCityQuery(q);
    if (!VITE_OPENCAGE_KEY || q.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          q
        )}&key=${VITE_OPENCAGE_KEY}&limit=6`
      );
      const list =
        res.data?.results?.map((r) => {
          const offsetSec = r?.annotations?.timezone?.offset_sec ?? 0;
          return {
            name: r.formatted,
            lat: Number(r.geometry.lat).toFixed(2),
            lon: Number(r.geometry.lng).toFixed(2),
            tz: offsetSec / 3600, // numeric hours
          };
        }) || [];
      setSuggestions(list);
    } catch (e) {
      console.error("City search failed:", e);
      setSuggestions([]);
    }
  };

  const handleSelectCity = (city) => {
    setCityQuery(city.name);
    setLat(city.lat);
    setLon(city.lon);
    setTz(city.tz);
    setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setLoading(true);
    setReading("");
    setLagna(null);

    if (!date || !time) {
      setFormError("Please provide date and time of birth.");
      setLoading(false);
      return;
    }
    const latNum = Number(lat);
    const lonNum = Number(lon);
    const tzNum = Number(tz);
    if (
      !Number.isFinite(latNum) ||
      !Number.isFinite(lonNum) ||
      !Number.isFinite(tzNum)
    ) {
      setFormError("Latitude, Longitude and Time Zone must be valid numbers.");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/api/reading", {
        date,
        time,
        lat: latNum,
        lon: lonNum,
        tz: tzNum,
      });
      setLagna(res.data?.lagnaData || null);
      setReading(res.data?.reading || "");
    } catch (err) {
      console.error("Reading fetch failed:", err);
      setFormError("Something went wrong while fetching your chart.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 className="title">Raju’s Oracle</h1>
      <p className="subtitle">
        Enter your birth details to reveal your Lagna chart and a personalized reading.
      </p>

      <form onSubmit={handleSubmit} className="card section" style={{ maxWidth: 640 }}>
        <div className="grid grid-2" style={{ position: "relative" }}>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />

          {/* City autocomplete */}
          <div style={{ gridColumn: "1 / -1", position: "relative" }}>
            <input
              type="text"
              placeholder="Enter city (worldwide)"
              value={cityQuery}
              onChange={(e) => handleCitySearch(e.target.value)}
            />
            {suggestions.length > 0 && (
              <ul className="suggest">
                {suggestions.map((c, i) => (
                  <li key={`${c.name}-${i}`} onClick={() => handleSelectCity(c)}>
                    {c.name} &nbsp;
                    <span className="mono" style={{ color: "var(--muted)" }}>
                      (UTC{c.tz >= 0 ? "+" : ""}{c.tz})
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <input
            type="number" step="0.01" placeholder="Latitude"
            value={lat} onChange={(e) => setLat(e.target.value)} required
          />
          <input
            type="number" step="0.01" placeholder="Longitude"
            value={lon} onChange={(e) => setLon(e.target.value)} required
          />
          <input
            type="number" step="0.25" placeholder="Time Zone (auto-filled)"
            value={tz} onChange={(e) => setTz(e.target.value)}
            style={{ gridColumn: "1 / -1" }} required
          />
        </div>

        {formError && <div className="err">{formError}</div>}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Calculating…" : "Reveal My Oracle"}
        </button>
      </form>

      {lagna && (
        <div className="section" style={{ maxWidth: 980 }}>
          <div className="card" style={{ display: "flex", justifyContent: "center" }}>
            <LagnaChart
              houses={lagna.houses}
              ascendant={lagna.ascendant}
              planets={lagna.planets}
            />
          </div>

          <div className="block">
            <h3>Oracle Reading</h3>
            <p style={{ whiteSpace: "pre-line", lineHeight: 1.7 }}>{reading || "—"}</p>
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
