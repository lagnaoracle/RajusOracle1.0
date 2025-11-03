// frontend/src/main.jsx
import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import axios from "axios";
import "./index.css";
import LagnaChart from "./components/LagnaChart";

const API_BASE =
  (import.meta.env.VITE_API_BASE?.replace(/\/$/, "")) ||
  "https://rajusoracle1-0.onrender.com";
const OPENCAGE_KEY = import.meta.env.VITE_OPENCAGE_KEY || "";

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

  // --- City autocomplete ---
  const handleCitySearch = async (query) => {
    setCityQuery(query);
    if (!OPENCAGE_KEY || query.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
        query
      )}&key=${OPENCAGE_KEY}&limit=5`;
      const { data } = await axios.get(url);
      const results =
        data?.results?.map((r) => {
          const offsetSec = r.annotations?.timezone?.offset_sec ?? 0;
          const tzHours = +(offsetSec / 3600).toFixed(2);
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

  const handleSelectCity = (city) => {
    setCityQuery(city.name);
    setLat(city.lat);
    setLon(city.lon);
    setTz(city.tz);
    setSuggestions([]);
  };

  // --- Form submit ---
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
    if (!Number.isFinite(latNum) || !Number.isFinite(lonNum) || !Number.isFinite(tzNum)) {
      setFormError("Latitude, Longitude, and Time Zone must be valid numbers.");
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.post("/api/reading", {
        date,
        time,
        lat: latNum,
        lon: lonNum,
        tz: tzNum,
      });
      setLagna(data?.lagnaData || null);
      setReading(data?.reading || "");
    } catch (err) {
      console.error("Reading fetch failed:", err);
      setFormError("Something went wrong while fetching your chart.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f4eee0] via-[#e6dcc0] to-[#f4eee0] text-[#2c2c2c] flex flex-col items-center py-10 px-4 font-sans">
      <h1 className="text-5xl font-serif font-semibold text-[#3a2e1f] mb-4 tracking-wide">
        Raju’s Oracle
      </h1>
      <p className="text-[#4a3b27] mb-8 text-center max-w-xl text-lg leading-relaxed">
        Enter your birth details to reveal your Lagna chart and a personalized astrological reading.
      </p>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#faf5e6]/90 border border-[#d7c9a3] backdrop-blur-sm p-6 rounded-xl shadow-lg max-w-lg w-full"
      >
        <div className="grid grid-cols-2 gap-4">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="p-2 rounded-md border border-[#bca98b] bg-white/70 text-[#2c2c2c]"
            required
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="p-2 rounded-md border border-[#bca98b] bg-white/70 text-[#2c2c2c]"
            required
          />

          <div className="col-span-2 relative">
            <input
              type="text"
              placeholder="Enter City"
              value={cityQuery}
              onChange={(e) => handleCitySearch(e.target.value)}
              className="p-2 w-full rounded-md border border-[#bca98b] bg-white/70 text-[#2c2c2c]"
            />
            {suggestions.length > 0 && (
              <ul className="absolute z-10 bg-white text-[#2c2c2c] rounded-md shadow-md mt-1 w-full max-h-48 overflow-y-auto border border-[#bca98b]">
                {suggestions.map((city, i) => (
                  <li
                    key={`${city.name}-${i}`}
                    onClick={() => handleSelectCity(city)}
                    className="px-2 py-1 hover:bg-[#f0e5c8] cursor-pointer text-sm"
                  >
                    {city.name} (UTC{city.tz >= 0 ? "+" : ""}{city.tz})
                  </li>
                ))}
              </ul>
            )}
          </div>

          <input
            type="number"
            step="0.01"
            placeholder="Latitude"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            className="p-2 rounded-md border border-[#bca98b] bg-white/70 text-[#2c2c2c]"
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Longitude"
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            className="p-2 rounded-md border border-[#bca98b] bg-white/70 text-[#2c2c2c]"
            required
          />

          <input
            type="number"
            step="0.25"
            placeholder="Time Zone"
            value={tz}
            onChange={(e) => setTz(e.target.value)}
            className="col-span-2 p-2 rounded-md border border-[#bca98b] bg-white/70 text-[#2c2c2c]"
            required
          />
        </div>

        {formError && <p className="text-[#9b2915] text-sm mt-3">{formError}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full py-2 bg-[#c1a573] hover:bg-[#b49761] text-white rounded-md font-semibold transition-all disabled:opacity-60"
        >
          {loading ? "Calculating..." : "Reveal My Chart"}
        </button>
      </form>

      {/* Results */}
      {lagna && (
        <div className="mt-10 w-full max-w-4xl text-center">
          <h2 className="text-3xl font-serif font-semibold text-[#3a2e1f] mb-6">
            Lagna Chart
          </h2>

          {Array.isArray(lagna.houses) && lagna.houses.length > 0 ? (
            <LagnaChart houses={lagna.houses} ascendant={lagna.ascendant} planets={lagna.planets} />
          ) : (
            <p className="text-[#4a3b27]">No house data returned.</p>
          )}

          <div className="mt-10 bg-[#faf5e6]/90 border border-[#d7c9a3] p-6 rounded-xl shadow-lg text-left max-w-2xl mx-auto">
            <h3 className="text-2xl font-serif font-semibold mb-4 text-center text-[#3a2e1f]">
              Oracle Reading
            </h3>
            <p className="whitespace-pre-line leading-relaxed text-[#3c3325]">
              {reading || "No reading yet."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
