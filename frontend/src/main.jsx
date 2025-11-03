import React, { useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import axios from "axios";
import "./index.css";
import LagnaChart from "./components/LagnaChart";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/** ---- Config ---- */
const API_BASE =
  (import.meta.env.VITE_API_BASE?.replace(/\/$/, "")) ||
  "https://rajusoracle1-0.onrender.com";
const VITE_OPENCAGE_KEY = import.meta.env.VITE_OPENCAGE_KEY || "";

/** Axios instance */
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

  // wrapper for exporting chart + reading
  const exportRef = useRef(null);

  /** City autocomplete (OpenCage) */
  const handleCitySearch = async (query) => {
    setCityQuery(query);

    if (!VITE_OPENCAGE_KEY || query.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const { data } = await axios.get(
        "https://api.opencagedata.com/geocode/v1/json",
        { params: { q: query, key: VITE_OPENCAGE_KEY, limit: 6 } }
      );

      const results =
        data?.results?.map((r) => {
          const offsetSec = r.annotations?.timezone?.offset_sec ?? 0;
          const tzHours = Number((offsetSec / 3600).toFixed(2));
          return {
            name: r.formatted,
            lat: Number(r.geometry.lat).toFixed(2),
            lon: Number(r.geometry.lng).toFixed(2),
            tz: tzHours,
          };
        }) || [];

      setSuggestions(results);
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

  /** Submit: ask backend for lagna + reading */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setLoading(true);
    setReading("");
    setLagna(null);

    const latNum = Number(lat);
    const lonNum = Number(lon);
    const tzNum = Number(tz);

    if (!date || !time || !Number.isFinite(latNum) || !Number.isFinite(lonNum) || !Number.isFinite(tzNum)) {
      setFormError("Please complete all fields with valid values.");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/api/reading", {
        date, time, lat: latNum, lon: lonNum, tz: tzNum,
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

  /** Export helpers */
  const exportPNG = async () => {
    if (!exportRef.current) return;
    const canvas = await html2canvas(exportRef.current, { backgroundColor: "#FFFFFF", scale: 2 });
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "raju-oracle-chart.png";
    a.click();
  };

  const exportPDF = async () => {
    if (!exportRef.current) return;
    const canvas = await html2canvas(exportRef.current, { backgroundColor: "#FFFFFF", scale: 2 });
    const imgData = canvas.toDataURL("image/jpeg", 0.92);

    const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
    const pageW = 210, pageH = 297, margin = 10;
    const imgW = pageW - margin * 2;
    const imgH = (canvas.height * imgW) / canvas.width;

    if (imgH <= pageH - margin * 2) {
      pdf.addImage(imgData, "JPEG", margin, margin, imgW, imgH);
    } else {
      // paginate
      let sY = 0;
      const pagePxH = Math.floor(canvas.width * (pageH - margin * 2) / imgW);
      while (sY < canvas.height) {
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = pagePxH;
        const ctx = pageCanvas.getContext("2d");
        ctx.drawImage(canvas, 0, sY, canvas.width, pagePxH, 0, 0, canvas.width, pagePxH);
        const pageImg = pageCanvas.toDataURL("image/jpeg", 0.92);
        if (sY > 0) pdf.addPage();
        pdf.addImage(pageImg, "JPEG", margin, margin, imgW, pageH - margin * 2);
        sY += pagePxH;
      }
    }
    pdf.save("raju-oracle-reading.pdf");
  };

  return (
    <div className="container">
      {/* Header */}
      <header style={{ textAlign: "center" }}>
        <h1 className="title" style={{ marginBottom: 8 }}>Raju’s Oracle</h1>
        <p className="subtitle">
          Enter your birth details to reveal your Lagna chart and a personalized reading.
        </p>
      </header>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="card section"
        style={{ maxWidth: 640, margin: "0 auto" }}
      >
        <div className="grid grid-2">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />

          {/* City autocomplete */}
          <div style={{ position: "relative", gridColumn: "1 / -1" }}>
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
                    {c.name} — UTC{c.tz >= 0 ? "+" : ""}{c.tz}
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
            step="0.25"
            placeholder="Time Zone (auto-filled)"
            value={tz}
            onChange={(e) => setTz(e.target.value)}
            style={{ gridColumn: "1 / -1" }}
            required
          />
        </div>

        {formError && <p className="err">{formError}</p>}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Calculating…" : "Generate reading"}
        </button>
      </form>

      {/* Results */}
      {lagna && (
        <>
          <section
            ref={exportRef}
            className="section"
            style={{ marginTop: 24, textAlign: "center" }}
          >
            <div className="card" style={{ maxWidth: 860, margin: "0 auto" }}>
              <h2
                style={{
                  margin: "0 0 14px",
                  fontSize: 26,
                  fontWeight: 700,
                  color: "var(--accent-ink)",
                  textAlign: "center",
                }}
              >
                Lagna Chart
              </h2>

              {Array.isArray(lagna.houses) && lagna.houses.length > 0 ? (
                <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                  <LagnaChart
                    houses={lagna.houses}
                    ascendant={lagna.ascendant}
                    planets={lagna.planets}
                    mc={lagna.mc}
                    ic={lagna.ic}
                  />

                </div>
              ) : (
                <p className="subtitle">No house data returned.</p>
              )}
            </div>

            <div className="card" style={{ maxWidth: 860, margin: "16px auto 0" }}>
              <h2 style={{ marginTop: 0 }}>Reading</h2>
              <p style={{ whiteSpace: "pre-line", lineHeight: 1.7 }}>{reading || "No reading yet."}</p>
            </div>
          </section>

          {/* Export buttons */}
          <div className="section" style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
            <button className="btn" onClick={() => window.print()} style={{ maxWidth: 220 }}>
              Print
            </button>
            <button className="btn" onClick={exportPNG} style={{ maxWidth: 220 }}>
              Download PNG
            </button>
            <button className="btn btn-primary" onClick={exportPDF} style={{ maxWidth: 220 }}>
              Download PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
