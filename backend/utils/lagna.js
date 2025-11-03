// backend/utils/lagna.js
import * as Astronomy from "astronomy-engine";

/**
 * Computes a chart with:
 *  - Geocentric ecliptic longitudes for classical planets (true ecliptic)
 *  - Accurate Ascendant longitude/sign from LST + obliquity
 *  - 12 houses starting from Ascendant sign (whole-sign houses)
 *
 * Returns a stable shape even if something fails.
 */
export function calculateLagna(date, time, lat, lon, tz) {
  const latNum = Number(lat);
  const lonNum = Number(lon);
  const tzNum = Number(tz);

  const birthLocal = new Date(`${date}T${time}:00`);
  const birthUTC = new Date(birthLocal.getTime() - tzNum * 3600 * 1000);

  const SIGNS = [
    "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
    "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"
  ];

  // ---------- Planet longitudes (geocentric, true ecliptic) ----------
  const bodies = ["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn"];
  const planets = [];
  for (const name of bodies) {
    try {
      const body = Astronomy.Body[name];
      const vec = Astronomy.GeoVector(body, birthUTC, true);
      const ecl = Astronomy.Ecliptic(vec); // { elon, elat } in degrees
      const elon = norm360(ecl.elon);
      const sign = SIGNS[Math.floor(elon / 30)];
      planets.push({ name, longitude: round2(elon), sign });
    } catch (e) {
      planets.push({ name, longitude: null, sign: null, error: String(e?.message || e) });
    }
  }

  // ---------- Accurate Ascendant ----------
  let ascLongDeg = 0;    // ecliptic longitude of the Ascendant (degrees)
  let ascSignIndex = 0;  // 0..11
  try {
    // Greenwich apparent sidereal time in HOURS
    const gastHours = Astronomy.SiderealTime(birthUTC);
    // Local sidereal angle Θ in DEGREES
    const thetaDeg = norm360(gastHours * 15 + lonNum);
    const theta = deg2rad(thetaDeg);

    // True obliquity ε in DEGREES
    const epsDeg = Astronomy.Obliquity(birthUTC).obl; // astronomy-engine exposes .obl
    const eps = deg2rad(epsDeg);

    const phi = deg2rad(latNum); // latitude

    // Ascendant longitude (radians) using standard formula
    const y = -Math.cos(theta);
    const x = Math.sin(theta) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps);
    const lambda = Math.atan2(y, x); // [-pi, pi]

    ascLongDeg = norm360(rad2deg(lambda));
    ascSignIndex = Math.floor(ascLongDeg / 30) % 12;
  } catch (e) {
    // As a conservative fallback, keep Aries rising
    ascLongDeg = 0;
    ascSignIndex = 0;
  }

  const ascendant = SIGNS[ascSignIndex];

  // ---------- Whole-sign houses starting from Ascendant ----------
  const houses = Array.from({ length: 12 }, (_, i) => {
    const sign = SIGNS[(ascSignIndex + i) % 12];
    const inHouse = planets.filter(p => p.sign === sign).map(p => p.name);
    return { number: i + 1, sign, planets: inHouse };
  });

  return {
    ascendant,
    ascendantLongitude: round2(ascLongDeg),
    houses,
    planets,
    _meta: {
      utc: birthUTC.toISOString(),
      lat: latNum, lon: lonNum, tz: tzNum
    }
  };
}

/* ---------- helpers ---------- */
function norm360(x) { let v = x % 360; return v < 0 ? v + 360 : v; }
function deg2rad(d) { return (d * Math.PI) / 180; }
function rad2deg(r) { return (r * 180) / Math.PI; }
function round2(x) { return x == null ? null : Math.round(x * 100) / 100; }
