import * as Astronomy from "astronomy-engine";
import moment from "moment-timezone";

/**
 * Compute Lagna (Ascendant) and planetary positions
 */
export function calculateLagna(date, time, lat, lon, tz) {
  try {
    // Combine date and time in local timezone
    const dateTimeString = `${date} ${time}`;
    const localTime = moment.tz(dateTimeString, "YYYY-MM-DD HH:mm", tz * 60).toDate();

    // Create observer
    const observer = new Astronomy.Observer(lat, lon, 0);
    const astroTime = Astronomy.MakeTime(localTime);

    // Compute sidereal time and ascendant
    const siderealTime = Astronomy.SiderealTime(astroTime);
    const ascendantLongitude = (siderealTime * 15 + lon) % 360;

    // Compute planet positions
    const planets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"];
    const planetPositions = {};

    planets.forEach((planet) => {
      const body = Astronomy.Body[planet];
      const equ = Astronomy.Equator(body, astroTime, observer, true, true);
      const hor = Astronomy.Horizon(astroTime, observer, equ.ra, equ.dec, "normal");
      planetPositions[planet] = {
        altitude: hor.altitude.toFixed(2),
        azimuth: hor.azimuth.toFixed(2),
      };
    });

    // 12 houses (each 30° apart)
    const houses = {};
    for (let i = 1; i <= 12; i++) {
      houses[`House_${i}`] = ((ascendantLongitude + (i - 1) * 30) % 360).toFixed(2);
    }

    return {
      ascendantLongitude: ascendantLongitude.toFixed(2),
      siderealTime: siderealTime.toFixed(2),
      planets: planetPositions,
      houses,
    };
  } catch (err) {
    console.error("Lagna calculation error:", err);
    return { error: "Calculation failed" };
  }
}
