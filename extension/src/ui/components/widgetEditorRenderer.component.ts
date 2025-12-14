import { Component, Elements, Pen, PenArray } from "../../framework/penexutils";

import { Widget, WidgetConfig } from "../../types";
import { collides, generateRandomId } from "../../utils";
import { WidgetRegistry } from "../../widgetmanager";
import { Options } from "../../routes/options";
import { Widgets } from "../../routes/widgets";
import { setPathInUserConfig } from "../../config";

export class WidgetEditorRenderer<T extends WidgetConfig<Object>> implements Component {
    parent: Pen<Elements>;
    pens: PenArray = new PenArray();
    widget: new (data: T) => Widget<T>;
    id: string = generateRandomId();
    container: Pen<Elements>;
    scheduledDeletion: boolean = false;
    data: T;
    static WidgetEditorInstances: WidgetEditorRenderer<any>[] = [];
    static SnapToGrid: boolean = true;
    static SnapInterval: number = 10;

    constructor(parent: Pen<Elements>, widget: new (data: T) => Widget<T>, data: T) {
        this.data = data;
        this.widget = widget;
        this.parent = parent;
        this.render();
        console.log(WidgetEditorRenderer.WidgetEditorInstances);
    }

    render(): PenArray {

        //@ts-ignore yes it does exist, dont play with me
        let widgetInstance = new this.widget(this.data);
        widgetInstance.editorInstance = true;

        this.pens = PenArray.fromHTML(`



        <div id="widget-${this.id}" class="absolute z-5" data-description="Left click to move, Right click to scale, middle click to edit">

            <div class="widget-content flex items-center justify-center w-full select-none">
                <!-- Widget content will be rendered here -->
            </div>
        </div>
        `);

        widgetInstance.render()[0].setParent(this.pens.querySelector('.widget-content')!);


        console.log(this)

        this.container = this.pens.getById(`widget-${this.id}`);
        this.container.setParent(this.parent);

        this.container.element.addEventListener('mousedown', this._onDragStart.bind(this));
        // topleft
        this.container.element.style.transformOrigin = 'top left';
        this.container.element.addEventListener('contextmenu', (e) => e.preventDefault());
        this._setPositionFromData();


        WidgetEditorRenderer.WidgetEditorInstances.push(this);

        return this.pens;
    }


    _onDragStart(e: DragEvent) {
        e.preventDefault();
        switch (e.button) {
            case 0: // Left mouse button
                this._moveDrag(e as unknown as MouseEvent);
                break;
            case 2: // Right mouse button
                this._scaleDrag(e as unknown as MouseEvent);
                break;
            default:
                break;
        }

    }

    _setPositionFromData() {
        const previewRect = Widgets.previewDOMRect;
        if (!previewRect) return;

        const left = previewRect.left + (this.data.position.x / 100) * previewRect.width;
        const top = previewRect.top + (this.data.position.y / 100) * previewRect.height;
        this.container.element.style.left = left + 'px';
        this.container.element.style.top = top + 'px';
        // Calculate scale based on ratio of average of previewRect.width/1600 and previewRect.height/900
        const widthRatio = previewRect.width / 1600;
        const heightRatio = previewRect.height / 900;
        let ratio = (widthRatio + heightRatio) / 2;
        let scale = this.data.position.scale * (0.1 + (10.0 - 0.1) * ratio);
        this.container.element.style.transform = `scale(${scale.toFixed(2)})`;
    }

