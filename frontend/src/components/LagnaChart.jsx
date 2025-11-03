import React, { useMemo } from "react";

/**
 * Readable North-Indian diamond chart.
 * Props:
 *  - houses: [{ number: 1..12, sign: string, planets: string[] }]
 *  - ascendant: string
 *  - planets: optional full planet list
 */
export default function LagnaChart({ houses = [], ascendant }) {
  if (!Array.isArray(houses) || houses.length !== 12) return null;

  // Planet abbreviations to avoid long words overlapping.
  const short = (name) => {
    switch (name) {
      case "Sun": return "Su";
      case "Moon": return "Mo";
      case "Mercury": return "Me";
      case "Venus": return "Ve";
      case "Mars": return "Ma";
      case "Jupiter": return "Ju";
      case "Saturn": return "Sa";
      default: return name?.slice(0, 2) || "";
    }
  };

  const signShort = (sign) =>
    ({
      Aries: "Ar", Taurus: "Ta", Gemini: "Ge", Cancer: "Cn",
      Leo: "Le", Virgo: "Vi", Libra: "Li", Scorpio: "Sc",
      Sagittarius: "Sg", Capricorn: "Cp", Aquarius: "Aq", Pisces: "Pi",
    }[sign] || sign || "");

  // Quick lookup by house number
  const H = (n) => houses.find((h) => h.number === n) || { sign: "", planets: [] };

  // Text helpers: join planets in a compact way and split onto 2 lines if needed
  const planetLines = (arr) => {
    const txt = (arr || []).map(short).join(" ");
    if (txt.length <= 10) return [txt, ""];
    const mid = Math.ceil(txt.length / 2);
    // split on nearest space to the midpoint
    let split = txt.lastIndexOf(" ", mid);
    if (split < 0) split = mid;
    return [txt.slice(0, split), txt.slice(split + 1)];
  };

  // For accessibility/contrast
  const lineColor = "#a855f7"; // Purple-500
  const textLight = "#e9d5ff"; // Purple-100
  const textDim = "#c4b5fd";   // Purple-200
  const textGray = "#cbd5e1";  // Slate-300
  const ascFill = "rgba(168,85,247,0.15)"; // subtle highlight

  // Positions for labels (fixed layout)
  const spots = useMemo(() => ([
    { n: 1,  x: 50, y: 20 },
    { n: 2,  x: 70, y: 30 },
    { n: 3,  x: 85, y: 45 },
    { n: 4,  x: 70, y: 70 },
    { n: 5,  x: 50, y: 80 },
    { n: 6,  x: 30, y: 70 },
    { n: 7,  x: 15, y: 45 },
    { n: 8,  x: 30, y: 30 },
    { n: 9,  x: 50, y: 8  },
    { n: 10, x: 85, y: 18 },
    { n: 11, x: 85, y: 82 },
    { n: 12, x: 15, y: 82 },
  ]), []);

  return (
    <div className="mx-auto w-full max-w-[520px]">
      {/* Optional header row */}
      {ascendant && (
        <p className="mb-2 text-sm text-purple-200 text-center">
          Ascendant: <span className="font-semibold">{ascendant}</span>
        </p>
      )}
      <div className="relative w-full aspect-square">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Outer frame + diagonals */}
          <g stroke={lineColor} strokeWidth="1.6" fill="none">
            <rect x="5" y="5" width="90" height="90" rx="0.8" />
            <line x1="5" y1="50" x2="50" y2="5" />
            <line x1="50" y1="5"  x2="95" y2="50" />
            <line x1="95" y1="50" x2="50" y2="95" />
            <line x1="50" y1="95" x2="5"  y2="50" />
            <line x1="5"  y1="50" x2="95" y2="50" />
            <line x1="50" y1="5"  x2="50" y2="95" />
          </g>

          {/* Ascendant area subtle highlight (center-top diamond) */}
          <polygon
            points="50,5 95,50 50,50 5,50"
            fill={ascFill}
            opacity="0.6"
          />

          {/* House labels */}
          {spots.map(({ n, x, y }) => {
            const house = H(n);
            const [line1, line2] = planetLines(house.planets);
            return (
              <g key={n} transform={`translate(${x},${y})`} textAnchor="middle">
                <text
                  y={-2.8}
                  fontSize="4.2"
                  fill={textLight}
                  fontWeight="700"
                >
                  H{n}
                </text>
                <text
                  y={2.2}
                  fontSize="3.8"
                  fill={textDim}
                  fontWeight="600"
                >
                  {signShort(house.sign)}
                </text>
                {line1 && (
                  <text y={6.0} fontSize="3.4" fill={textGray}>
                    {line1}
                  </text>
                )}
                {line2 && (
                  <text y={9.2} fontSize="3.4" fill={textGray}>
                    {line2}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      {/* Tiny legend */}
      <p className="mt-2 text-xs text-center text-slate-300">
        Planets: Su Sun · Mo Moon · Me Mercury · Ve Venus · Ma Mars · Ju Jupiter · Sa Saturn
      </p>
    </div>
  );
}
