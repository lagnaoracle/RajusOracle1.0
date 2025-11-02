import * as Astronomy from "astronomy-engine";

/**
 * Calculates Lagna (Ascendant) and planetary positions
 * for Vedic-style charting (simplified).
 * Returns 12 houses with proper numbering (1 = Ascendant).
 */
export function calculateLagna(date, time, lat, lon, tz) {
  try {
    const birthDateTime = new Date(`${date}T${time}:00`);
    const utcDate = new Date(birthDateTime.getTime() - tz * 3600 * 1000);

    const observer = new Astronomy.Observer(lat, lon, 0);

    const signs = [
      "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
      "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ];

    // ---- 1️⃣ Compute Ascendant ----
    const asc = Astronomy.Horizon(utcDate, observer, 90, 0, "normal");
    // Using the local sidereal time approximation
    const ascLong = ((asc.azimuth + 180) % 360); // east horizon
    const ascSignIndex = Math.floor(ascLong / 30);
    const ascSign = signs[ascSignIndex];

    // ---- 2️⃣ Compute planet longitudes ----
    const planetList = [
      "Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"
    ];

    const planetPositions = planetList.map((name) => {
      const body = Astronomy.Body[name];
      const ecl = Astronomy.EclipticGeo(body, utcDate);
      const longitude = (ecl.elon + 360) % 360;
      const signIndex = Math.floor(longitude / 30);
      return {
        name,
        longitude: longitude.toFixed(2),
        sign: signs[signIndex],
      };
    });

    // ---- 3️⃣ Assign planets to houses based on sign ----
    const houses = Array.from({ length: 12 }, (_, i) => {
      const houseSign = signs[(ascSignIndex + i) % 12];
      const planetsInHouse = planetPositions
        .filter((p) => p.sign === houseSign)
        .map((p) => p.name);

      return {
        number: i + 1,
        sign: houseSign,
        planets: planetsInHouse,
      };
    });

    // ---- 4️⃣ Return structured data ----
    return {
      ascendant: ascSign,
      ascendantLongitude: ascLong.toFixed(2),
      houses,
      planets: planetPositions,
    };

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
