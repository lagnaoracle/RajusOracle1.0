import React from "react";

/**
 * North Indian (diamond-style) Lagna chart.
 * 12 houses in fixed geometric layout.
 * Each house shows: number, sign, planets.
 *
 * Expected data: houses = [{ number, sign, planets }]
 */
export default function LagnaChart({ houses = [] }) {
  if (!houses.length) return null;

  // Helper: get house by number
  const H = (num) => houses.find((h) => h.number === num) || { sign: "", planets: [] };

  return (
    <div className="relative w-[360px] h-[360px] mx-auto">
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
      >
        <g stroke="#a855f7" strokeWidth="1" fill="none">
          {/* Outer square */}
          <rect x="5" y="5" width="90" height="90" />

          {/* Diamond diagonals */}
          <line x1="5" y1="50" x2="50" y2="5" />
          <line x1="50" y1="5" x2="95" y2="50" />
          <line x1="95" y1="50" x2="50" y2="95" />
          <line x1="50" y1="95" x2="5" y2="50" />

          {/* Internal cross */}
          <line x1="5" y1="50" x2="95" y2="50" />
          <line x1="50" y1="5" x2="50" y2="95" />
        </g>

        {/* House blocks — fixed for North Indian layout */}
        <HouseBox house={H(1)}  x={50} y={22} />
        <HouseBox house={H(2)}  x={70} y={30} />
        <HouseBox house={H(3)}  x={85} y={45} />
        <HouseBox house={H(4)}  x={70} y={68} />
        <HouseBox house={H(5)}  x={50} y={78} />
        <HouseBox house={H(6)}  x={30} y={68} />
        <HouseBox house={H(7)}  x={15} y={45} />
        <HouseBox house={H(8)}  x={30} y={30} />
        <HouseBox house={H(9)}  x={50} y={10} />
        <HouseBox house={H(10)} x={80} y={20} />
        <HouseBox house={H(11)} x={85} y={75} />
        <HouseBox house={H(12)} x={20} y={80} />
      </svg>
    </div>
  );
}

/**
 * Text label for each house
 */
function HouseBox({ house, x, y }) {
  const { number, sign, planets } = house;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x="0"
        y="0"
        textAnchor="middle"
        className="fill-purple-300 text-[3px] font-semibold select-none"
      >
        {`H${number}`}
      </text>

      {sign && (
        <text
          x="0"
          y="4"
          textAnchor="middle"
          className="fill-purple-200 text-[2.8px] select-none"
        >
          {sign}
        </text>
      )}

      {planets?.length > 0 && (
        <text
          x="0"
          y="8"
          textAnchor="middle"
          className="fill-gray-400 text-[2.5px] select-none"
        >
          {planets.join(", ")}
        </text>
      )}
    </g>
  );
}
