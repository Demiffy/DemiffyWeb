import { useState } from "react";
import Footer from "./ui/Footer";

const WeatherApp = () => {
  const [city, setCity] = useState<string>("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCitySuggestions = async (query: string) => {
    try {
      const apiKey = "acd341b246f6e11745c0bc7978b8d32e";
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch city suggestions");
      }
      const result = await response.json();
      setSuggestions(result);
    } catch {
      setSuggestions([]);
    }
  };

  const fetchWeather = async (lat: number, lon: number) => {
    try {
      const apiKey = "acd341b246f6e11745c0bc7978b8d32e";
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );

      if (!response.ok) {
        throw new Error("City not found or API error");
      }

      const result = await response.json();
      setWeather(result);
      setError(null);
    } catch (error: any) {
      setWeather(null);
      setError(error.message);
    }
  };

  const handleCityInput = (input: string) => {
    setCity(input);
    if (input.length > 0) {
      fetchCitySuggestions(input);
    } else {
      setSuggestions([]);
    }
  };

  const handleCitySelect = (selectedCity: any) => {
    setCity(`${selectedCity.name}, ${selectedCity.country}`);
    setSuggestions([]);
    fetchWeather(selectedCity.lat, selectedCity.lon);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getSunPosition = (sunrise: number, sunset: number) => {
    const now = Date.now() / 1000;
    if (now <= sunrise) return 0;
    if (now >= sunset) return 100;
    return ((now - sunrise) / (sunset - sunrise)) * 100;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow text-white flex flex-col items-center py-10">
        <h1 className="text-5xl font-extrabold text-sky-400 mb-8">Weather App</h1>
        <div className="relative w-full max-w-lg">
          <input
            type="text"
            placeholder="Enter city name"
            value={city}
            onChange={(e) => handleCityInput(e.target.value)}
            className="w-full px-4 py-3 text-white rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          {suggestions.length > 0 && (
            <ul className="absolute w-full bg-white text-black rounded-lg shadow-lg mt-1 z-10">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() => handleCitySelect(suggestion)}
                  className="px-4 py-2 hover:bg-sky-200 cursor-pointer"
                >
                  {suggestion.name}, {suggestion.country}
                </li>
              ))}
            </ul>
          )}
        </div>
        {error && <p className="mt-6 text-red-500">{error}</p>}
        {weather && (
          <div className="flex gap-8 mt-10">
            {/* Weather Details */}
            <div className="bg-gradient-to-r from-sky-500 to-sky-700 text-white p-8 rounded-xl shadow-lg w-full max-w-4xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-4xl font-bold">{weather.name}</h2>
                <img
                  src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
                  alt={weather.weather[0].description}
                  className="w-20 h-20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <p className="text-lg">
                  <strong>Description:</strong>{" "}
                  {weather.weather[0].description.charAt(0).toUpperCase() +
                    weather.weather[0].description.slice(1)}
                </p>
                <p className="text-lg">
                  <strong>Temperature:</strong> {weather.main.temp}°C
                </p>
                <p className="text-lg">
                  <strong>Feels Like:</strong> {weather.main.feels_like}°C
                </p>
                <p className="text-lg">
                  <strong>Humidity:</strong> {weather.main.humidity}%
                </p>
                <p className="text-lg">
                  <strong>Wind Speed:</strong> {weather.wind.speed} m/s
                </p>
                <p className="text-lg">
                  <strong>Pressure:</strong> {weather.main.pressure} hPa
                </p>
                <p className="text-lg">
                  <strong>Visibility:</strong> {weather.visibility / 1000} km
                </p>
              </div>
            </div>

            {/* Sunrise & Sunset */}
            <div className= "text-white p-8 rounded-xl w-full max-w-4xl">
              <div className="mb-6">
              </div>
              <div className="mt-8 bg-slate-700 p-6 rounded-xl shadow-lg">
                <h3 className="text-2xl font-bold text-sky-300 mb-4">
                  Sunrise & Sunset
                </h3>
                <div className="relative h-40 w-full">
                  <svg
                    viewBox="0 0 100 50"
                    className="w-full h-full"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient id="gradient" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor="#fbbf24" />
                        <stop offset="50%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#1e3a8a" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 5 35 Q 25 15 45 35 T 85 35"
                      stroke="url(#gradient)"
                      strokeWidth="2"
                      fill="none"
                    />
                    <circle
                      cx={5 + getSunPosition(weather.sys.sunrise, weather.sys.sunset) * 0.9}
                      cy="25"
                      r="4"
                      fill="#fbbf24"
                      className="drop-shadow-lg animate-pulse"
                    />
                  </svg>
                  <div className="absolute top-0 left-0">
                    <p className="text-xs text-gray-300">Sunrise</p>
                    <p className="text-lg text-sky-200 font-semibold">
                      {formatTime(weather.sys.sunrise)}
                    </p>
                  </div>
                  <div className="absolute top-0 right-0">
                    <p className="text-xs text-gray-300">Sunset</p>
                    <p className="text-lg text-sky-200 font-semibold">
                      {formatTime(weather.sys.sunset)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default WeatherApp;