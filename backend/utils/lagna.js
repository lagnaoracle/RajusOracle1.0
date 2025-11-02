import { AstroTime, Equatorial, SiderealTime } from "astronomy-engine";

export function calculateLagna(date, time, lat, lon, tz) {
  // Combine date & time into a single UTC timestamp
  const localDateTime = new Date(`${date}T${time}:00`);
  const utc = new Date(localDateTime.getTime() - tz * 3600 * 1000);

  const astroTime = new AstroTime(utc);
  const sidereal = SiderealTime(astroTime);

  // Simplified Lagna calculation
  const ascendantDeg = (sidereal * 15 + lon) % 360;

  return {
    ascendant: ascendantDeg.toFixed(2),
    debug: { date, time, lat, lon, tz }
  };
}
