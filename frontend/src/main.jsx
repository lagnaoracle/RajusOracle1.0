import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import axios from "axios";
import "./index.css";
import LagnaChart from "./components/LagnaChart";

function App() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [tz, setTz] = useState("");
  const [reading, setReading] = useState("");
  const [lagna, setLagna] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🧠 Submit birth details to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setReading("");
    setLagna(null);

    try {
      const res = await axios.post(
        "https://rajusoracle1-0.onrender.com/api/reading",
        { date, time, lat, lon, tz }
      );
      setLagna(res.data.lagnaData);
      setReading(res.data.reading);
    } catch (err) {
      console.error(err);
      setReading("⚠️ Something went wrong while fetching your chart.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black text-white flex flex-col items-center py-10 px-4">
      {/* Header */}
      <h1 className="text-5xl font-bold text-purple-300 mb-4 tracking-wide">
        🔮 Raju’s Oracle
      </h1>
      <p className="text-gray-300 mb-6 text-center max-w-xl">
        Enter your birth details to reveal your Lagna chart and a personalized astrological reading.
      </p>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-black/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg max-w-lg w-full"
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

          {/* 🌆 Venezuela City Dropdown */}
          <select
            value={lat && lon ? `${lat},${lon}` : ""}
            onChange={(e) => {
              const [newLat, newLon] = e.target.value.split(",");
              setLat(newLat);
              setLon(newLon);
            }}
            className="col-span-2 p-2 rounded-md text-black"
          >
            <option value="">Select City (Venezuela)</option>
            <option value="10.49,-66.88">Caracas</option>
            <option value="11.24,-72.63">Maracaibo</option>
            <option value="10.18,-64.68">Barcelona</option>
            <option value="8.93,-67.43">San Fernando de Apure</option>
            <option value="9.32,-66.59">Calabozo</option>
            <option value="10.48,-68.00">Valencia</option>
            <option value="10.23,-67.60">Maracay</option>
            <option value="10.15,-66.88">La Guaira</option>
            <option value="8.29,-62.72">Ciudad Guayana</option>
            <option value="10.35,-66.98">Los Teques</option>
          </select>

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
            step="0.1"
            placeholder="Time Zone (e.g. -4)"
            value={tz}
            onChange={(e) => setTz(e.target.value)}
            className="col-span-2 p-2 rounded-md text-black"
            required
          />
        </div>

        {/* 🔮 Submit */}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full py-2 bg-purple-700 hover:bg-purple-800 rounded-md font-semibold transition-all"
        >
          {loading ? "Calculating..." : "Reveal My Oracle"}
        </button>
      </form>

      {/* --- Result Section --- */}
      {lagna && (
        <div className="mt-10 w-full max-w-4xl text-center">
          <h2 className="text-3xl font-semibold text-purple-300 mb-6">
            🪔 Lagna Chart
          </h2>

          {/* Diamond Chart */}
          <LagnaChart houses={lagna.houses} />

          {/* Reading */}
          <div className="mt-10 bg-black/40 p-6 rounded-xl shadow-lg text-left max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold mb-4 text-purple-300 text-center">
              ✨ Oracle Reading
            </h3>
            <p className="whitespace-pre-line leading-relaxed text-gray-200">
              {reading}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
