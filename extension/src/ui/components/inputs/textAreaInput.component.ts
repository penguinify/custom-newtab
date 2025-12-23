import {
	type Component,
	type Elements,
	type Pen,
	PenArray,
} from "../../../framework/penexutils";
import type { SettingOptions } from "../../../types";
import { generateRandomId } from "../../../utils/id";

export class TextAreaInput implements Component {
	pens: PenArray = new PenArray();
	parent: Pen<Elements>;
	settings: SettingOptions;
	private value: string = "";
	id: string = generateRandomId();

	constructor(parent: Pen<Elements>, options: SettingOptions) {
		this.parent = parent;
		if (options.type !== "textarea") {
			throw new Error("Invalid option type for TextAreaInput component: " + options.type);
		} else {
			this.settings = options;
		}
	}

	render(): PenArray {
		const container = PenArray.fromHTML(`
            <div id="${this.id}-textarea-input" class="textarea-input flex flex-col" data-description="${this.settings.description || ""}">
                <label for="${this.id}-input" class="flex gap-2 py-2 items-center justify-evenely w-max">
                    <p class="text-lg">${this.settings.label}</p>
                </label>
                <textarea id="${this.id}-input" class="rounded-md border-2 border-white px-2 py-1 bg-transparent focus:outline-hidden resize-vertical min-h-24" rows="4">${this.settings.type === "textarea" ? this.settings.defaultValue || "" : ""}</textarea>
            </div>
        `);
		container[0].setParent(this.parent);

		const textAreaInput = container.getById(`${this.id}-input`);
		textAreaInput.element.addEventListener(
			"input",
			this._onTextChange.bind(this),
		);
		textAreaInput.element.addEventListener("input", (e: Event) => {
			if (this.settings.type === "textarea") {
				this.settings.onChange(
					e.target ? (e.target as HTMLTextAreaElement).value : "",
				);
			}
		});

		this.pens.push(...container);

		this.value =
			this.settings.type === "textarea" ? this.settings.defaultValue || "" : "";

		return this.pens;
	}

	private _onTextChange(event: Event): void {
		const input = event.target as HTMLTextAreaElement;
		this.value = input.value;
	}

	getValue(): string {
		return this.value;
	}

	setValue(newValue: string): void {
		this.value = newValue;
		const textAreaInput = this.pens.getById(`${this.id}-input`);
		if (textAreaInput && textAreaInput.element) {
			(textAreaInput.element as HTMLTextAreaElement).value = newValue;
		}
	}
}
