// backend/utils/lagna.js
import * as Astronomy from "astronomy-engine";

/**
 * Safe, dependency-light chart:
 * - Planet ecliptic longitudes (Sun..Saturn)
 * - Ascendant sign (kept as the current simple version so your UI stays stable)
 * - MC/IC ecliptic longitudes + signs (accurate)
 * - 12 houses starting at Ascendant sign
 */
export function calculateLagna(date, time, lat, lon, tz) {
  const SIGNS = [
    "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
    "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"
  ];

  // ---- Parse inputs & UTC time
  const latNum = Number(lat);
  const lonNum = Number(lon);
  const tzNum  = Number(tz);

  const local = new Date(`${date}T${time}:00`);
  const utc   = new Date(local.getTime() - tzNum * 3600 * 1000);

  // ---- Planets (geocentric ecliptic longitude)
  const wanted = ["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn"];
  const planets = [];
  for (const name of wanted) {
    try {
      const vec = Astronomy.GeoVector(Astronomy.Body[name], utc, true);
      const ecl = Astronomy.Ecliptic(vec);
      const L = norm(ecl.elon);
      planets.push({ name, longitude: round2(L), sign: SIGNS[Math.floor(L/30)] });
    } catch (e) {
      planets.push({ name, longitude: null, sign: null, error: String(e?.message || e) });
    }
  }

  // ---- Ascendant (keep simple/robust for now)
  // NOTE: this is the same “safe” ascendant you already have.
  let ascIndex = 0;
  try {
    const gastDeg = Astronomy.SiderealTime(utc);        // Greenwich sidereal (degrees)
    const localST  = norm(gastDeg + lonNum);            // local sidereal
    ascIndex = Math.floor(localST / 30) % 12;           // simple proxy
  } catch {}
  const ascendant = SIGNS[ascIndex];

  // ---- MC / IC (accurate ecliptic longitudes)
  let mcLongitude = null, icLongitude = null, mcSign = null, icSign = null;
  try {
    // local sidereal, radians
    const gastDeg = Astronomy.SiderealTime(utc);        // deg
    const theta   = deg2rad(norm(gastDeg + lonNum));    // local sidereal angle

    // true obliquity for this date (deg -> rad)
    const epsDeg  = Astronomy.EarthTilt(utc).obliquity; // deg
    const eps     = deg2rad(epsDeg);

    // Ecliptic longitude of MC: λ_MC = atan2( sinθ * cosε, cosθ )
    const sinT = Math.sin(theta);
    const cosT = Math.cos(theta);
    const lamMC = Math.atan2(sinT * Math.cos(eps), cosT); // radians
    mcLongitude = norm(rad2deg(lamMC));
    icLongitude = norm(mcLongitude + 180);

    mcSign = SIGNS[Math.floor(mcLongitude / 30)];
    icSign = SIGNS[Math.floor(icLongitude / 30)];
  } catch {}

  // ---- Build houses from Ascendant sign
  const houses = Array.from({ length: 12 }, (_, i) => {
    const sign = SIGNS[(ascIndex + i) % 12];
    const inHouse = planets.filter(p => p.sign === sign).map(p => p.name);

    // tag MC/IC if their sign lands in this house
    const markers = [];
    if (mcSign && mcSign === sign) markers.push("MC");
    if (icSign && icSign === sign) markers.push("IC");

    return {
      number: i + 1,
      sign,
      planets: inHouse,
      markers,          // <— ["MC"] / ["IC"] / ["MC","IC"] or []
    };
  });

  return {
    ascendant,
    ascendantLongitude: null,  // (we’re not exposing a precise ASC longitude in this version)
    mc: mcLongitude != null ? { longitude: round2(mcLongitude), sign: mcSign } : null,
    ic: icLongitude != null ? { longitude: round2(icLongitude), sign: icSign } : null,
    houses,
    planets,
    _meta: { utc: utc.toISOString(), lat: latNum, lon: lonNum, tz: tzNum }
  };
}

// ---- helpers
function norm(x){ let v = x % 360; if (v < 0) v += 360; return v; }
function round2(x){ return x == null ? null : Math.round(x*100)/100; }
function deg2rad(d){ return (d*Math.PI)/180; }
function rad2deg(r){ return (r*180)/Math.PI; }
