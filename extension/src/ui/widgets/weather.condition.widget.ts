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

export class WeatherConditionWidget extends Widget<WeatherConditionData> {
	private conditionDisplayPen!: Pen<Elements>;
	private intervalId?: number;

	render(): PenArray {
		const config: UserConfig = this.getConfig();

		this.pens = PenArray.fromHTML(`
            <div id="weather-condition-widget-${this.id}" style="display: flex; align-items: center;">
                <span id="condition-display-${this.id}">Loading...</span>
            </div>
        `);

		this.conditionDisplayPen = this.pens.getById(`condition-display-${this.id}`);

		this.applyTextOptions(this.pens.getById(`weather-condition-widget-${this.id}`), config);

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
			this._displayWeather(cached.condition);
			return;
		}
		fetchWeather(units, owmApiKey, customIcons)
			.then((data) => {
				setCachedWeather(data);
				this._displayWeather(data.condition);
			})
			.catch(() => {
				this.conditionDisplayPen.element.textContent = "Weather unavailable";
			});
	}

	private _displayWeather(condition: string) {
		this.conditionDisplayPen.element.textContent = condition;
	}

	static defaultConfig(): WeatherConditionData {
		return {
			WidgetRecordId: "weather-condition-widget",
			description: "Displays current weather condition.",
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
	WidgetRegistry.registerWidget("weather-condition-widget", WeatherConditionWidget);
}

export default register();

export type WeatherConditionData = WidgetConfig<{
	units: "imperial" | "metric";
	owmApiKey: string;
	customIcons: Record<string, string>;
	color: string;
	fontFamily: string;
	fontWeight: string;
}>;

export interface WeatherConditionWidget extends TextOptionMixin {}

applyMixins(WeatherConditionWidget, [TextOptionMixin]);
