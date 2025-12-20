import { convertArrayBufferToBase64, saveString } from "../../../data/database";
import {
	type Component,
	type Elements,
	type Pen,
	PenArray,
} from "../../../framework/penexutils";
import type { SettingOptions } from "../../../types";
import { generateRandomId } from "../../../utils/id";

export class FileInput implements Component {
	pens: PenArray = new PenArray();
	parent: Pen<Elements>;
	settings: SettingOptions;
	private value: string = "";
	private fileValue: string = "";
	private fileExtension: string = "";
	id: string = generateRandomId();

	constructor(parent: Pen<Elements>, options: SettingOptions) {
		this.parent = parent;
		if (options.type !== "file") {
			throw new Error("Invalid option type for FileInput component");
		} else {
			this.settings = options;
		}
	}

	render(): PenArray {
		const container = PenArray.fromHTML(`
            <div id="${this.id}-file-input" class="file-input flex flex-col" data-description="${this.settings.description || ""}">
                <label for="${this.id}-input" class=" flex gap-2 py-2 items-center justify-evenely w-max">
                    <p class="text-lg">${this.settings.label}</p>
                </label>
                <input type="file" id="${this.id}-input" class="rounded-md border-2 border-white px-2 py-1 bg-transparent  focus:outline-hidden">
            </div>
        `);
		container[0].setParent(this.parent);

		const fileInput = container.getById(`${this.id}-input`);
		fileInput.element.addEventListener("change", this._onFileChange.bind(this));

		this.pens.push(...container);

		this.value = (this.settings.defaultValue as string) || "";

		return this.pens;
	}

	private _onFileChange(event: Event): void {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			this.fileExtension = input.files?.[0].name.split(".").pop() || "";
			const reader = new FileReader();
			reader.onload = () => {
				this.fileValue = convertArrayBufferToBase64(
					reader.result as ArrayBuffer,
				);
				this._saveFile();
			};
			reader.readAsArrayBuffer(input.files[0]);
		}
	}

	private _saveFile(): void {
		saveString(this.settings.path[0], this.fileValue);
		saveString(`${this.settings.path[0]}_extension`, this.fileExtension);
	}

	getValue(): string {
		return this.value;
	}
	setValue(newValue: string): void {
		this.value = newValue;
	}
}
