import { WidgetRegistry } from "../../data/widgetmanager";
import { PenArray } from "../../framework/penexutils";
import {
	type UserConfig,
	Widget,
	type WidgetConfig,
	type WidgetOptionsRecord,
} from "../../types";
import { applyMixins } from "../../utils/mixins";
import { TextOptionMixin } from "../widgetmixins";
import { TextOption } from "../widgetoptions";

export class TextWidget extends Widget<WidgetConfig<TextData>> {
	render(): PenArray {
		// idk why, but typescript is being weird in this file, just ignore the errors, and all the other ones because it is not worth the time
		const config: UserConfig = this.getConfig();

		this.pens = PenArray.fromHTML(`
        <div id="text-widget-${this.id}" >
            <span>${this.data.data.textContent || "Sample Text"}</span>
        </div>
        `);

		this.applyTextOptions(this.pens.getById(`text-widget-${this.id}`), config);

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
				...TextOptionMixin.defaultOptions(),
			},
		};
	}
	static getWidgetOptionsRecord(): WidgetOptionsRecord {
		return {
			textContent: new TextOption("Text Content", "The text to display"),
			...TextOptionMixin.getWidgetOptionsRecord(),
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
	customCSS: string;
}>;

export interface TextWidget extends TextOptionMixin {}

applyMixins(TextWidget, [TextOptionMixin]);
