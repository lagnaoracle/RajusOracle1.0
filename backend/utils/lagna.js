// backend/utils/lagna.js
import * as Astronomy from "astronomy-engine";

/**
 * Calculates a simplified Lagna chart with planetary positions
 * and house assignments based on provided birth details.
 */
export function calculateLagna(date, time, lat, lon, tz) {
  try {
    // Combine date + time and adjust timezone
    const birthDateTime = new Date(`${date}T${time}:00`);
    const utcDate = new Date(birthDateTime.getTime() - tz * 3600 * 1000);

    // Define observer (latitude, longitude)
    const observer = new Astronomy.Observer(lat, lon, 0);

    // Define planets we care about
    const planetList = [
      "Sun",
      "Moon",
      "Mercury",
      "Venus",
      "Mars",
      "Jupiter",
      "Saturn",
    ];

    // Define zodiac signs
    const signs = [
      "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
      "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
    ];

    // 🪐 Calculate planet longitudes (geocentric ecliptic)
    const planetPositions = planetList.map((name) => {
      const body = Astronomy.Body[name];
      // get geocentric vector
      const vector = Astronomy.GeoVector(body, utcDate, true);
      const ecliptic = Astronomy.Ecliptic(vector); // converts to ecliptic coordinates
      const longitude = ecliptic.elon; // ecliptic longitude (degrees)
      const signIndex = Math.floor(longitude / 30);
      return {
        name,
        longitude: longitude.toFixed(2),
        sign: signs[signIndex],
      };
    });

    // 🌅 Calculate Ascendant (approximation)
    const hor = Astronomy.Horizon(utcDate, observer, 0, "rise", Astronomy.Body.Sun);
    const ascLong = (hor.azimuth + 180) % 360;
    const ascSignIndex = Math.floor(ascLong / 30);
    const ascSign = signs[ascSignIndex];

    // 🏠 Build simplified 12-house structure
    const houses = Array.from({ length: 12 }, (_, i) => {
      const sign = signs[(ascSignIndex + i) % 12];
      const planets = planetPositions
        .filter((p) => p.sign === sign)
        .map((p) => p.name);
      return { number: i + 1, sign, planets };
    });

    // Final chart
    const chart = {
      ascendant: ascSign,
      houses,
      planets: planetPositions,
    };

    return chart;
  } catch (error) {
    console.error("Lagna calculation error:", error);
    return {
      ascendant: null,
      houses: [],
      planets: [],
      error: error.message,
    };
  }
}
