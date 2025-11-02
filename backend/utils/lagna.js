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

    // Convert to Julian date for Astronomy-engine
    const observer = new Astronomy.Observer(lat, lon, 0);

    // Define planets we care about
    const planetList = [
      "Sun",
      "Moon",
      "Mercury",
      "Venus",
      "Mars",
      "Jupiter",
      "Saturn"
    ];

    // Calculate ecliptic longitudes
    const planetPositions = planetList.map((name) => {
      const body = Astronomy.Body[name];
      const ecl = Astronomy.EclipticGeo(body, utcDate);
      const longitude = ecl.elon; // ecliptic longitude
      const signIndex = Math.floor(longitude / 30);
      const signs = [
        "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
        "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
      ];
      return {
        name,
        longitude: longitude.toFixed(2),
        sign: signs[signIndex]
      };
    });

    // Calculate Ascendant (Lagna)
    const earthRotation = Astronomy.Rotation_EQD_HOR(utcDate, observer);
    const ascendantLongitude = (earthRotation.rot[0] * 180) / Math.PI;
    const signs = [
      "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
      "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ];
    const ascSignIndex = Math.floor(((ascendantLongitude % 360) + 360) % 360 / 30);
    const ascSign = signs[ascSignIndex];

    // Build simplified house structure
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
      planets: planetPositions
    };

    return chart;
  } catch (error) {
    console.error("Lagna calculation error:", error);
    return {
      ascendant: null,
      houses: [],
      planets: [],
      error: error.message
    };
  }
}
