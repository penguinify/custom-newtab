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

export class ShapeWidget extends Widget<WidgetConfig<ShapeData>> {
	render(): PenArray {
		const data = this.data.data;
		const numberOfSides = Math.max(3, Number(data.numberOfSides ?? 3) || 3);
		const angleStep = (Math.PI * 2) / numberOfSides;
		const startAngle = -Math.PI / 2;
		const radius = 40;
		const centerX = 50;
		const centerY = 50;

		const points = Array.from({ length: numberOfSides }, (_, index) => {
			const angle = startAngle + index * angleStep;
			const x = Math.cos(angle) * radius;
			const y = Math.sin(angle) * radius;
			return `${x + centerX},${y + centerY}`;
		}).join(" ");

		const backgroundColor = data.backgroundColor ?? "lightgray";
		const outlineColor = data.outlineColor ?? "black";
		const outlineWidth = data.outlineWidth ?? 1;

		this.pens = PenArray.fromHTML(`
        <div id="shape-widget-${this.id}" style="transform-origin: top left; ">

            <svg height="100%" width="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" id="shape-svg-${this.id}">
                <polygon id="shape-polygon-${this.id}" points="${points}" fill="${backgroundColor}" stroke="${outlineColor}" stroke-width="${outlineWidth}"/>
            </svg>

        </div>
        `);

		if (!this.displayInstance && !this.editorInstance) {
			const root = this.pens.getById(`shape-widget-${this.id}`);
			this.setPosition(root);
			this.setParent(root);
		}

		this.applyRotationOptions(
			this.pens.getById(`shape-widget-${this.id}`),
			this.data,
		);
		return this.pens;
	}

	static defaultConfig(): WidgetConfig<ShapeData> {
		return {
			WidgetRecordId: "shape-widget",
			description: "cool shape",
			enabled: true,
			position: {
				x: 0,
				y: 0,
				scaleX: 0.1,
				scaleY: 0.1,
			},
			data: {
				numberOfSides: 3,
				...BackgroundOptionMixin.defaultOptions(),
				...OutlineOptionMixin.defaultOptions(),
				...RotationOptionMixin.defaultOptions(),
			},
		};
	}

	static getWidgetOptionsRecord(): WidgetOptionsRecord {
		return {
			numberOfSides: new TextOption(
				"Number of Sides",
				"The number of sides for the shape (e.g., 3 for triangle, 4 for square)",
			),
			...BackgroundOptionMixin.getWidgetOptionsRecord(),
			...OutlineOptionMixin.getWidgetOptionsRecord(),
			...RotationOptionMixin.getWidgetOptionsRecord(),
		};
	}
}

function register() {
	WidgetRegistry.registerWidget("shape-widget", ShapeWidget);
}
export default register();

export type ShapeData = {
	numberOfSides: number;
	backgroundColor: string;
	outlineColor: string;
	rotation: number;
	outlineWidth: number;
	[key: string]: unknown;
};

applyMixins(ShapeWidget, [
	BackgroundOptionMixin,
	OutlineOptionMixin,
	RotationOptionMixin,
]);
