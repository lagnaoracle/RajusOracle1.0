// frontend/src/components/LagnaChart.jsx
import React from "react";

/**
 * North Indian (diamond) chart in beige theme.
 * Props:
 *  - houses: [{ number, sign, planets:[], markers?:["MC","IC"] }]
 *  - ascendant?: string
 *  - planets?: [{ name, longitude?, sign? }]
 *  - mc?: { longitude, sign }
 *  - ic?: { longitude, sign }
 */
export default function LagnaChart({ houses = [], ascendant, planets = [], mc, ic }) {
  if (!Array.isArray(houses) || houses.length === 0) return null;

  const color = {
    paper: "#faf5e6",
    border: "#d7c9a3",
    gold:   "#b49761",
    deep:   "#3a2e1f",
    text:   "#3c3325",
    muted:  "#6b5b45",
    tagBg:  "#f0e5c8",
  };

  // Helper
  const H = (n) => houses.find(h => h.number === n) || { number: n, sign: "", planets: [], markers: [] };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Title badge */}
      <div
        className="mb-3 px-3 py-1 rounded-full text-sm"
        style={{ background: color.tagBg, color: color.deep, border: `1px solid ${color.border}` }}
      >
        {ascendant ? `Ascendant: ${ascendant}` : "Lagna"}
        {mc?.sign ? ` · MC: ${mc.sign}` : ""}
        {ic?.sign ? ` · IC: ${ic.sign}` : ""}
      </div>

      {/* Chart */}
      <div className="p-3 rounded-xl shadow"
           style={{ background: color.paper, border: `1px solid ${color.border}` }}>
        <ChartSVG color={color} H={H} />
      </div>
    </div>
  );
}

/** ---------------- SVG Chart ---------------- */
function ChartSVG({ color, H }) {
  const stroke = color.gold;

  return (
    <svg viewBox="0 0 100 100" className="block" style={{ width: "min(78vw, 420px)", height: "auto" }}>
      {/* frame */}
      <rect x="3" y="3" width="94" height="94" fill="none" stroke={stroke} strokeWidth="1.6" />

      {/* diamond */}
      <line x1="3" y1="50" x2="50" y2="3"  stroke={stroke} strokeWidth="1.2" />
      <line x1="50" y1="3" x2="97" y2="50" stroke={stroke} strokeWidth="1.2" />
      <line x1="97" y1="50" x2="50" y2="97" stroke={stroke} strokeWidth="1.2" />
      <line x1="50" y1="97" x2="3"  y2="50" stroke={stroke} strokeWidth="1.2" />

      {/* cross */}
      <line x1="3" y1="50" x2="97" y2="50" stroke={stroke} strokeWidth="0.9" />
      <line x1="50" y1="3"  x2="50" y2="97" stroke={stroke} strokeWidth="0.9" />

      {/* House labels */}
      <HouseLabel color={color} house={H(1)}  x={50} y={20} />
      <HouseLabel color={color} house={H(2)}  x={71} y={29} />
      <HouseLabel color={color} house={H(3)}  x={86} y={44} />
      <HouseLabel color={color} house={H(4)}  x={71} y={71} />
      <HouseLabel color={color} house={H(5)}  x={50} y={80} />
      <HouseLabel color={color} house={H(6)}  x={29} y={71} />
      <HouseLabel color={color} house={H(7)}  x={14} y={44} />
      <HouseLabel color={color} house={H(8)}  x={29} y={29} />
      <HouseLabel color={color} house={H(9)}  x={50} y={8}  small />
      <HouseLabel color={color} house={H(10)} x={85} y={18} small />
      <HouseLabel color={color} house={H(11)} x={85} y={82} small />
      <HouseLabel color={color} house={H(12)} x={15} y={82} small />
    </svg>
  );
}

function HouseLabel({ color, house, x, y, small = false }) {
  const { number, sign, planets = [], markers = [] } = house || {};
  const fontHouse = small ? 3 : 3.6;
  const fontSign  = small ? 3 : 3.2;
  const fontPlan  = small ? 2.7 : 2.9;

  const planetsStr = (planets || []).join(", ");
  const lines = wrapText(planetsStr, small ? 14 : 18).slice(0, small ? 2 : 3);

  // tiny tags (MC/IC) line
  const tagLine = markers.join(" · ");

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* House number */}
      <text x="0" y="0" textAnchor="middle"
            fontSize={fontHouse} fontWeight="600"
            style={{ fill: color.deep }}>
        H{number ?? "—"}
      </text>

      {/* Sign */}
      {sign ? (
        <text x="0" y={fontHouse + 3} textAnchor="middle"
              fontSize={fontSign} fontWeight="500"
              style={{ fill: color.deep }}>
          {sign}
        </text>
      ) : null}

      {/* MC / IC tag */}
      {tagLine && (
        <text x="0" y={fontHouse + 3 + (fontPlan + 1.6)}
              textAnchor="middle" fontSize={fontPlan}
              style={{ fill: color.gold, fontWeight: 600 }}>
          {tagLine}
        </text>
      )}

      {/* Planets (wrapped) */}
      {lines.length > 0 && (
        <g style={{ fill: color.muted }}>
          {lines.map((line, i) => (
            <text key={i}
                  x="0"
                  y={fontHouse + 3 + (tagLine ? 1 : 0) * (fontPlan + 1.6) + (i + 1) * (fontPlan + 1.6)}
                  textAnchor="middle"
                  fontSize={fontPlan}>
              {line}
            </text>
          ))}
        </g>
      )}
    </g>
  );
}

/** naive wrap */
function wrapText(text, max = 18) {
  if (!text) return [];
  const words = text.split(/\s*,\s*|\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const w of words) {
    const trial = line ? `${line} ${w}` : w;
    if (trial.length <= max) line = trial;
    else { if (line) lines.push(line); line = w; }
  }
  if (line) lines.push(line);
  return lines;
}
