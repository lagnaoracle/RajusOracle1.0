// backend/utils/lagna.js
import * as Astronomy from "astronomy-engine";

/**
 * Returns a simplified chart:
 * - Geocentric ecliptic longitudes for Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn
 * - A safe ascendant sign (fallback to Aries if anything fails)
 * - 12 houses labeled from the ascendant sign
 */
export function calculateLagna(date, time, lat, lon, tz) {
  const latNum = Number(lat);
  const lonNum = Number(lon); // east positive, west negative
  const tzNum  = Number(tz);

  // Local -> UTC
  const birthLocal = new Date(`${date}T${time}:00`);
  const birthUTC   = new Date(birthLocal.getTime() - tzNum * 3600 * 1000);

  const SIGNS = [
    "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
    "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"
  ];

  // --- Planet longitudes (robust) ---
  const wanted = ["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn"];
  const planets = [];
  for (const name of wanted) {
    try {
      const body = Astronomy.Body[name];
      const vec  = Astronomy.GeoVector(body, birthUTC, true); // geocentric
      const ecl  = Astronomy.Ecliptic(vec);                   // { elon, elat } in degrees
      const elon = normalize360(ecl.elon);
      const sign = SIGNS[Math.floor(elon / 30)];
      planets.push({ name, longitude: round2(elon), sign });
    } catch (e) {
      planets.push({ name, longitude: null, sign: null, error: String(e?.message || e) });
    }
  }

  // --- Ascendant sign (simple, safe estimate) ---
  let ascSignIndex = 0; // fallback Aries
  try {
    // SiderealTime returns GAST in HOURS; convert to degrees.
    const gastHours = Astronomy.SiderealTime(birthUTC); // 0..24 hours
    const gastDeg   = gastHours * 15;                   // 0..360 degrees
    // Local sidereal time (approx): add geographic longitude (degrees, east+).
    const lstDeg    = normalize360(gastDeg + lonNum);
    // Use as a pseudo ecliptic longitude proxy to pick a sign.
    const approxAscLong = lstDeg;
    ascSignIndex = Math.floor(approxAscLong / 30) % 12;
  } catch {
    // keep fallback
  }
  const ascendant = SIGNS[ascSignIndex];

  // --- Houses from ascendant sign ---
  const houses = Array.from({ length: 12 }, (_, i) => {
    const sign = SIGNS[(ascSignIndex + i) % 12];
    const inHouse = planets.filter(p => p.sign === sign).map(p => p.name);
    return { number: i + 1, sign, planets: inHouse };
  });

  return {
    ascendant,
    houses,
    planets,
    _meta: { utc: birthUTC.toISOString(), lat: latNum, lon: lonNum, tz: tzNum }
  };
}

// helpers
function normalize360(x) {
  let v = x % 360;
  if (v < 0) v += 360;
  return v;
}
function round2(x) {
  return x == null ? null : Math.round(x * 100) / 100;
}
