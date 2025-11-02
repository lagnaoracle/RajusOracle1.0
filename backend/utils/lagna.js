// utils/lagna.js
import swe from "swisseph";

export async function computeLagna({ date, time, lat, lon, tz }) {
  return new Promise((resolve, reject) => {
    const [year, month, day] = date.split("-").map(Number);
    const [hour, minute] = time.split(":").map(Number);
    const ut = swe.utc_time_zone(year, month, day, hour, minute, 0, tz);

    swe.swe_houses(
      ut.julian_day_ut,
      lat,
      lon,
      "P",
      (res) => {
        if (res.error) return reject(res.error);
        resolve({
          ascendant: res.ascendant,
          houses: res.house,
        });
      }
    );
  });
}
