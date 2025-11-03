import React, { useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import axios from "axios";
import "./index.css";
import LagnaChart from "./components/LagnaChart";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// ---- Config ----
const API_BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, "") ||
  "https://rajusoracle1-0.onrender.com";
const VITE_OPENCAGE_KEY = import.meta.env.VITE_OPENCAGE_KEY || "";

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

  // for exporting the combined chart+reading area
  const exportRef = useRef(null);

  // ---- City autocomplete ----
  const handleCitySearch = async (query) => {
    setCityQuery(query);
    if (!VITE_OPENCAGE_KEY || query.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const { data } = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          query
        )}&key=${VITE_OPENCAGE_KEY}&limit=6`
      );
      const results =
        data?.results?.map((r) => {
          const offsetSec = r.annotations?.timezone?.offset_sec ?? 0;
          const tzHours = offsetSec / 3600;
          return {
            name: r.formatted,
            lat: Number(r.geometry.lat).toFixed(2),
            lon: Number(r.geometry.lng).toFixed(2),
            tz: Number(tzHours.toFixed(2)),
          };
        }) || [];
      setSuggestions(results);
    } catch (e) {
      console.error("City search failed", e);
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

  // ---- Submit ----
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

  // ---- Export helpers ----
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
    // A4 portrait
    const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
    const pageW = 210;
    const pageH = 297;
    const imgW = pageW - 20; // 10mm margin each side
    const imgH = (canvas.height * imgW) / canvas.width;
    let y = 10;

    if (imgH < pageH - 20) {
      pdf.addImage(imgData, "JPEG", 10, y, imgW, imgH);
    } else {
      // paginate if needed
      let sY = 0;
      const pagePxH = Math.floor(canvas.width * (pageH - 20) / imgW);
      while (sY < canvas.height) {
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = pagePxH;
        const ctx = pageCanvas.getContext("2d");
        ctx.drawImage(canvas, 0, sY, canvas.width, pagePxH, 0, 0, canvas.width, pagePxH);
        const pageImg = pageCanvas.toDataURL("image/jpeg", 0.92);
        if (sY > 0) pdf.addPage();
        pdf.addImage(pageImg, "JPEG", 10, 10, imgW, pageH - 20);
        sY += pagePxH;
      }
    }

    pdf.save("raju-oracle-reading.pdf");
  };

  return (
    <div className="container">
      <header className="header fade-in">
        <h1>Raju’s Oracle</h1>
        <p className="subtle">
          Enter your birth details to reveal your Lagna chart and a personalized reading.
        </p>
      </header>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="card fade-in no-print" style={{maxWidth: 640, margin: "0 auto"}}>
        <div className="grid">
          <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} required />
          <input type="time" value={time} onChange={(e)=>setTime(e.target.value)} required />

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
                  <li key={`${c.name}-${i}`} onClick={()=>handleSelectCity(c)}>
                    {c.name} &nbsp; — &nbsp; UTC{c.tz >= 0 ? "+" : ""}{c.tz}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <input type="number" step="0.01" placeholder="Latitude" value={lat} onChange={(e)=>setLat(e.target.value)} required />
          <input type="number" step="0.01" placeholder="Longitude" value={lon} onChange={(e)=>setLon(e.target.value)} required />

          <input type="number" step="0.25" placeholder="Time Zone (auto-filled)" value={tz} onChange={(e)=>setTz(e.target.value)} style={{gridColumn: "1 / -1"}} required />
        </div>

        {formError && <p style={{color:"#b00020", marginTop:8}}>{formError}</p>}

        <div className="actions" style={{marginTop:16}}>
          <button type="submit" className="primary" disabled={loading}>
            {loading ? "Calculating…" : "Generate reading"}
          </button>
        </div>
      </form>

      {/* RESULTS */}
      {lagna && (
        <section ref={exportRef} className="fade-in-slow" style={{marginTop: 32}}>
          <div className="card" style={{maxWidth: 860, margin: "0 auto"}}>
            <h2 style={{marginTop:0, marginBottom: 18}}>Lagna Chart</h2>
            {Array.isArray(lagna.houses) && lagna.houses.length > 0 ? (
              <LagnaChart
                houses={lagna.houses}
                ascendant={lagna.ascendant}
                planets={lagna.planets}
              />
            ) : (
              <p className="subtle">No house data returned.</p>
            )}
          </div>

            <div className="card" style={{maxWidth: 860, margin: "18px auto 0"}}>
              <h2 style={{marginTop:0}}>Reading</h2>
              <p style={{whiteSpace:"pre-line", lineHeight:1.7, color:"#333"}}>{reading || "No reading yet."}</p>
            </div>
        </section>
      )}

      {/* Export / Print actions */}
      {lagna && (
        <div className="actions no-print fade-in" style={{marginTop: 16, justifyContent:"center"}}>
          <button className="ghost" onClick={()=>window.print()}>Print</button>
          <button className="ghost" onClick={exportPNG}>Download PNG</button>
          <button className="primary" onClick={exportPDF}>Download PDF</button>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
