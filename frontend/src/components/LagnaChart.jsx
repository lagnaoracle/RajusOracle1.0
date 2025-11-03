// frontend/src/components/LagnaChart.jsx
import React from "react";

/**
 * Beautiful, readable North Indian Lagna Chart
 * - Responsive SVG diamond layout
 * - Clear house boxes with sign + planets
 * - Adapted for both desktop and mobile
 */
export default function LagnaChart({ houses = [] }) {
  if (!houses.length) return null;

  const H = (num) => houses.find((h) => h.number === num) || { sign: "", planets: [] };

  return (
    <div className="relative w-full max-w-[500px] mx-auto">
      <svg
        viewBox="0 0 200 200"
        className="w-full h-auto drop-shadow-[0_0_12px_rgba(168,85,247,0.6)]"
      >
        <g stroke="#a855f7" strokeWidth="2" fill="none">
          {/* Outer square */}
          <rect x="10" y="10" width="180" height="180" />

          {/* Diamond diagonals */}
          <line x1="10" y1="100" x2="100" y2="10" />
          <line x1="100" y1="10" x2="190" y2="100" />
          <line x1="190" y1="100" x2="100" y2="190" />
          <line x1="100" y1="190" x2="10" y2="100" />

          {/* Internal cross */}
          <line x1="10" y1="100" x2="190" y2="100" />
          <line x1="100" y1="10" x2="100" y2="190" />
        </g>

        {/* North Indian fixed house centers (approx visually balanced) */}
        <HouseBox house={H(1)} x={100} y={55} />
        <HouseBox house={H(2)} x={135} y={65} />
        <HouseBox house={H(3)} x={165} y={100} />
        <HouseBox house={H(4)} x={135} y={135} />
        <HouseBox house={H(5)} x={100} y={145} />
        <HouseBox house={H(6)} x={65} y={135} />
        <HouseBox house={H(7)} x={35} y={100} />
        <HouseBox house={H(8)} x={65} y={65} />
        <HouseBox house={H(9)} x={100} y={25} />
        <HouseBox house={H(10)} x={155} y={45} />
        <HouseBox house={H(11)} x={165} y={155} />
        <HouseBox house={H(12)} x={45} y={165} />
      </svg>
    </div>
  );
}

function HouseBox({ house, x, y }) {
  const { number, sign, planets = [] } = house;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        textAnchor="middle"
        className="fill-purple-300 text-[5px] font-semibold select-none"
        y="-2"
      >
        {`H${number}`}
      </text>
      {sign && (
        <text
          textAnchor="middle"
          className="fill-purple-200 text-[4px] select-none"
          y="4"
        >
          {sign}
        </text>
      )}
      {planets.length > 0 && (
        <text
          textAnchor="middle"
          className="fill-gray-300 text-[3.5px] select-none"
          y="10"
        >
          {planets.join(", ")}
        </text>
      )}
    </g>
  );
}
