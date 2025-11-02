import React, { useState } from "react";
import axios from "axios";

export default function CitySelector({ setLat, setLon }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const API_KEY = import.meta.env.VITE_GEODB_API_KEY;

  const fetchCities = async (q) => {
    if (q.length < 3) return;
    try {
      const res = await axios.get(
        `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${q}`,
        {
          headers: {
            "X-RapidAPI-Key": API_KEY,
            "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
          },
        }
      );
      setSuggestions(res.data.data);
    } catch (error) {
      console.error("City fetch error:", error);
    }
  };

  return (
    <div className="col-span-2 relative">
      <input
        type="text"
        placeholder="Enter your city"
        className="p-2 rounded-md text-black w-full"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          fetchCities(e.target.value);
        }}
      />
      {suggestions.length > 0 && (
        <ul className="absolute bg-black/80 rounded-md mt-1 max-h-40 overflow-y-auto text-sm w-full z-10">
          {suggestions.map((city) => (
            <li
              key={city.id}
              onClick={() => {
                setLat(city.latitude);
                setLon(city.longitude);
                setQuery(`${city.city}, ${city.country}`);
                setSuggestions([]);
              }}
              className="p-2 hover:bg-purple-800 cursor-pointer"
            >
              {city.city}, {city.country}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
