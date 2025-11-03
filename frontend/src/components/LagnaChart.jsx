// frontend/src/components/LagnaChart.jsx
import React from "react";

// Abbreviations to keep labels compact
const SIGN_SHORT = {
  Aries: "Ar", Taurus: "Ta", Gemini: "Ge", Cancer: "Cn",
  Leo: "Le", Virgo: "Vi", Libra: "Li", Scorpio: "Sc",
  Sagittarius: "Sg", Capricorn: "Cp", Aquarius: "Aq", Pisces: "Pi",
};
const PLANET_SHORT = {
  Sun: "Su", Moon: "Mo", Mercury: "Me", Venus: "Ve",
  Mars: "Ma", Jupiter: "Ju", Saturn: "Sa", Rahu: "Ra", Ketu: "Ke",
};

// Fixed positions (North Indian diamond) – tuned for readability
const POS = {
  1:  { x: 200, y: 70 },
  2:  { x: 250, y: 90 },
  3:  { x: 320, y: 160 },
  4:  { x: 250, y: 230 },
  5:  { x: 200, y: 250 },
  6:  { x: 150, y: 230 },
  7:  { x: 80,  y: 160 },
  8:  { x: 150, y: 90  },
  9:  { x: 200, y: 28  },
  10: { x: 300, y: 60  },
  11: { x: 330, y: 270 },
  12: { x: 100, y: 285 },
};

export default function LagnaChart({ houses = [], ascendant }) {
  if (!Array.isArray(houses) || houses.length === 0) return null;

  const H = (n) => houses.find((h) => h.number === n) || { sign: "", planets: [] };

  return (
    <div className="w-full max-w-[560px] mx-auto">
      <svg
        viewBox="0 0 400 400"
        role="img"
        aria-label="North Indian Lagna Chart"
        style={{ width: "100%", height: "auto" }}
      >
        {/* Frame */}
        <g stroke="#a855f7" strokeWidth="4" fill="none">
          <rect x="20" y="20" width="360" height="360" rx="2" />
          {/* Diamond */}
          <line x1="20"  y1="200" x2="200" y2="20"  />
          <line x1="200" y1="20"  x2="380" y2="200" />
          <line x1="380" y1="200" x2="200" y2="380" />
          <line x1="200" y1="380" x2="20"  y2="200" />
          {/* Cross */}
          <line x1="20"  y1="200" x2="380" y2="200" />
          <line x1="200" y1="20"  x2="200" y2="380" />
        </g>

        {/* Houses */}
        {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
          <HouseLabel
            key={n}
            n={n}
            data={H(n)}
            pos={POS[n]}
            highlight={n === 1}
          />
        ))}
      </svg>
    </div>
  );
}

function HouseLabel({ n, data, pos, highlight }) {
  const signShort = SIGN_SHORT[data.sign] || data.sign || "";
  const planetsShort = (data.planets || []).map((p) => PLANET_SHORT[p] || p);

  // Wrap planets across up to 2 lines
  const line1 = planetsShort.slice(0, 5).join(" ");
  const line2 = planetsShort.slice(5, 10).join(" ");

  // Pill background sizing
  const pillWidth = 88;
  const pillHeight = line2 ? 44 : 34;

  return (
    <g transform={`translate(${pos.x}, ${pos.y})`}>
      {/* background pill */}
      <rect
        x={-pillWidth / 2}
        y={-pillHeight / 2}
        width={pillWidth}
        height={pillHeight}
        rx="8"
        fill={highlight ? "rgba(234,179,8,0.18)" : "rgba(168,85,247,0.12)"}
        stroke={highlight ? "#eab308" : "rgba(168,85,247,0.45)"}
        strokeWidth="1.5"
      />

      {/* House number */}
      <text
        x="0"
        y={-pillHeight / 2 + 12}
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        fill={highlight ? "#eab308" : "#d8b4fe"}
      >
        H{n}
      </text>

      {/* Sign */}
      <text
        x="0"
        y="-2"
        textAnchor="middle"
        fontSize="11"
        fontWeight="600"
        fill="#e9d5ff"
      >
        {signShort}
      </text>

      {/* Planets (1–2 rows) */}
      {line1 && (
        <text x="0" y="10" textAnchor="middle" fontSize="10" fill="#e5e7eb">
          {line1}
        </text>
      )}
      {line2 && (
        <text x="0" y="22" textAnchor="middle" fontSize="10" fill="#e5e7eb">
          {line2}
        </text>
      )}
    </g>
  );
}
