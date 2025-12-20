// good first widget to look at if you're new to the codebase

import { WidgetRegistry } from "../../data/widgetmanager";
import { type Elements, type Pen, PenArray } from "../../framework/penexutils";
import {
	type UserConfig,
	Widget,
	type WidgetConfig,
	type WidgetOptionsRecord,
} from "../../types";
import { applyMixins } from "../../utils/mixins";
import { strftime } from "../../utils/strftime";
import { TextOptionMixin } from "../widgetmixins";
import { CheckboxOption, TextOption } from "../widgetoptions";

export class ClockWidget extends Widget<ClockData> {
	private timeDisplayPen!: Pen<Elements>;

	render(): PenArray {
		const config: UserConfig = this.getConfig();

		// dont use tailwind in custom widgets, the utitlity classes are not guaranteed to be available
		this.pens = PenArray.fromHTML(`
        <div id="clock-widget-${this.id}"  style="white-space: nowrap;">
            <span id="time-display-${this.id}" class="text-4xl">--:--:--</span>
        </div>
        `);

		this.timeDisplayPen = this.pens.getById(`time-display-${this.id}`);

		this.applyTextOptions(this.pens.getById(`clock-widget-${this.id}`), config);

		window.setInterval(() => {
			this._updateTime();
		}, 1000);

		this._updateTime();

		if (!this.displayInstance && !this.editorInstance) {
			this.setParent(this.pens.getById(`clock-widget-${this.id}`));
			this.setPosition(this.pens.getById(`clock-widget-${this.id}`));
		} else {
		}

		// this.pens is automatically added to the main app container by the framework
		return this.pens;
	}

	private _updateTime() {
		if (this.data.data.useStrfFormat) {
			// use strftime format
			this.timeDisplayPen.element.textContent = strftime(
				this.data.data.formatString,
			);
			return;
		}

		const now = new Date();
		let hours = now.getHours();
		const minutes = now.getMinutes();
		if (!this.data.data.militartTime) {
			hours = hours % 12;
			if (hours === 0) hours = 12; // handle midnight and noon
		}
		if (this.data.data.showSeconds) {
			const seconds = now.getSeconds();
			this.timeDisplayPen.element.textContent = `${this._padZero(hours)}:${this._padZero(minutes)}:${this._padZero(seconds)}`;
		} else {
			this.timeDisplayPen.element.textContent = `${this._padZero(hours)}:${this._padZero(minutes)}`;
		}
	}

	private _padZero(num: number): string {
		return num < 10 ? `0${num}` : num.toString();
	}

	static defaultConfig(): ClockData {
		return {
			WidgetRecordId: "clock-widget",
			// description shown in the widget drawer, not to be changed really every so dont worry.
			description: "A simple clock widget that displays the current time.",

			enabled: true,
			position: {
				x: 0,
				y: 0,
				scaleX: 0.5,
				scaleY: 0.5,
			},
			data: {
				militartTime: false,
				showSeconds: true,
				useStrfFormat: false,
				formatString: "%H:%M:%S",
				...TextOptionMixin.defaultOptions(),
			},
		};
	}
	static getWidgetOptionsRecord(): WidgetOptionsRecord {
		return {
			useStrfFormat: new CheckboxOption(
				"Use strftime Format",
				"If true, the clock will use the strftime format string provided below. If false, it will use the simple hour:minute(:second) format.",
			),
			formatString: new TextOption(
				"Format String",
				"The strftime format string to use for displaying the time. Only used if 'Use strftime Format' is true.",
			),
			showSeconds: new CheckboxOption(
				"Show Seconds",
				"If true, the clock will display seconds.",
			),
			militartTime: new CheckboxOption(
				"Military Time",
				"If true, the clock will use 24-hour format.",
			),
			...TextOptionMixin.getWidgetOptionsRecord(),
		};
	}
}

function register() {
	WidgetRegistry.registerWidget("clock-widget", ClockWidget);
}

export default register();

export type ClockData = WidgetConfig<{
	useStrfFormat: boolean;
	formatString: string;
	showSeconds: boolean;
	militartTime: boolean;
	color: string;
	fontFamily: string;
	fontWeight: string;
}>;

export interface ClockWidget extends TextOptionMixin {}

applyMixins(ClockWidget, [TextOptionMixin]);
