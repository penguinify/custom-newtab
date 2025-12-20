import {
	type Component,
	type Elements,
	Pen,
	PenArray,
} from "../../../framework/penexutils";
import type { Widget, WidgetConfig } from "../../../types";
import { WidgetEditorRenderer } from "./widgetEditorRenderer.component";

export class WidgetDisplay<T extends WidgetConfig<Object>>
	implements Component
{
	parent: Pen<Elements>;
	pens: PenArray = new PenArray();
	widget: new (
		data: T,
	) => Widget<T>;

	constructor(parent: Pen<Elements>, widget: new (data: T) => Widget<T>) {
		this.widget = widget;
		this.parent = parent;
	}

	render(): PenArray {
		//@ts-expect-error yes it does exist, dont play with me
		const widgetInstance = new this.widget(this.widget.defaultConfig());
		widgetInstance.displayInstance = true;

		this.pens = PenArray.fromHTML(`



        <div id="widget-${widgetInstance.id}" class="flex flex-col gap-4 cursor-move text-white" data-description="${this.widget.defaultConfig().description}">

            <h3 class="text-xl">${widgetInstance.data.WidgetRecordId}</h3>
            <div class="widget-content flex items-center justify-center w-full py-8 border-2 border-white rounded-lg">
                <!-- Widget content will be rendered here -->
            </div>
        </div>
        `);

		widgetInstance
			.render()[0]
			.setParent(this.pens.querySelector(".widget-content")!);

		this.pens
			.querySelector(".widget-content")
			?.element.addEventListener("click", this._createWidgetEditor.bind(this));

		this.pens.getById(`widget-${widgetInstance.id}`).setParent(this.parent);

		return this.pens;
	}

	_createWidgetEditor() {
		//@ts-expect-error yes it does exist, dont play with me
		new WidgetEditorRenderer<T>(
			Pen.fromElement(document.body),
			this.widget,
			this.widget.defaultConfig(),
		);
	}
}
