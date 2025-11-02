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
      setReading("Something went wrong while fetching your chart.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black text-white flex flex-col items-center py-10 px-4">
      <h1 className="text-5xl font-bold text-purple-300 mb-8 tracking-wide">
        🔮 Raju’s Oracle
      </h1>

      <p className="text-gray-300 mb-6 text-center max-w-xl">
        Enter your birth details to reveal your Lagna chart and a personalized
        astrological reading.
      </p>

      <form onSubmit={handleSubmit} className="card max-w-lg w-full">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />

          {/* 🌆 City Dropdown (Venezuela) */}
          <select
            value={lat && lon ? `${lat},${lon}` : ""}
            onChange={(e) => {
              const [newLat, newLon] = e.target.value.split(",");
              setLat(newLat);
              setLon(newLon);
            }}
            className="col-span-2 p-2 rounded-md text-black"
          >
            <option value="">Select City</option>
            <option value="10.49,-66.88">Caracas</option>
            <option value="11.24,-72.63">Maracaibo</option>
            <option value="10.18,-64.68">Barcelona</option>
            <option value="8.93,-67.43">San Fernando de Apure</option>
            <option value="9.32,-66.59">Calabozo</option>
          </select>

          <input
            type="number"
            step="0.01"
            placeholder="Latitude"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Longitude"
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            required
          />

          <input
            type="number"
            step="0.1"
            placeholder="Time Zone (e.g. -4)"
            value={tz}
            onChange={(e) => setTz(e.target.value)}
            className="col-span-2"
            required
          />
        </div>

        {/* 📍 Use My Location Button */}
        <button
          type="button"
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  setLat(pos.coords.latitude.toFixed(2));
                  setLon(pos.coords.longitude.toFixed(2));
                },
                () => alert("Unable to fetch location. Please allow access.")
              );
            } else {
              alert("Geolocation not supported by your browser.");
            }
          }}
          className="mt-4 w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-sm text-gray-300 transition-all"
        >
          📍 Use My Current Location
        </button>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full py-2 bg-purple-700 hover:bg-purple-800 rounded-md font-semibold transition-all"
        >
          {loading ? "Calculating..." : "Reveal My Oracle"}
        </button>
      </form>

      {/* --- RESULT SECTION --- */}
      {lagna && (
        <div className="mt-10 w-full max-w-4xl text-center">
          <h2 className="text-3xl font-semibold text-purple-300 mb-6">
            🪔 Lagna Chart
          </h2>

          {/* Diamond Vedic Chart */}
          <LagnaChart houses={lagna.houses} />

          {/* Reading Section */}
          <div className="mt-10 card text-left max-w-2xl mx-auto">
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