    _scaleDrag(e: MouseEvent) {
        let shiftY = (<MouseEvent>e).clientY - this.container.element.getBoundingClientRect().top
        let shiftX = (<MouseEvent>e).clientX - this.container.element.getBoundingClientRect().left
        const previewRect = Widgets.previewDOMRect;



        const onMouseMove = (moveEvent: MouseEvent) => {
            let mouseX = moveEvent.pageX;
            let mouseY = moveEvent.pageY;

            // hypotenuse from beginning point to current point
            let deltaX = mouseX - (this.container.element.getBoundingClientRect().left + shiftX);
            let deltaY = mouseY - (this.container.element.getBoundingClientRect().top + shiftY);
            let distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            // if mouseX and mouseY are to the left or above the starting point, make distance negative
            if (mouseX < this.container.element.getBoundingClientRect().left + shiftX) {
                distance = -distance;
            }


            // logarithmic scale adjustment, so as distance decreases, the scale changes less
            let unAdjustedScale = this.data.position.scale + (distance / 500); // 300 is an arbitrary value to control sensitivity



            // Calculate ratio based on average of currentHeight/900 and currentWidth/1600
            const widthRatio = previewRect.width / 1600;
            const heightRatio = previewRect.height / 900;
            let ratio = (widthRatio + heightRatio) / 2;

            // Clamp ratio between 0 and 1
            ratio = Math.max(0, Math.min(1, ratio));

            // Scale goes from 0.1 (0%) to 10.0 (100%)
            let newScale = unAdjustedScale * (0.1 + (10.0 - 0.1) * ratio);

            if (WidgetEditorRenderer.SnapToGrid) {
                const interval = WidgetEditorRenderer.SnapInterval;
                const snapStep = interval / 100; // e.g., 10/100 = 0.1
                newScale = Math.round(newScale / snapStep) * snapStep;
            }

            newScale = parseFloat(newScale.toFixed(2)); // Limit to 2 decimal places
            this.container.element.style.transform = `scale(${newScale})`;
            this.container.element.setAttribute('data-description', `scale: ${newScale}`);

            this.data.position = {
                ...this.data.position,
                scale: unAdjustedScale
            }

            shiftX = moveEvent.clientX - this.container.element.getBoundingClientRect().left;
            shiftY = moveEvent.clientY - this.container.element.getBoundingClientRect().top;
        };

        const removeListeners = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', removeListeners);
            this.container.element.removeAttribute('data-description');
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', removeListeners);
    }
    _moveDrag(e: MouseEvent) {
        let shiftY = (<MouseEvent>e).clientY - this.container.element.getBoundingClientRect().top
        let shiftX = (<MouseEvent>e).clientX - this.container.element.getBoundingClientRect().left

        const onMouseMove = (e: MouseEvent) => {
            let left = e.pageX - shiftX;
            let top = e.pageY - shiftY;

            // Snap relative to previewDOMRect
            const previewRect = Widgets.previewDOMRect;
            if (WidgetEditorRenderer.SnapToGrid && previewRect) {
                const interval = WidgetEditorRenderer.SnapInterval;
                left = previewRect.left + Math.round((left - previewRect.left) / interval) * interval;
                top = previewRect.top + Math.round((top - previewRect.top) / interval) * interval;
            }

            this.container.element.style.left = left + 'px';
            this.container.element.style.top = top + 'px';

            let target = e.target as HTMLElement;
            // if the id contains router-wrapper
            if (!collides(target.getBoundingClientRect(), Widgets.previewDOMRect)) {
                this.setScheduleDeletion(true);
            } else {
                this.setScheduleDeletion(false);
            }

            this.container.element.setAttribute('data-description', 'x: ' + (left - previewRect.left) + ', y: ' + (top - previewRect.top));

            this.data.position = {
                x: previewRect ? ((left - previewRect.left) / previewRect.width) * 100 : 0,
                y: previewRect ? ((top - previewRect.top) / previewRect.height) * 100 : 0,
                scale: this.data.position.scale
            };

            console.log(this.data.position);
        };

        const removeListeners = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', removeListeners);

            if (this.scheduledDeletion) {
                this.destroy();
            }

            this.container.element.removeAttribute('data-description');
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', removeListeners);
    }

    setScheduleDeletion(scheduled: boolean): void {
        this.scheduledDeletion = scheduled;
        this.container.element.style.opacity = scheduled ? '0.5' : '1';
    }

    destroy(): void {
        this.container.element.remove();
        WidgetEditorRenderer.WidgetEditorInstances = WidgetEditorRenderer.WidgetEditorInstances.filter(instance => instance !== this);
    }

    syncDataToInstances(): void {
        for (let instance of WidgetEditorRenderer.WidgetEditorInstances) {
            if (instance.id === this.id) {
                instance.data = this.data;
            }
        }
    }

    static destroyAll(): void {
        for (let instance of WidgetEditorRenderer.WidgetEditorInstances) {
            instance.destroy();
        }
        WidgetEditorRenderer.WidgetEditorInstances = [];
    }

    static toWidgetConfigs(): WidgetConfig<Object>[] {
        let configs: WidgetConfig<Object>[] = [];
        for (let instance of WidgetEditorRenderer.WidgetEditorInstances) {
            configs.push(instance.data);
        }
        return configs;
    }

    static saveAllToOptions(): void {
        for (let instance of WidgetEditorRenderer.WidgetEditorInstances) {
            instance.syncDataToInstances();
        }
        let configs = WidgetEditorRenderer.toWidgetConfigs();
        setPathInUserConfig(['widgets'], configs);

    }


}
