import { WidgetRegistry } from "../../data/widgetmanager";
import { PenArray } from "../../framework/penexutils";
import {
	type UserConfig,
	Widget,
	type WidgetConfig,
	type WidgetOptionsRecord,
} from "../../types";
import { ColorOption, TextOption } from "../widgetoptions";

export class TextWidget extends Widget<WidgetConfig<TextData>> {
	render(): PenArray {
		// idk why, but typescript is being weird in this file, just ignore the errors, and all the other ones because it is not worth the time
		const config: UserConfig = this.getConfig();

		let fontFamily: string;
		let color: string;
		let fontWeight: string;
		let fontSize: string;
		let fontStyle: string;

		fontFamily =
			this.data.data.fontFamily.trim() === ""
				? config.fontFamily
				: this.data.data.fontFamily;
		color =
			this.data.data.color.trim() === ""
				? config.colors.textColor
				: this.data.data.color;
		fontWeight =
			this.data.data.fontWeight.trim() === ""
				? "normal"
				: this.data.data.fontWeight;
		fontSize =
			this.data.data.fontSize && this.data.data.fontSize > 0
				? `${this.data.data.fontSize}px`
				: "16px";
		fontStyle =
			this.data.data.fontStyle.trim() === ""
				? "normal"
				: this.data.data.fontStyle;

		this.pens = PenArray.fromHTML(`
        <div id="text-widget-${this.id}" style="font-family: ${fontFamily} !important; color: ${color} !important; font-weight: ${fontWeight}; font-size: ${fontSize}; font-style: ${fontStyle};">
            <span>${this.data.data.textContent || "Sample Text"}</span>
        </div>
        `);

		if (!this.displayInstance && !this.editorInstance) {
			this.setPosition(this.pens.getById(`text-widget-${this.id}`));
			this.setParent(this.pens.getById(`text-widget-${this.id}`));
		} else {
		}

		// why does it return something? who knows and who will ever know
		return this.pens;
	}

	static defaultConfig(): WidgetConfig<{}> {
		return {
			WidgetRecordId: "text-widget",
			description: "display custom text",
			enabled: true,
			position: {
				x: 0,
				y: 0,
				scaleX: 0.5,
				scaleY: 0.5,
			},
			data: {
				textContent: "penguinify",
				fontWeight: "normal",
				fontFamily: "",
				fontSize: 16,
				color: "",
				fontStyle: "",
			},
		};
	}
	static getWidgetOptionsRecord(): WidgetOptionsRecord {
		return {
			textContent: new TextOption("Text Content", "The text to display"),
			fontWeight: new TextOption(
				"Font Weight",
				"The weight of the font (e.g., normal, bold, 100, 200, etc.)",
			),
			fontFamily: new TextOption(
				"Font Family",
				"The font family to use (e.g., Arial, sans-serif)",
			),
			fontSize: new TextOption("Font Size", "The size of the font in pixels"),
			color: new ColorOption(
				"Color",
				"The color of the text (CSS color value)",
			),
			fontStyle: new TextOption(
				"Font Style",
				"The style of the font (e.g., normal, italic, oblique)",
			),
		};
	}
}

function register() {
	WidgetRegistry.registerWidget("text-widget", TextWidget);
}

export default register();
export type TextData = WidgetConfig<{
	textContent: string;
	fontWeight: string;
	fontFamily: string;
	fontSize: number;
	color: string;
	fontStyle: string;
}>;
