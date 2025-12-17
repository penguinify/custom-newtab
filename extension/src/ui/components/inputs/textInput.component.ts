import { setPathInUserConfig } from "../../../data/config";
import { Component, Elements, Pen, PenArray } from "../../../framework/penexutils";
import { SettingOptions } from "../../../types";
import { generateRandomId } from "../../../utils";


export class TextInput implements Component {
    pens: PenArray = new PenArray();
    parent: Pen<Elements>;
    settings: SettingOptions;
    private value: string = '';
    id: string = generateRandomId();

    constructor(parent: Pen<Elements>, options: SettingOptions) {
        this.parent = parent;
        if (options.type !== 'text') {
            throw new Error('Invalid option type for TextInput component');
        } else {
            this.settings = options;
        }
    }

    render(): PenArray {


        let container = PenArray.fromHTML(`
            <div id="${this.id}-text-input" class="text-input flex flex-col" data-description="${this.settings.description || ''}">
                <label for="${this.id}-input" class=" flex gap-2 py-2 items-center justify-evenely w-max">
                    <p class="text-lg">${this.settings.label}</p>
                </label>
                <input type="text" id="${this.id}-input" class="rounded-md border-2 border-white px-2 py-1 bg-transparent  focus:outline-hidden" value="${this.settings.defaultValue || ''}">
            </div>
        `);
        container[0].setParent(this.parent);

        let textInput = container.getById(`${this.id}-input`);
        textInput.element.addEventListener('input', this._onTextChange.bind(this));
        textInput.element.addEventListener('input', (e: Event) => {
            this.settings.onChange(e.target ? (e.target as HTMLInputElement).value : '');
        });

        this.pens.push(...container);

        this.value = this.settings.defaultValue || '';

        return this.pens;
    }

    private _onTextChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.value = input.value;
    }



    getValue(): string {
        return this.value;
    }
    setValue(newValue: string): void {
        this.value = newValue;
    }
}
