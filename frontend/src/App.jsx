import React, { useState } from "react";

// Helper: draw a super-simple North-Indian style box chart
function Chart({ houses = [] }) {
  const box = {
    width: 320, height: 320, border: "1px solid #ccc",
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gridTemplateRows: "repeat(3, 1fr)",
    gap: 6, padding: 6, background: "white", borderRadius: 12
  };
  const cell = {
    border: "1px solid #e5e7eb",
    borderRadius: 10, padding: 8, fontSize: 12, display: "flex",
    flexDirection: "column", gap: 6, background: "#fafafa"
  };

  const order = [1,2,3,4,5,6,7,8,9,10,11,12]; // simple left-to-right grid
  const byNum = new Map(houses.map(h => [h.number, h]));
  return (
    <div style={box}>
      {order.map(n => {
        const h = byNum.get(n) || { sign: "—", planets: [] };
        return (
          <div key={n} style={cell}>
            <div style={{fontWeight:600}}>House {n}</div>
            <div>{h.sign}</div>
            <div style={{opacity:0.8}}>
              {h.planets?.length ? h.planets.join(", ") : "—"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function App() {
  const [form, setForm] = useState({
    date: "1990-05-21",
    time: "14:35",
    lat: 12.97,
    lon: 77.59,
    tz: 5.5
  });
  const [chart, setChart] = useState(null);
  const [reading, setReading] = useState(null);
  const [loading, setLoading] = useState(false);
  const API_BASE = import.meta.env.VITE_API_BASE;

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setChart(null); setReading(null);

    try {
      const lagnaRes = await fetch(`${API_BASE}/api/lagna`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(form)
      });
      const lagna = await lagnaRes.json();
      setChart(lagna);

      const readRes = await fetch(`${API_BASE}/api/reading`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ chart: lagna })
      });
      const read = await readRes.json();
      setReading(read);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{minHeight:"100vh", background:"#0f172a", color:"white"}}>
      <div style={{maxWidth:960, margin:"0 auto", padding:"32px 20px"}}>
        <h1 style={{fontSize:32, fontWeight:800, marginBottom:16}}>Raju’s Oracle</h1>
        <p style={{opacity:0.9, marginBottom:24}}>
          Enter birth details to see your Lagna chart and AI reading.
        </p>

        <form onSubmit={submit} style={{
          display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",
          gap:12, background:"white", color:"#111827", padding:16, borderRadius:12, marginBottom:20
        }}>
          {[
            ["date","Date","date"],
            ["time","Time","time"],
            ["lat","Latitude","number"],
            ["lon","Longitude","number"],
            ["tz","Timezone (e.g. 5.5)","number"],
          ].map(([key,label,type]) => (
            <label key={key} style={{display:"grid", gap:6}}>
              <span style={{fontSize:12, fontWeight:600, color:"#374151"}}>{label}</span>
              <input
                required
                type={type}
                value={form[key]}
                onChange={e => setForm(f => ({...f, [key]: type==="number" ? Number(e.target.value) : e.target.value}))}
                style={{border:"1px solid #e5e7eb", borderRadius:8, padding:"10px 12px"}}
              />
            </label>
          ))}
          <button disabled={loading} style={{
            gridColumn:"1 / -1", background:"#7c3aed", color:"white",
            border:"none", padding:"12px 14px", borderRadius:10, fontWeight:700, cursor:"pointer"
          }}>
            {loading ? "Computing..." : "Generate Chart & Reading"}
          </button>
        </form>

        {chart && (
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:24}}>
            <div>
              <h2 style={{fontSize:20, fontWeight:700, marginBottom:12}}>Lagna Chart (Ascendant: {chart.ascendant || "—"})</h2>
              <Chart houses={chart.houses} />
            </div>
            <div>
              <h2 style={{fontSize:20, fontWeight:700, marginBottom:12}}>Planets</h2>
              <div style={{background:"white", color:"#111827", borderRadius:12, padding:16}}>
                {chart.planets?.map(p => (
                  <div key={p.name} style={{display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #f3f4f6"}}>
                    <strong>{p.name}</strong>
                    <span>{p.sign} — {p.longitude}°</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {reading && (
          <div style={{marginTop:24}}>
            <h2 style={{fontSize:20, fontWeight:700, marginBottom:12}}>AI Reading</h2>
            <div style={{background:"white", color:"#111827", borderRadius:12, padding:16, lineHeight:1.6}}>
              <pre style={{whiteSpace:"pre-wrap", margin:0}}>{reading.reading || JSON.stringify(reading, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
