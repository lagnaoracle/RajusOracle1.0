import React from "react";
import "./LagnaChart.css";

/**
 * Traditional diamond-style Vedic Lagna chart
 * Props: houses (array from lagna.houses)
 */
export default function LagnaChart({ houses }) {
  if (!houses || houses.length === 0) return null;

  const positions = [
    { top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(45deg)" }, // center (ascendant)
    { top: "10%", left: "50%", transform: "translate(-50%, -50%) rotate(45deg)" },
    { top: "20%", left: "80%", transform: "translate(-50%, -50%) rotate(45deg)" },
    { top: "50%", left: "90%", transform: "translate(-50%, -50%) rotate(45deg)" },
    { top: "80%", left: "80%", transform: "translate(-50%, -50%) rotate(45deg)" },
    { top: "90%", left: "50%", transform: "translate(-50%, -50%) rotate(45deg)" },
    { top: "80%", left: "20%", transform: "translate(-50%, -50%) rotate(45deg)" },
    { top: "50%", left: "10%", transform: "translate(-50%, -50%) rotate(45deg)" },
    { top: "20%", left: "20%", transform: "translate(-50%, -50%) rotate(45deg)" },
    { top: "35%", left: "65%", transform: "translate(-50%, -50%) rotate(45deg)" },
    { top: "65%", left: "65%", transform: "translate(-50%, -50%) rotate(45deg)" },
    { top: "65%", left: "35%", transform: "translate(-50%, -50%) rotate(45deg)" },
  ];

  return (
    <div className="chart-wrapper">
      <div className="diamond">
        {houses.map((house, i) => (
          <div
            key={house.number}
            className="house"
            style={positions[i] || {}}
          >
            <div className="house-num">{house.number}</div>
            <div className="sign">{house.sign}</div>
            <div className="planets">
              {house.planets.join(", ") || "—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
