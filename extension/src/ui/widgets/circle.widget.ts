import { WidgetRegistry } from "../../data/widgetmanager";
import { PenArray } from "../../framework/penexutils";
import {
	type UserConfig,
	Widget,
	type WidgetConfig,
	type WidgetOptionsRecord,
} from "../../types";
import { applyMixins } from "../../utils/mixins";
import {
	BackgroundOptionMixin,
	OutlineOptionMixin,
	RotationOptionMixin,
	TextOptionMixin,
} from "../widgetmixins";
import { CheckboxOption, TextOption } from "../widgetoptions";

export class CircleWidget extends Widget<WidgetConfig<CircleData>> {
	render(): PenArray {

		this.pens = PenArray.fromHTML(`
        <div id="circle-widget-${this.id}" style="border-radius: ${this.data.data.borderRadius}; box-sizing: border-box; transform-origin: top left; width: ${this.data.data.width}; height: ${this.data.data.height};">


        </div>
        `);

        const root = this.pens.getById(`circle-widget-${this.id}`);

        this.applyOutlineOptions(root, this.getConfig());
        this.applyBackgroundOptions(root, this.getConfig());

		if (!this.displayInstance && !this.editorInstance) {
			this.setPosition(root);
			this.setParent(root);
		}

		return this.pens;
	}

	static defaultConfig(): WidgetConfig<CircleData> {
		return {
			WidgetRecordId: "circle-widget",
			description: "circle!",
			enabled: true,
			position: {
				x: 0,
				y: 0,
				scaleX: 0.2,
				scaleY: 0.2,
			},
			data: {
                borderRadius: "50%",
                width: "100px",
                height: "100px",
				...BackgroundOptionMixin.defaultOptions(),
				...OutlineOptionMixin.defaultOptions(),
			},
		};
	}

	static getWidgetOptionsRecord(): WidgetOptionsRecord {
		return {
            borderRadius: new TextOption(
                "Border Radius",
                "The border radius of the circle (e.g., 50% for a perfect circle), BUT it can be changed to make a rounded rectangle",
            ),
            width: new TextOption(
                "Width",
                "The width of the circle widget.",
            ),
            height: new TextOption(
                "Height",
                "The height of the circle widget.",
            ),
			...BackgroundOptionMixin.getWidgetOptionsRecord(),
			...OutlineOptionMixin.getWidgetOptionsRecord(),
		};
	}
}

function register() {
	WidgetRegistry.registerWidget("circle-widget", CircleWidget);
}
export default register();

export type CircleData = {
	backgroundColor: string;
    borderRadius: string;
	outlineColor: string;
    width: string;
    height: string;
	outlineWidth: number;
	[key: string]: unknown;
};

applyMixins(CircleWidget, [
	BackgroundOptionMixin,
	OutlineOptionMixin,
]);
