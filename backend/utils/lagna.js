import { AstroTime, SiderealTime } from "astronomy-engine";

export function calculateLagna(date, time, lat, lon, tz) {
  // Convert local time to UTC
  const localDateTime = new Date(`${date}T${time}:00`);
  const utc = new Date(localDateTime.getTime() - tz * 3600 * 1000);

  const astroTime = new AstroTime(utc);
  const sidereal = SiderealTime(astroTime);

  // Rough Lagna (Ascendant) degree
  const ascendantDeg = (sidereal * 15 + lon) % 360;

  // Map to zodiac sign
  const signs = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];
  const signIndex = Math.floor(ascendantDeg / 30);
  const ascSign = signs[signIndex];

  return {
    ascendantDeg: ascendantDeg.toFixed(2),
    ascSign,
    debug: { date, time, lat, lon, tz, utc: utc.toISOString() }
  };
}
