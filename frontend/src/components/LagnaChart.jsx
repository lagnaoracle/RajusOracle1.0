import React from "react";

/**
 * North Indian diamond-style Lagna chart
 * Renders 12 houses in traditional layout.
 * Expects props.houses = [{ number, sign, planets }]
 */
export default function LagnaChart({ houses = [] }) {
  if (!houses.length) return null;

  // Helper: find house by number safely
  const H = (num) => houses.find((h) => h.number === num) || { sign: "", planets: [] };

  return (
    <div className="relative w-[360px] h-[360px] mx-auto">
      {/* Outer Diamond Frame */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]"
      >
        <g stroke="#a855f7" strokeWidth="1" fill="none">
          {/* Outer square */}
          <rect x="5" y="5" width="90" height="90" />

          {/* Diamond diagonals */}
          <line x1="50" y1="5" x2="95" y2="50" />
          <line x1="50" y1="5" x2="5" y2="50" />
          <line x1="50" y1="95" x2="95" y2="50" />
          <line x1="50" y1="95" x2="5" y2="50" />
          <line x1="5" y1="50" x2="95" y2="50" />
          <line x1="50" y1="5" x2="50" y2="95" />
        </g>

        {/* House Labels */}
        <HouseBox house={H(1)} x={50} y={50} textAnchor="middle" dy="0.3em" />
        <HouseBox house={H(2)} x={75} y={25} />
        <HouseBox house={H(3)} x={90} y={50} />
        <HouseBox house={H(4)} x={75} y={75} />
        <HouseBox house={H(5)} x={50} y={90} />
        <HouseBox house={H(6)} x={25} y={75} />
        <HouseBox house={H(7)} x={10} y={50} />
        <HouseBox house={H(8)} x={25} y={25} />
        <HouseBox house={H(9)} x={62} y={10} />
        <HouseBox house={H(10)} x={88} y={38} />
        <HouseBox house={H(11)} x={62} y={88} />
        <HouseBox house={H(12)} x={12} y={62} />
      </svg>
    </div>
  );
}

/**
 * House text block renderer
 */
function HouseBox({ house, x, y, textAnchor = "middle", dy = ".3em" }) {
  const { number, sign, planets } = house;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x="0"
        y="0"
        textAnchor={textAnchor}
        dy={dy}
        className="fill-purple-300 text-[2.8px] font-semibold select-none"
      >
        {`H${number || ""}`}
      </text>

      {sign && (
        <text
          x="0"
          y="4"
          textAnchor={textAnchor}
          dy={dy}
          className="fill-purple-200 text-[2.5px] select-none"
        >
          {sign}
        </text>
      )}

      {planets?.length > 0 && (
        <text
          x="0"
          y="8"
          textAnchor={textAnchor}
          dy={dy}
          className="fill-gray-400 text-[2.2px] select-none"
        >
          {planets.join(", ")}
        </text>
      )}
    </g>
  );
}
