import React from "react";

/**
 * North Indian (diamond) Lagna chart in a refined beige theme.
 * Props:
 *  - houses: [{ number, sign, planets: [ "Sun", "Moon", ... ] }]
 *  - ascendant?: "Aries" | ... (optional, shown in title badge)
 *  - planets?: [{ name, longitude?, sign? }] (optional, used only for legend sorting)
 */
export default function LagnaChart({ houses = [], ascendant, planets = [] }) {
  if (!Array.isArray(houses) || houses.length === 0) return null;

  // Theme palette (kept here so it’s self-contained)
  const color = {
    paper: "#faf5e6",
    border: "#d7c9a3",
    gold: "#b49761",
    deep: "#3a2e1f",
    text: "#3c3325",
    muted: "#6b5b45",
  };

  // Helper: get a house by number safely
  const H = (n) => houses.find((h) => h.number === n) || { number: n, sign: "", planets: [] };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Title / Ascendant badge */}
      <div
        className="mb-3 px-3 py-1 rounded-full text-sm"
        style={{
          background: "#f0e5c8",
          color: color.deep,
          border: `1px solid ${color.border}`,
          textAlign: "center",
        }}
      >
        {ascendant ? `Ascendant: ${ascendant}` : "Lagna"}
      </div>

      {/* Chart wrapper with subtle frame */}
      <div
        className="p-3 rounded-xl shadow"
        style={{ background: color.paper, border: `1px solid ${color.border}` }}
      >
        <ChartSVG color={color} H={H} />
      </div>

      {/* Legend (planet symbols) */}
      <Legend color={color} planets={planets} />
    </div>
  );
}

/** ---------------- SVG Chart ---------------- */
function ChartSVG({ color, H }) {
  // The chart is drawn in a 100x100 viewBox and scales responsively.
  const stroke = color.gold;
  const textPrimary = color.deep;
  const textMuted = color.muted;

  return (
    <svg
      viewBox="0 0 100 100"
      className="block"
      style={{ width: "min(78vw, 420px)", height: "auto" }}
    >
      {/* Frame */}
      <rect x="3" y="3" width="94" height="94" fill="none" stroke={stroke} strokeWidth="1.6" />

      {/* Diamond (outer) */}
      <line x1="3" y1="50" x2="50" y2="3" stroke={stroke} strokeWidth="1.2" />
      <line x1="50" y1="3" x2="97" y2="50" stroke={stroke} strokeWidth="1.2" />
      <line x1="97" y1="50" x2="50" y2="97" stroke={stroke} strokeWidth="1.2" />
      <line x1="50" y1="97" x2="3" y2="50" stroke={stroke} strokeWidth="1.2" />

      {/* Cross */}
      <line x1="3" y1="50" x2="97" y2="50" stroke={stroke} strokeWidth="0.9" />
      <line x1="50" y1="3" x2="50" y2="97" stroke={stroke} strokeWidth="0.9" />

      {/* House labels (fixed positions for North Indian layout) */}
      <HouseLabel color={{ textPrimary, textMuted }} house={H(1)}  x={50} y={20} />
      <HouseLabel color={{ textPrimary, textMuted }} house={H(2)}  x={71} y={29} />
      <HouseLabel color={{ textPrimary, textMuted }} house={H(3)}  x={86} y={44} />
      <HouseLabel color={{ textPrimary, textMuted }} house={H(4)}  x={71} y={71} />
      <HouseLabel color={{ textPrimary, textMuted }} house={H(5)}  x={50} y={80} />
      <HouseLabel color={{ textPrimary, textMuted }} house={H(6)}  x={29} y={71} />
      <HouseLabel color={{ textPrimary, textMuted }} house={H(7)}  x={14} y={44} />
      <HouseLabel color={{ textPrimary, textMuted }} house={H(8)}  x={29} y={29} />
      <HouseLabel color={{ textPrimary, textMuted }} house={H(9)}  x={50} y={8}  small />
      <HouseLabel color={{ textPrimary, textMuted }} house={H(10)} x={85} y={18} small />
      <HouseLabel color={{ textPrimary, textMuted }} house={H(11)} x={85} y={82} small />
      <HouseLabel color={{ textPrimary, textMuted }} house={H(12)} x={15} y={82} small />
    </svg>
  );
}

/** A single house label block with clean typography and word wrapping. */
function HouseLabel({ color, house, x, y, small = false }) {
  const { number, sign, planets = [] } = house || {};
  const fontHouse = small ? 3 : 3.6;
  const fontSign = small ? 3 : 3.2;
  const fontPlan = small ? 2.7 : 2.9;

  // Build planet string and wrap
  const planetsStr = (planets || []).join(", ");
  const lines = wrapText(planetsStr, small ? 14 : 18).slice(0, small ? 2 : 3);

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* House number */}
      <text
        x="0"
        y="0"
        textAnchor="middle"
        fontSize={fontHouse}
        fontWeight="600"
        style={{ fill: color.textPrimary }}
      >
        H{number ?? "—"}
      </text>

      {/* Sign */}
      {sign ? (
        <text
          x="0"
          y={fontHouse + 3}
          textAnchor="middle"
          fontSize={fontSign}
          fontWeight="500"
          style={{ fill: color.textPrimary }}
        >
          {sign}
        </text>
      ) : null}

      {/* Planets (wrapped) */}
      {lines.length > 0 && (
        <g style={{ fill: color.textMuted }}>
          {lines.map((line, i) => (
            <text
              key={i}
              x="0"
              y={fontHouse + 3 + (i + 1) * (fontPlan + 1.6)}
              textAnchor="middle"
              fontSize={fontPlan}
            >
              {line}
            </text>
          ))}
        </g>
      )}
    </g>
  );
}

/** Legend: planet symbols (optional, minimal) */
function Legend({ color, planets }) {
  const SYM = {
    Sun: "☉",
    Moon: "☾",
    Mercury: "☿",
    Venus: "♀",
    Mars: "♂",
    Jupiter: "♃",
    Saturn: "♄",
    Rahu: "☊",
    Ketu: "☋",
  };

  const names = (planets || []).map((p) => p.name).filter(Boolean);
  const unique = [...new Set(names)];
  if (unique.length === 0) return null;

  return (
    <div className="mt-4 text-sm leading-6 text-center" style={{ color: color.muted }}>
      <span className="font-medium" style={{ color: color.deep }}>
        Planet Symbols:
      </span>{" "}
      {unique.map((name, i) => (
        <span key={name}>
          {i > 0 ? " · " : ""}
          {SYM[name] || "•"} {name}
        </span>
      ))}
    </div>
  );
}

/** Utility: naive text wrap to fixed width (characters) for SVG <text> */
function wrapText(text, max = 18) {
  if (!text) return [];
  const words = text.split(/\s*,\s*|\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const w of words) {
    const trial = line ? `${line} ${w}` : w;
    if (trial.length <= max) line = trial;
    else {
      if (line) lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines;
}
