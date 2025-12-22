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

export class WeatherIconWidget extends Widget<WeatherIconData> {
	private iconDisplayPen!: Pen<Elements>;
	private intervalId?: number;

	render(): PenArray {
		const config: UserConfig = this.getConfig();

		this.pens = PenArray.fromHTML(`
            <div id="weather-icon-widget-${this.id}" style="display: flex; align-items: center;">
                <img id="weather-icon-${this.id}" class="w-12 h-12" />
            </div>
        `);

		this.iconDisplayPen = this.pens.getById(`weather-icon-${this.id}`);

		this.applyTextOptions(this.pens.getById(`weather-icon-widget-${this.id}`), config);

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
			this._displayWeather(cached.icon);
			return;
		}
		fetchWeather(units, owmApiKey, customIcons)
			.then((data) => {
				setCachedWeather(data);
				this._displayWeather(data.icon);
			})
			.catch(() => {
				this.iconDisplayPen.element.setAttribute("alt", "Weather unavailable");
			});
	}

	private _displayWeather(icon: string) {
		(this.iconDisplayPen.element as HTMLImageElement).src = icon;
	}

	static defaultConfig(): WeatherIconData {
		return {
			WidgetRecordId: "weather-icon-widget",
			description: "Displays current weather icon.",
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
	WidgetRegistry.registerWidget("weather-icon-widget", WeatherIconWidget);
}

export default register();

export type WeatherIconData = WidgetConfig<{
	units: "imperial" | "metric";
	owmApiKey: string;
	customIcons: Record<string, string>;
	color: string;
	fontFamily: string;
	fontWeight: string;
}>;

export interface WeatherIconWidget extends TextOptionMixin {}

applyMixins(WeatherIconWidget, [TextOptionMixin]);
