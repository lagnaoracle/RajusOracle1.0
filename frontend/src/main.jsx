    // frontend/src/main.jsx
import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import axios from "axios";
import "./index.css";
import LagnaChart from "./components/LagnaChart";

// ---- Config ----
const API_BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, "") ||
  "https://rajusoracle1-0.onrender.com";

const VITE_OPENCAGE_KEY = import.meta.env.VITE_OPENCAGE_KEY || ""; // optional in local dev

// Axios instance
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

  // 🌍 Autocomplete city search (OpenCage API)
  const handleCitySearch = async (query) => {
    setCityQuery(query);
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          query
        )}&key=${VITE_OPENCAGE_KEY}&limit=5`
      );

      const results =
        res.data?.results?.map((r) => {
          const offsetSec = r.annotations?.timezone?.offset_sec ?? 0;
          const tzHours = offsetSec / 3600;
          return {
            name: r.formatted,
            lat: Number(r.geometry.lat).toFixed(2),
            lon: Number(r.geometry.lng).toFixed(2),
            tz: tzHours,
          };
        }) || [];

      setSuggestions(results);
    } catch (err) {
      console.error("City search failed:", err);
      setSuggestions([]);
    }
  };

  // 🧭 When user selects a city
  const handleSelectCity = (city) => {
    setCityQuery(city.name);
    setLat(city.lat);
    setLon(city.lon);
    setTz(city.tz);
    setSuggestions([]);
  };

  // 🔮 Submit form to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setLoading(true);
    setReading("");
    setLagna(null);

    // quick validations
    if (!date || !time) {
      setFormError("Please provide date and time of birth.");
      setLoading(false);
      return;
    }

    const latNum = Number(lat);
    const lonNum = Number(lon);
    const tzNum = Number(tz);
    if (!Number.isFinite(latNum) || !Number.isFinite(lonNum) || !Number.isFinite(tzNum)) {
      setFormError("Latitude, Longitude, and Time Zone must be valid numbers.");
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
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black text-white flex flex-col items-center py-10 px-4">
      <h1 className="text-5xl font-bold text-purple-300 mb-4 tracking-wide">
        🔮 Raju’s Oracle
      </h1>
      <p className="text-gray-300 mb-6 text-center max-w-xl">
        Enter your birth details to reveal your Lagna chart and a personalized reading.
      </p>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-black/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg max-w-lg w-full relative"
      >
        <div className="grid grid-cols-2 gap-4">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="p-2 rounded-md text-black"
            required
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="p-2 rounded-md text-black"
            required
          />

          {/* 🌍 City Autocomplete */}
          <div className="col-span-2 relative">
            <input
              type="text"
              placeholder="Enter City (worldwide)"
              value={cityQuery}
              onChange={(e) => handleCitySearch(e.target.value)}
              className="p-2 w-full rounded-md text-black"
            />
            {suggestions.length > 0 && (
              <ul className="absolute z-10 bg-white text-black rounded-md shadow-lg mt-1 w-full max-h-48 overflow-y-auto">
                {suggestions.map((city, i) => (
                  <li
                    key={`${city.name}-${i}`}
                    onClick={() => handleSelectCity(city)}
                    className="px-2 py-1 hover:bg-purple-100 cursor-pointer text-sm"
                  >
                    {city.name} (UTC{city.tz >= 0 ? "+" : ""}{city.tz})
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Lat & Lon */}
          <input
            type="number"
            step="0.01"
            placeholder="Latitude"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            className="p-2 rounded-md text-black"
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Longitude"
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            className="p-2 rounded-md text-black"
            required
          />

          {/* Time Zone */}
          <input
            type="number"
            step="0.25"
            placeholder="Time Zone (auto-filled)"
            value={tz}
            onChange={(e) => setTz(e.target.value)}
            className="col-span-2 p-2 rounded-md text-black"
            required
          />
        </div>

        {formError && <p className="text-red-400 text-sm mt-3">{formError}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full py-2 bg-purple-700 hover:bg-purple-800 rounded-md font-semibold transition-all disabled:opacity-60"
        >
          {loading ? "Calculating..." : "Reveal My Oracle"}
        </button>
      </form>

      {/* RESULTS */}
      {lagna && (
        <div className="mt-10 w-full max-w-4xl text-center">
          <h2 className="text-3xl font-semibold text-purple-300 mb-6">🪔 Lagna Chart</h2>

          {Array.isArray(lagna.houses) && lagna.houses.length > 0 ? (
            <LagnaChart houses={lagna.houses} />
          ) : (
            <p className="text-gray-300">No house data returned.</p>
          )}

          <div className="mt-10 bg-black/40 p-6 rounded-xl shadow-lg text-left max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold mb-4 text-purple-300 text-center">
              ✨ Oracle Reading
            </h3>
            <p className="whitespace-pre-line leading-relaxed text-gray-200">
              {reading || "No reading yet."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);        
