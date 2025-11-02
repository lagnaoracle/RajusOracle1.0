import swisseph from "swisseph-latest";
import moment from "moment-timezone";

export async function calculateLagna(date, time, lat, lon, tz) {
  return new Promise((resolve, reject) => {
    try {
      const datetime = moment.tz(`${date} ${time}`, "YYYY-MM-DD HH:mm", tz);
      const julianDay = swisseph.swe_julday(
        datetime.year(),
        datetime.month() + 1,
        datetime.date(),
        datetime.hour() + datetime.minute() / 60
      );

      swisseph.swe_houses(
        julianDay,
        lat,
        lon,
        "P",
        (result) => {
          if (result.error) return reject(result.error);
          const ascendant = result.ascendant;
          resolve({ ascendant, houses: result.houses });
        }
      );
    } catch (err) {
      reject(err);
    }
  });
}
