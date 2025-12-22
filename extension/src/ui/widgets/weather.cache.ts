// Shared weather cache and fetch logic for all weather widgets

// --- Interfaces for Weather APIs ---
interface NWSPointsResponse {
	properties: {
		forecastHourly: string;
	};
}

interface NWSHourlyForecastResponse {
	properties: {
		periods: {
			temperature: number;
			temperatureUnit: "F" | "C";
			shortForecast: string;
			icon: string;
		}[];
	};
}

interface OWMResponse {
	main: {
		temp: number;
	};
	weather: {
		main: string;
		icon: string;
	}[];
}

export type WeatherResult = { temp: number; condition: string; icon: string };

const CACHE_KEY = "weather-widget-cache";
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export function getCachedWeather(): WeatherResult | null {
	const cached = localStorage.getItem(CACHE_KEY);
	if (!cached) return null;
	try {
		const { timestamp, data } = JSON.parse(cached);
		if (Date.now() - timestamp < CACHE_DURATION) {
			return data;
		}
	} catch {
		return null;
	}
	return null;
}

export function setCachedWeather(data: WeatherResult) {
	localStorage.setItem(
		CACHE_KEY,
		JSON.stringify({ timestamp: Date.now(), data }),
	);
}

export async function fetchWeather(units: "imperial" | "metric", owmApiKey: string, customIcons: Record<string, string>): Promise<WeatherResult> {
	return new Promise((resolve, reject) => {
		if (!navigator.geolocation) {
			reject("Geolocation unavailable");
			return;
		}
		navigator.geolocation.getCurrentPosition(
			async (position) => {
				const { latitude, longitude } = position.coords;
				try {
					const nws = await fetchNWSWeather(latitude, longitude, units, customIcons);
					resolve(nws);
				} catch {
					try {
						const owm = await fetchOWMWeather(latitude, longitude, units, owmApiKey, customIcons);
						resolve(owm);
					} catch {
						reject("Weather fetch failed");
					}
				}
			},
			() => reject("Location error"),
		);
	});
}

async function fetchNWSWeather(lat: number, lon: number, units: "imperial" | "metric", customIcons: Record<string, string>): Promise<WeatherResult> {
	const pointsUrl = `https://api.weather.gov/points/${lat.toFixed(4)},${lon.toFixed(4)}`;
	const pointsResponse = await fetch(pointsUrl);
	if (!pointsResponse.ok) throw new Error("NWS points request failed");
	const pointsData: NWSPointsResponse = await pointsResponse.json();

	const forecastUrl = pointsData.properties.forecastHourly;
	const forecastResponse = await fetch(forecastUrl);
	if (!forecastResponse.ok) throw new Error("NWS forecast request failed");
	const forecastData: NWSHourlyForecastResponse = await forecastResponse.json();

	const currentForecast = forecastData.properties.periods[0];
	const tempUnit = units === "imperial" ? "F" : "C";
	let temp = currentForecast.temperature;

	if (currentForecast.temperatureUnit !== tempUnit) {
		if (tempUnit === "C") {
			temp = ((temp - 32) * 5) / 9;
		} else {
			temp = (temp * 9) / 5 + 32;
		}
	}

	return {
		temp: Math.round(temp),
		condition: currentForecast.shortForecast,
		icon: getIcon(currentForecast.shortForecast, customIcons) || currentForecast.icon,
	};
}

async function fetchOWMWeather(lat: number, lon: number, units: "imperial" | "metric", owmApiKey: string, customIcons: Record<string, string>): Promise<WeatherResult> {
	if (!owmApiKey) throw new Error("OWM API key needed");
	const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${owmApiKey}&units=${units}`;

	const response = await fetch(url);
	if (!response.ok) throw new Error("OpenWeatherMap request failed");
	const data: OWMResponse = await response.json();

	return {
		temp: Math.round(data.main.temp),
		condition: data.weather[0].main,
		icon: getIcon(data.weather[0].main, customIcons) ||
			`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
	};
}

function getIcon(condition: string, customIcons: Record<string, string>): string | undefined {
	const lowerCaseCondition = condition.toLowerCase();
	for (const key in customIcons) {
		if (lowerCaseCondition.includes(key.toLowerCase())) {
			return customIcons[key];
		}
	}
	return undefined;
}

