// frontend/src/components/LagnaChart.jsx
import React from "react";

/**
 * North-Indian diamond chart, theme-matched to the beige palette.
 * Props:
 *  - houses: [{ number, sign, planets: ["Sun","Moon",...] }]
 *  - ascendant?: string
 */
export default function LagnaChart({ houses = [], ascendant }) {
  if (!Array.isArray(houses) || houses.length !== 12) return null;

  // quick helpers
  const H = (n) => houses.find((h) => h.number === n) || { number: n, sign: "", planets: [] };
  const planetAbbr = {
    Sun: "Su", Moon: "Mo", Mercury: "Me", Venus: "Ve",
    Mars: "Ma", Jupiter: "Ju", Saturn: "Sa",
    Rahu: "Ra", Ketu: "Ke"
  };

  // stroke/fill from CSS vars (beige theme)
  const stroke = getVar("--line", "#d7c9a3");
  const label = getVar("--accent-ink", "#3a2e1f");
  const planetPillFill = "#fff";
  const planetPillStroke = stroke;

  return (
    <div style={{ width: 420, maxWidth: "100%", margin: "0 auto" }} className="card">
      <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
        {/* FRAME */}
        <g stroke={stroke} strokeWidth="1.1" fill="none">
          {/* Outer square */}
          <rect x="5" y="5" width="90" height="90" rx="0.6" />
          {/* Diamond */}
          <line x1="5" y1="50" x2="50" y2="5" />
          <line x1="50" y1="5" x2="95" y2="50" />
          <line x1="95" y1="50" x2="50" y2="95" />
          <line x1="50" y1="95" x2="5" y2="50" />
          {/* Cross */}
          <line x1="5" y1="50" x2="95" y2="50" />
          <line x1="50" y1="5" x2="50" y2="95" />
        </g>

        {/* HOUSE LABELS (fixed N-Indian geometry) */}
        <House x={50} y={18}    data={H(1)}  label={label} pillFill={planetPillFill} pillStroke={planetPillStroke} />
        <House x={70} y={28}    data={H(2)}  label={label} pillFill={planetPillFill} pillStroke={planetPillStroke} />
        <House x={85} y={43}    data={H(3)}  label={label} pillFill={planetPillFill} pillStroke={planetPillStroke} />
        <House x={70} y={72}    data={H(4)}  label={label} pillFill={planetPillFill} pillStroke={planetPillStroke} />
        <House x={50} y={82}    data={H(5)}  label={label} pillFill={planetPillFill} pillStroke={planetPillStroke} />
        <House x={30} y={72}    data={H(6)}  label={label} pillFill={planetPillFill} pillStroke={planetPillStroke} />
        <House x={15} y={43}    data={H(7)}  label={label} pillFill={planetPillFill} pillStroke={planetPillStroke} />
        <House x={30} y={28}    data={H(8)}  label={label} pillFill={planetPillFill} pillStroke={planetPillStroke} />
        <House x={50} y={8}     data={H(9)}  label={label} pillFill={planetPillFill} pillStroke={planetPillStroke} small />
        <House x={82} y={18}    data={H(10)} label={label} pillFill={planetPillFill} pillStroke={planetPillStroke} small />
        <House x={86} y={78}    data={H(11)} label={label} pillFill={planetPillFill} pillStroke={planetPillStroke} small />
        <House x={18} y={82}    data={H(12)} label={label} pillFill={planetPillFill} pillStroke={planetPillStroke} small />

        {/* Ascendant caption (optional) */}
        {ascendant && (
          <text x="50" y="98" textAnchor="middle" fontSize="3.2" fill={label}>
            Ascendant: {ascendant}
          </text>
        )}
      </svg>
    </div>
  );

  // read CSS variable with fallback
  function getVar(name, fallback) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }

  function House({ x, y, data, label, pillFill, pillStroke, small = false }) {
    // Typography tuned for readability
    const fsHouse = small ? 3.2 : 3.8;
    const fsSign  = small ? 3.0 : 3.4;
    const fsPlan  = small ? 2.6 : 2.8; // used inside pill text

    const planetRow = layoutPills(data.planets?.map(p => planetAbbr[p] || p) || [], small);

    return (
      <g transform={`translate(${x},${y})`}>
        {/* House number */}
        <text x="0" y="0" textAnchor="middle" fontSize={fsHouse} fontWeight="700" fill={label}>
          H{data.number}
        </text>
        {/* Sign */}
        {data.sign && (
          <text x="0" y="5.5" textAnchor="middle" fontSize={fsSign} fill={label}>
            {data.sign}
          </text>
        )}
        {/* Planets as pills */}
        {planetRow.length > 0 && (
          <g transform="translate(0, 10)">
            {planetRow.map((pill, i) => (
              <g key={i} transform={`translate(${pill.x},0)`}>
                <rect
                  x={-pill.w/2} y={-3.8}
                  width={pill.w} height={7.6}
                  rx={3.8} ry={3.8}
                  fill={pillFill}
                  stroke={pillStroke}
                  strokeWidth="0.4"
                />
                <text
                  x="0" y="2"
                  textAnchor="middle"
                  fontSize={fsPlan}
                  fill={label}
                >
                  {pill.text}
                </text>
              </g>
            ))}
          </g>
        )}
      </g>
    );
  }

  /**
   * Compute pill widths & x positions so the row is centered.
   * We assume average char width ~1.6 units at the chosen font size.
   */
  function layoutPills(items, compact) {
    if (!items.length) return [];
    const pad = 4;               // rect inner padding (units)
    const gap = 2.5;             // space between pills
    const charW = 1.6;           // avg char width
    const rectH = compact ? 7.0 : 7.6;

    const pills = items.map(text => {
      const w = Math.max(12, text.length * charW + pad * 2);
      return { text, w };
    });
    const totalW = pills.reduce((s,p) => s + p.w, 0) + gap * (pills.length - 1);
    let x = -totalW / 2;
    return pills.map(p => {
      const cx = x + p.w/2;
      x += p.w + gap;
      return { ...p, x: cx, h: rectH };
    });
  }
}
