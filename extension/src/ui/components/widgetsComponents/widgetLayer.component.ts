// like a layer editor for the widgets, i thought this would be cooler than just a z-index number and right clicking to bring it forward.
// i always hated that in other apps like I want to be able to see the widgets stacked and move them around visually

// really the main purpose of this is to change the render order of the widgets.

import { Component, Elements, Pen, PenArray } from "../../../framework/penexutils";
import { WidgetEditorRenderer } from "./widgetEditorRenderer.component";

export class WidgetLayer implements Component {
    pens: PenArray = new PenArray();
    widgetLayerEditor!: Pen<Elements>;

    constructor() {
    }

    render(): PenArray {
        this.pens = PenArray.fromHTML(`
            <div id="widget-layer-editor" class="
widget-layer w-3/4 h-1/4 flex flex-row items-center bottom-0 right-0 border-t-2 border-white absolute bg-black p-4 overflow-x-auto overflow-y-hidden">

            </div>
        `);
        this.widgetLayerEditor = this.pens.getById("widget-layer-editor");
        this.renderWidgets();

        window.addEventListener("widget-instances-updated", this.renderWidgets.bind(this));
        return this.pens;
    }


    private renderWidgets() {
        console.log("Rendering widgets in layer editor");
        // emptpy the layer first
        this.widgetLayerEditor.element.innerHTML = "";
        for (let i = WidgetEditorRenderer.WidgetEditorInstances.length - 1; i >= 0; i--) {
            const widgetInstance = WidgetEditorRenderer.WidgetEditorInstances[i];
            this.renderWidget(widgetInstance);
        }
    }

    private renderWidget(widgetInstance: WidgetEditorRenderer<any>) {
        let widgetPen = PenArray.fromHTML(`
            <div id="widget-layer-${widgetInstance.id}" class="widget-layer-item border-2 h-full aspect-square border-white rounded-md p-2 m-2 cursor-move">

<div class="w-full flex flex-row justify-between items-center">
<button id="widget-layer-editor-right" class="text-3xl rounded-md mb-2 cursor-pointer text-white"><span>⇐</span><span class="text-sm">left</span></button>

<button id="widget-layer-editor-left" class="text-3xl rounded-md mb-2 text-white cursor-pointer"><span class="text-sm">right</span><span>➫</span></button>
</div>
                <h4 class="text-lg text-white">${widgetInstance.data.WidgetRecordId}</h4>
            </div>
        `);
        widgetPen[0].setParent(this.widgetLayerEditor);
        widgetPen[0].element.addEventListener("click", this.clickHandler.bind(this, widgetInstance));

        const leftButton = widgetPen.getById(`widget-layer-editor-left`);
        const rightButton = widgetPen.getById(`widget-layer-editor-right`);


        leftButton.element.addEventListener("click", (event) => {
            event.stopPropagation();
            this.moveWidgetInstance(widgetInstance, "left");
        });
        rightButton.element.addEventListener("click", (event) => {
            event.stopPropagation();
            this.moveWidgetInstance(widgetInstance, "right");
        });


    }

    private moveWidgetInstance(widgetInstance: WidgetEditorRenderer<any>, direction: "left" | "right") {
        const instances = WidgetEditorRenderer.WidgetEditorInstances;
        const index = instances.indexOf(widgetInstance);
        if (index === -1) return;

        let newIndex = direction === "left" ? index - 1 : index + 1;

        if (newIndex >= instances.length || newIndex < 0) {
            console.log('wallahi you  lost me :0')
            return;
        }

        newIndex = Math.max(0, Math.min(instances.length - 1, newIndex));

        // Swap the instances
        [instances[index], instances[newIndex]] = [instances[newIndex], instances[index]];


        // Notify other components about the change
        window.dispatchEvent(new Event("widget-instances-updated"));
        WidgetEditorRenderer.reloadAllFromInstances()
    }

    private clickHandler(WidgetEditorInstance: WidgetEditorRenderer<any>, event: MouseEvent) {

        event.stopPropagation();
        WidgetEditorInstance._selectInstance()
    }
}
