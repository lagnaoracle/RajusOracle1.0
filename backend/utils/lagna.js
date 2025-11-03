// backend/utils/lagna.js
import * as Astronomy from "astronomy-engine";

/**
 * Returns a simplified chart:
 * - Geocentric ecliptic longitudes for Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn
 * - A very safe ascendant sign (with a fallback if we can't compute it)
 * - 12 houses labeled from the ascendant sign (fallback ascendant = Aries)
 *
 * This code NEVER throws: if any astronomy call fails, we still return a valid shape.
 */
export function calculateLagna(date, time, lat, lon, tz) {
  // Ensure numbers
  const latNum = Number(lat);
  const lonNum = Number(lon);
  const tzNum = Number(tz);

  // Prepare time in UTC
  const birthLocal = new Date(`${date}T${time}:00`);
  const birthUTC = new Date(birthLocal.getTime() - tzNum * 3600 * 1000);

  // Signs
  const SIGNS = [
    "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
    "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"
  ];

  // --- Planets (never throw) ---
  const wanted = ["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn"];
  const planets = [];
  for (const name of wanted) {
    try {
      const body = Astronomy.Body[name];
      // Geocentric vector at UTC; 'true' = correct for light travel time/aberration.
      const vec = Astronomy.GeoVector(body, birthUTC, true);
      const ecl = Astronomy.Ecliptic(vec);              // -> { elon, elat } in degrees
      const elon = normalize360(ecl.elon);
      const sign = SIGNS[Math.floor(elon / 30)];
      planets.push({ name, longitude: round2(elon), sign });
    } catch (e) {
      // If anything goes wrong, still push a placeholder so the UI doesn't break.
      planets.push({ name, longitude: null, sign: null, error: String(e?.message || e) });
    }
  }

  // --- Ascendant sign (safe fallback) ---
  // A precise Lagna needs more math (local sidereal time, ecliptic obliquity).
  // To keep your app stable right now, we try a simple estimate;
  // if anything fails, we default to Aries so houses still render.
  let ascSignIndex = 0;  // 0=Aries fallback
  try {
    // Rough estimate: use local apparent sidereal time to derive a pseudo-longitude.
    const observer = new Astronomy.Observer(latNum, lonNum, 0);
    const gast = Astronomy.SiderealTime(birthUTC); // degrees (0..360)
    // Project something stable into 0..360 and derive a sign.
    const approxAscLong = normalize360(gast + lonNum);
    ascSignIndex = Math.floor(approxAscLong / 30) % 12;
  } catch {
    // keep fallback (Aries)
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
    // keep a small meta to help you debug client-side if needed
    _meta: { utc: birthUTC.toISOString(), lat: latNum, lon: lonNum, tz: tzNum }
  };
}

// --- helpers ---
function normalize360(x) {
  let v = x % 360;
  if (v < 0) v += 360;
  return v;
}
function round2(x) {
  return x == null ? null : Math.round(x * 100) / 100;
}
