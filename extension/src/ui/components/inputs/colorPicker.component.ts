import {
	type Component,
	type Elements,
	type Pen,
	PenArray,
} from "../../../framework/penexutils";
import type { SettingOptions } from "../../../types";
import { generateRandomId } from "../../../utils/id";

export class ColorPicker implements Component {
	pens: PenArray = new PenArray();
	parent: Pen<Elements>;
	settings: SettingOptions;
	private value: string = "";
	id: string = generateRandomId();

	constructor(parent: Pen<Elements>, options: SettingOptions) {
		this.parent = parent;
		if (options.type !== "colorpicker") {
			throw new Error("Invalid option type for ColorPicker component");
		} else {
			this.settings = options;
		}
	}

	render(): PenArray {
		const container = PenArray.fromHTML(`
            <div id="${this.id}-color-picker" class="color-picker flex flex-col" data-description="${this.settings.description || ""}">
                <label for="${this.id}-input" class=" flex gap-2 py-2 items-center justify-evenely w-max">
<div id="${this.id}-boxdisplay" class="h-6 aspect-square rounded-md border-2 border-white"></div>
<p class="text-lg">${this.settings.label}</p>
</label>
                <input type="color" id="${this.id}-input" class="opacity-0 h-0" value="${this.settings.defaultValue || "#ffffff"}">
            </div>
        `);
		container[0].setParent(this.parent);

		const colorInput = container.getById(`${this.id}-input`);
		colorInput.element.addEventListener(
			"input",
			this._onColorChange.bind(this),
		);
		colorInput.element.addEventListener("input", (e: Event) => {
			this.settings.onChange(
				e.target ? (e.target as HTMLInputElement).value : "",
			);
		});

		const label = container
			.getById(`${this.id}-color-picker`)
			.asPenArray()
			.querySelector("label");
		const input = container.getById(`${this.id}-input`);
		if (label) {
			input.element.addEventListener("focus", () => {
				label?.element.classList.add("font-bold");
			});
			input.element.addEventListener("blur", () => {
				label?.element.classList.remove("font-bold");
			});
		}

		this.pens.push(...container);

		this.value = this.settings.defaultValue || "#ffffff";

		window.addEventListener("load", () => {
			this._updateColorDisplay(this.value);
		});

		return this.pens;
	}

	private _onColorChange(event: Event): void {
		const input = event.target as HTMLInputElement;
		this.value = input.value;
		this._updateColorDisplay(this.value);
	}

	private _updateColorDisplay(color: string): void {
		const boxDisplay = this.pens.getById(`${this.id}-boxdisplay`);
		if (!boxDisplay) {
			console.error("Box display element not found");
			return;
		}
		boxDisplay.element.style.backgroundColor = color;
	}

	getValue(): string {
		return this.value;
	}
	setValue(newValue: string): void {
		this.value = newValue;
	}
}
