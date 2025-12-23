import { setPathInUserConfig } from "../../../data/config";
import { saveString } from "../../../data/database";
import {
	type Component,
	type Elements,
	type Pen,
	PenArray,
} from "../../../framework/penexutils";
import { Widgets } from "../../../routes/widgets";
import type {
	SettingOptions,
	Widget,
	WidgetConfig,
	fileSaveData,
} from "../../../types";
import { collides } from "../../../utils/collides";
import { generateRandomId } from "../../../utils/id";
import {
	CheckboxOption,
	ColorOption,
	FileOption,
	TextAreaOption,
	TextOption,
} from "../../widgetoptions";
import { WidgetOptionsEditor } from "./widgetOptionsEditor.component";

export const WidgetInstancesUpdateEvent = new CustomEvent(
	"widget-instances-updated",
	{
		detail: {},
	},
);

export class WidgetEditorRenderer<T extends WidgetConfig<Object>>
	implements Component
{
	parent: Pen<Elements>;
	pens: PenArray = new PenArray();
	widget: new (
		data: T,
	) => Widget<T>;
	id: string = generateRandomId();
	container: Pen<Elements>;
	scheduledDeletion: boolean = false;
	widgetInstance: Widget<T>;
	data: T;
	widgetOptionsEditorInstance: WidgetOptionsEditor | null = null;
	widgetEffectsContainer: Pen<Elements>;
	locked: boolean = false;
	static WidgetEditorInstances: WidgetEditorRenderer<any>[] = [];
	static SnapToGrid: boolean = true;
	static SnapInterval: number = 10;
	static instanceSelected: WidgetEditorRenderer<any> | null = null;

	constructor(
		parent: Pen<Elements>,
		widget: new (data: T) => Widget<T>,
		data: T,
	) {
		this.data = data;
		this.widget = widget;
		this.parent = parent;
		this.render();
	}

	render(): PenArray {
		//@ts-expect-error yes it does exist, dont play with me

		this.pens = PenArray.fromHTML(`



        <div id="widget-${this.id}" class="absolute z-5" data-description="Left click to move, Right click to scale, middle click to edit">
            <div id="widget-effects-${this.id}" class="top-0 left-0 w-full h-full absolute pointer-events-none box-border"></div>
</div>

        </div>
        `);

		this.container = this.pens.getById(`widget-${this.id}`);
		this.container.setParent(this.parent);

		this._createNewWidgetInstance();

		this.container.element.addEventListener(
			"mousedown",
			this._onDragStart.bind(this),
		);

		this.widgetEffectsContainer = this.pens.getById(
			`widget-effects-${this.id}`,
		);
		this.widgetEffectsContainer.element.style.setProperty(
			"mix-blend-mode",
			"difference",
			"important",
		);

		// topleft
		this.container.element.style.transformOrigin = "top left";
		this.container.element.addEventListener("contextmenu", (e) =>
			e.preventDefault(),
		);
		this._setPositionFromData();

		WidgetEditorRenderer.WidgetEditorInstances.push(this);

		window.dispatchEvent(WidgetInstancesUpdateEvent);
		return this.pens;
	}

	handleSelectedState(): void {
		const handleOffClick = (e: MouseEvent) => {
			if (
				e.target !== this.container.element &&
				!this.container.element.contains(e.target as Node)
			) {
				document.removeEventListener("mousedown", handleOffClick);

				this.widgetEffectsContainer.element.style.backgroundColor =
					"transparent";
				WidgetEditorRenderer.instanceSelected = null;
			}
		};
		this.widgetEffectsContainer.element.style.backgroundColor = "white";

		document.addEventListener("mousedown", handleOffClick);
	}

	_selectInstance(): void {
		if (WidgetEditorRenderer.instanceSelected === this) return;

		WidgetEditorRenderer.instanceSelected?.container.element.classList.remove(
			"border-4",
			"border-blue-500",
		);

		WidgetEditorRenderer.instanceSelected = this;
		this.handleSelectedState();
	}

	setLocked(locked: boolean): void {
		this.locked = locked;
		if (locked) {
			this.container.element.classList.add("pointer-events-none", "opacity-50");
		} else {
			this.container.element.classList.remove(
				"pointer-events-none",
				"opacity-50",
			);
		}
	}

	_generateWidgetOptionsList(): SettingOptions[] {
		// essentially just gets the name for the value, and depending on the value type, creates the appropriate SettingOptions object
		const widgetOptions: SettingOptions[] = [];

		const widgetOptionsRecords = this.widget.getWidgetOptionsRecord(); // it does fucking exist stop playing with me ts
		console.log(this.widgetInstance);
		for (const key of Object.keys(widgetOptionsRecords)) {
			const currentValue =
				widgetOptionsRecords[key as keyof typeof widgetOptionsRecords];
			console.log(
				"Generating option for key:",
				key,
				"with value:",
				currentValue,
			);
			if (currentValue instanceof TextOption) {
				widgetOptions.push(
					currentValue.intoSettingsOptions(
						this.data.data[key as string] as string,
						this.changeData.bind(this, key),
					),
				);
			} else if (currentValue instanceof ColorOption) {
				widgetOptions.push(
					currentValue.intoSettingsOptions(
						this.data.data[key as string] as string,
						this.changeData.bind(this, key),
					),
				);
			} else if (currentValue instanceof CheckboxOption) {
				widgetOptions.push(
					currentValue.intoSettingsOptions(
						this.data.data[key as string] as boolean,
						this.changeData.bind(this, key),
					),
				);
			} else if (currentValue instanceof FileOption) {
				console.log("Adding file option for key:", key);
				widgetOptions.push(
					currentValue.intoSettingsOptions(
						this.data.data[key as string] as fileSaveData,
						this._saveFileOption.bind(
							this,
							this.widgetInstance.data.ssid + "_" + key,
						),
					),
				);
			} else if (currentValue instanceof TextAreaOption) {
				widgetOptions.push(
					currentValue.intoSettingsOptions(
						this.data.data[key as string] as string,
						this.changeData.bind(this, key),
					),
				);
			}
		}

		console.log("Generated widget options:", widgetOptions);

		return widgetOptions;
	}

	_saveFileOption(key: string, value: fileSaveData) {
		console.log("Saving file option:", key, value);
		saveString(key, value.blob);
		saveString(`${key}_extension`, value.extension);
	}

	_createNewWidgetInstance() {
		this.widgetInstance = new this.widget(this.data);
		this.widgetInstance.editorInstance = true;
		this.widgetInstance.render()[0].setParent(this.container!);
	}

	changeData<V>(key: string, value: V) {
		this.data.data[key] = value;
		this.syncDataToInstances();

		this.widgetInstance.destroy();
		this._createNewWidgetInstance();
	}

	_createWidgetOptionsEditor() {
		this.widgetOptionsEditorInstance = new WidgetOptionsEditor(
			this._generateWidgetOptionsList(),
			this.data.WidgetRecordId,
			this.data.description,
		);
		this.widgetOptionsEditorInstance.render();
	}

	_openWidgetOptionsEditor() {
		if (!this.widgetOptionsEditorInstance) {
			this._createWidgetOptionsEditor();
		}
		this.widgetOptionsEditorInstance?.show();
	}

	_onDragStart(e: MouseEvent) {
		e.preventDefault();

		this._selectInstance();

		switch (e.button) {
			case 0: // Left mouse button
				this._moveDrag(e as unknown as MouseEvent);
				break;
			case 1:
				// Middle mouse button
				this._openWidgetOptionsEditor();
				break;
			case 2: // Right mouse button
				this._scaleDrag(e as unknown as MouseEvent);
				break;
		}
	}
	_setPositionFromData() {
		const previewRect = Widgets.previewDOMRect;
		if (!previewRect) return;

		// Calculate position as percentage of parent size
		const left =
			previewRect.left + (this.data.position.x / 100) * previewRect.width;
		const top =
			previewRect.top + (this.data.position.y / 100) * previewRect.height;

		// Calculate scale ratios, clamped between 0 and 1
		const widthRatio = previewRect.width / 1600;
		const heightRatio = previewRect.height / 900;
		let ratio = (widthRatio + heightRatio) / 2;
		ratio = Math.max(0, Math.min(1, ratio));
		const scaleX = this.data.position.scaleX * (0.1 + (10.0 - 0.1) * ratio);
		const scaleY = this.data.position.scaleY * (0.1 + (10.0 - 0.1) * ratio);

		// Apply styles
		this.container.element.style.position = "absolute";
		this.container.element.style.left = `${left}px`;
		this.container.element.style.top = `${top}px`;
		this.container.element.style.transformOrigin = "top left";
		this.container.element.style.transform = `scale(${scaleX.toFixed(2)}, ${scaleY.toFixed(2)})`;
	}

	_scaleDrag(e: MouseEvent) {
		let shiftY =
			(<MouseEvent>e).clientY -
			this.container.element.getBoundingClientRect().top;
		let shiftX =
			(<MouseEvent>e).clientX -
			this.container.element.getBoundingClientRect().left;
		const previewRect = Widgets.previewDOMRect;

		// console.log('[SCALE] Drag start', {
		//     shiftX,
		//     shiftY,
		//     initialScaleX,
		//     initialScaleY,
		//     previewRect,
		//     data: this.data
		// });

		const onMouseMove = (moveEvent: MouseEvent) => {
			const mouseX = moveEvent.clientX;
			const mouseY = moveEvent.clientY;

			// hypotenuse from beginning point to current point
			let deltaX =
				mouseX - (this.container.element.getBoundingClientRect().left + shiftX);
			let deltaY =
				mouseY - (this.container.element.getBoundingClientRect().top + shiftY);

			// if mouseX and mouseY are to the left or above the starting point, make distance negative
			if (
				mouseX <
				this.container.element.getBoundingClientRect().left + shiftX
			) {
				deltaX = -Math.abs(deltaX);
			}
			if (
				mouseY <
				this.container.element.getBoundingClientRect().top + shiftY
			) {
				deltaY = -Math.abs(deltaY);
			}

			// Calculate ratio based on average of currentHeight/900 and currentWidth/1600
			const widthRatio = previewRect.width / 1600;
			const heightRatio = previewRect.height / 900;
			let ratio = (widthRatio + heightRatio) / 2;

			// Clamp ratio between 0 and 1
			ratio = Math.max(0, Math.min(1, ratio));

			// Scale goes from 0.1 (0%) to 10.0 (100%)
			let newScaleX, newScaleY;
			if (moveEvent.shiftKey) {
				// Uniform scaling
				let distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
				if (
					mouseX <
					this.container.element.getBoundingClientRect().left + shiftX
				) {
					distance = -distance;
				}
				const unAdjustedScale = this.data.position.scaleX + distance / 500;
				newScaleX = newScaleY = unAdjustedScale * (0.1 + (10.0 - 0.1) * ratio);
			} else {
				// Independent scaling
				const unAdjustedScaleX = this.data.position.scaleX + deltaX / 500;
				const unAdjustedScaleY = this.data.position.scaleY + deltaY / 500;
				newScaleX = unAdjustedScaleX * (0.1 + (10.0 - 0.1) * ratio);
				newScaleY = unAdjustedScaleY * (0.1 + (10.0 - 0.1) * ratio);
			}

			if (WidgetEditorRenderer.SnapToGrid) {
				const interval = WidgetEditorRenderer.SnapInterval;
				const snapStep = interval / 100; // e.g., 10/100 = 0.1
				newScaleX = Math.round(newScaleX / snapStep) * snapStep;
				newScaleY = Math.round(newScaleY / snapStep) * snapStep;
			}

			newScaleX = parseFloat(newScaleX.toFixed(2));
			newScaleY = parseFloat(newScaleY.toFixed(2));

			console.log("[SCALE] MouseMove", {
				mouseX,
				mouseY,
				deltaX,
				deltaY,
				ratio,
				newScaleX,
				newScaleY,
				shiftKey: moveEvent.shiftKey,
				snapToGrid: WidgetEditorRenderer.SnapToGrid,
				snapInterval: WidgetEditorRenderer.SnapInterval,
				previewRect,

				data: this.data,
			});

			this.container.element.style.transform = `scale(${newScaleX}, ${newScaleY})`;
			this.container.element.setAttribute(
				"data-description",
				`scaleX: ${newScaleX}, scaleY: ${newScaleY}`,
			);

			if (moveEvent.shiftKey) {
				this.data.position = {
					...this.data.position,
					scaleX: newScaleX / (0.1 + (10.0 - 0.1) * ratio),
					scaleY: newScaleY / (0.1 + (10.0 - 0.1) * ratio),
				};
			} else {
				this.data.position = {
					...this.data.position,
					scaleX: newScaleX / (0.1 + (10.0 - 0.1) * ratio),
					scaleY: newScaleY / (0.1 + (10.0 - 0.1) * ratio),
				};
			}

			shiftX =
				moveEvent.clientX - this.container.element.getBoundingClientRect().left;
			shiftY =
				moveEvent.clientY - this.container.element.getBoundingClientRect().top;
		};

		const removeListeners = () => {
			document.removeEventListener("mousemove", onMouseMove);
			document.removeEventListener("mouseup", removeListeners);
			this.container.element.removeAttribute("data-description");
			console.log("[SCALE] Drag end", {
				data: this.data,
			});
		};

		document.addEventListener("mousemove", onMouseMove);
		document.addEventListener("mouseup", removeListeners);
	}
	_moveDrag(e: MouseEvent) {
		const shiftY =
			(<MouseEvent>e).clientY -
			this.container.element.getBoundingClientRect().top;
		const shiftX =
			(<MouseEvent>e).clientX -
			this.container.element.getBoundingClientRect().left;

		const onMouseMove = (e: MouseEvent) => {
			let left = e.pageX - shiftX;
			let top = e.pageY - shiftY;

			// Snap relative to previewDOMRect
			const previewRect = Widgets.previewDOMRect;
			if (WidgetEditorRenderer.SnapToGrid && previewRect) {
				const interval = WidgetEditorRenderer.SnapInterval;
				left =
					previewRect.left +
					Math.round((left - previewRect.left) / interval) * interval;
				top =
					previewRect.top +
					Math.round((top - previewRect.top) / interval) * interval;
			}

			this.container.element.style.left = `${left}px`;
			this.container.element.style.top = `${top}px`;

			const target = e.target as HTMLElement;
			// if the id contains router-wrapper
			if (!collides(target.getBoundingClientRect(), Widgets.previewDOMRect)) {
				this.setScheduleDeletion(true);
			} else {
				this.setScheduleDeletion(false);
			}

			this.container.element.setAttribute(
				"data-description",
				`x: ${left - previewRect.left}, y: ${top - previewRect.top}`,
			);

			this.data.position = {
				x: previewRect
					? ((left - previewRect.left) / previewRect.width) * 100
					: 0,
				y: previewRect
					? ((top - previewRect.top) / previewRect.height) * 100
					: 0,
				scaleX: this.data.position.scaleX,
				scaleY: this.data.position.scaleY,
			};
		};

		const removeListeners = () => {
			document.removeEventListener("mousemove", onMouseMove);
			document.removeEventListener("mouseup", removeListeners);

			if (this.scheduledDeletion) {
				this.destroy();
			}

			this.container.element.removeAttribute("data-description");
		};

		document.addEventListener("mousemove", onMouseMove);
		document.addEventListener("mouseup", removeListeners);
	}

	setScheduleDeletion(scheduled: boolean): void {
		this.scheduledDeletion = scheduled;
		this.container.element.style.opacity = scheduled ? "0.5" : "1";
	}

	destroy(): void {
		this.container.element.remove();
		WidgetEditorRenderer.WidgetEditorInstances =
			WidgetEditorRenderer.WidgetEditorInstances.filter(
				(instance) => instance !== this,
			);

		window.dispatchEvent(WidgetInstancesUpdateEvent);
	}

	syncDataToInstances(): void {
		for (const instance of WidgetEditorRenderer.WidgetEditorInstances) {
			if (instance.id === this.id) {
				instance.data = this.data;
			}
		}
	}

	static destroyAll(): void {
		for (const instance of WidgetEditorRenderer.WidgetEditorInstances) {
			instance.destroy();
		}
		WidgetEditorRenderer.WidgetEditorInstances = [];
	}

	static toWidgetConfigs(): WidgetConfig<Object>[] {
		const configs: WidgetConfig<Object>[] = [];
		for (const instance of WidgetEditorRenderer.WidgetEditorInstances) {
			configs.push(instance.data);
		}
		return configs;
	}

	static saveAllToOptions(): void {
		for (const instance of WidgetEditorRenderer.WidgetEditorInstances) {
			instance.syncDataToInstances();
		}
		const configs = WidgetEditorRenderer.toWidgetConfigs();
		setPathInUserConfig(["widgets"], configs);
	}

	static reloadAllFromInstances(): void {
		// basically unappends and reappends all widget instances based on their order in WidgetEditorInstances
		for (const instance of WidgetEditorRenderer.WidgetEditorInstances) {
			instance.container.element.remove();
		}
		for (const instance of WidgetEditorRenderer.WidgetEditorInstances) {
			instance.container.setParent(instance.parent);
		}
	}
}
