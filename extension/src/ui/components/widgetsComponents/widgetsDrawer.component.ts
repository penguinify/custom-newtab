import { WidgetRegistry } from "../../../data/widgetmanager";
import {
	type Component,
	type Elements,
	type Pen,
	PenArray,
} from "../../../framework/penexutils";
import type { SettingOptions, Widget } from "../../../types";
import { ButtonInput } from "../inputs/buttonInput.component";
import { CheckboxInput } from "../inputs/checkboxInput.component";
import { TextInput } from "../inputs/textInput.component";
import { WidgetDisplay } from "./widgetDisplay.component";
import { WidgetEditorRenderer } from "./widgetEditorRenderer.component";

export class WidgetsDrawer implements Component {
	pens: PenArray = new PenArray();
	widgetDrawerPen!: Pen<Elements>;
	widgetListPen!: Pen<Elements>;
	widgetSaveButton!: ButtonInput;

	render(): PenArray {
		this.pens = PenArray.fromHTML(`
        <div id="widgets-drawer" class="absolute left-0 top-0 h-full w-1/4 bg-black p-8 border-r-2 border-white overflow-y-auto z-50 text-white">
            <h2 class="text-2xl mb-5">Your Widgets</h2>
            <div class="flex flex-col space-y-2 mt-4" id="widget-list">
</div>
        </div>
e       `);

		this.widgetDrawerPen = this.pens.getById("widgets-drawer");
		this.widgetListPen = this.pens.getById("widget-list");
		this.refreshWigets();

		this.widgetSaveButton = new ButtonInput(this.widgetDrawerPen, {
			type: "button",
			description: "Save your current widget configuration",
			label: "Save Widgets",
			onClick: this.saveWidgets.bind(this),
		} as SettingOptions);

		const snappingCheckbox = new CheckboxInput(this.widgetDrawerPen, {
			type: "checkbox",
			label: "Enable grid snapping",
			description: "this affects scaling and positioning of widgets",
			defaultValue: true,
			onChange: (value: boolean) => {
				WidgetEditorRenderer.SnapToGrid = value;
			},
		} as SettingOptions);

		const snappingValue = new TextInput(this.widgetDrawerPen, {
			type: "text",
			label: "Grid size",
			description: "Size of the grid for snapping (in pixels)",
			defaultValue: "10",
			onChange: (value: string) => {
				const intValue = parseInt(value, 10);
				if (!Number.isNaN(intValue) && intValue > 0) {
					WidgetEditorRenderer.SnapInterval = intValue;
				}
			},
		} as SettingOptions);

		this.widgetSaveButton.render();
		snappingCheckbox.render();
		snappingValue.render();
		this.widgetSaveButton.pens[0].setParent(this.widgetDrawerPen, 1);

		snappingValue.pens[0].setParent(this.widgetDrawerPen, 1);
		snappingCheckbox.pens[0].setParent(this.widgetDrawerPen, 1);
		snappingValue.pens[0].element.style.marginBottom = "32px";

		return this.pens;
	}

	refreshWigets() {
		for (const widgetClass of WidgetRegistry) {
			if (typeof widgetClass[1] !== "function") continue;
			this.addWidget(widgetClass[1]);
		}
	}

	addWidget(widget: new (data: any) => Widget<any>) {
		const widgetDisplay = new WidgetDisplay(this.widgetListPen, widget);
		widgetDisplay.render();
	}

	saveWidgets() {
		WidgetEditorRenderer.saveAllToOptions();
	}
}
