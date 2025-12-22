import { WidgetRegistry } from "../../data/widgetmanager";
import { type Elements, type Pen, PenArray } from "../../framework/penexutils";
import {
	type UserConfig,
	Widget,
	type WidgetConfig,
	type WidgetOptionsRecord,
} from "../../types";
import { applyMixins } from "../../utils/mixins";
import { TextOptionMixin } from "../widgetmixins";
import { TextOption } from "../widgetoptions";
import { getCachedWeather, setCachedWeather, fetchWeather } from "./weather.cache";

export class WeatherTempWidget extends Widget<WeatherTempData> {
	private tempDisplayPen!: Pen<Elements>;
	private intervalId?: number;

	render(): PenArray {
		const config: UserConfig = this.getConfig();

		this.pens = PenArray.fromHTML(`
            <div id="weather-temp-widget-${this.id}" style="display: flex; align-items: center;">
                <span id="temp-display-${this.id}" class="text-4xl">--°</span>
            </div>
        `);

		this.tempDisplayPen = this.pens.getById(`temp-display-${this.id}`);

		this.applyTextOptions(this.pens.getById(`weather-temp-widget-${this.id}`), config);

		this._updateWeather();

		this.intervalId = window.setInterval(() => {
			this._updateWeather();
		}, 15 * 60 * 1000);

		return this.pens;
	}

	private _updateWeather() {
		const cached = getCachedWeather();
		const { units, owmApiKey, customIcons } = this.data.data;
		if (cached) {
			this._displayWeather(cached.temp);
			return;
		}
		fetchWeather(units, owmApiKey, customIcons)
			.then((data) => {
				setCachedWeather(data);
				this._displayWeather(data.temp);
			})
			.catch(() => {
				this.tempDisplayPen.element.textContent = "--°";
			});
	}

	private _displayWeather(temp: number) {
		this.tempDisplayPen.element.textContent = `${temp}°`;
	}

	static defaultConfig(): WeatherTempData {
		return {
			WidgetRecordId: "weather-temp-widget",
			description: "Displays current temperature.",
			enabled: true,
			position: { x: 0.5, y: 0, scaleX: 1, scaleY: 1 },
			data: {
				units: "imperial",
				owmApiKey: "",
				customIcons: {},
				...TextOptionMixin.defaultOptions(),
			},
		};
	}

	static getWidgetOptionsRecord(): WidgetOptionsRecord {
		return {
			units: new TextOption(
				"Units",
				"Temperature units: 'imperial' (F) or 'metric' (C).",
			),
			owmApiKey: new TextOption(
				"OpenWeatherMap API Key",
				"Required for fallback weather service.",
			),
			...TextOptionMixin.getWidgetOptionsRecord(),
		};
	}
}

function register() {
	WidgetRegistry.registerWidget("weather-temp-widget", WeatherTempWidget);
}

export default register();

export type WeatherTempData = WidgetConfig<{
	units: "imperial" | "metric";
	owmApiKey: string;
	customIcons: Record<string, string>;
	color: string;
	fontFamily: string;
	fontWeight: string;
}>;

export interface WeatherTempWidget extends TextOptionMixin {}

applyMixins(WeatherTempWidget, [TextOptionMixin]);
