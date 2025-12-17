import { setPathInUserConfig } from "../../../data/config";
import { Component, Elements, Pen, PenArray } from "../../../framework/penexutils";
import { SettingOptions } from "../../../types";
import { generateRandomId } from "../../../utils";

export class CheckboxInput implements Component {
    pens: PenArray = new PenArray();
    parent: Pen<Elements>;
    settings: SettingOptions;
    private value: boolean = false;
    id: string = generateRandomId();


    constructor(parent: Pen<Elements>, options: SettingOptions) {
        this.parent = parent;
        if (options.type !== 'checkbox') {
            throw new Error('Invalid option type for CheckboxInput component');
        } else {
            this.settings = options;
        }
    }



    render(): PenArray {
        let container = PenArray.fromHTML(`
            <div id="${this.id}-checkbox-input" class="flex flex-col" data-description="${this.settings.description || ''}">
                <label for="${this.id}-input" class="flex gap-2 py-2 items-center justify-evenly w-max"
                    style="cursor:pointer;">
                    <input type="checkbox" id="${this.id}-input" class="appearance-none w-6 h-6 rounded-md border-2 border-white checked:bg-white checked:border-white focus:outline-none transition-colors duration-150" ${this.settings.defaultValue ? 'checked' : ''}>
                    <span class="text-lg ">${this.settings.label}</span>
                </label>
            </div>
        `);
        container[0].setParent(this.parent);

        let checkboxInput = container.getById(`${this.id}-input`);
        checkboxInput.element.addEventListener('change', this._onCheckboxChange.bind(this));
        checkboxInput.element.addEventListener('change', (e: Event) => {
            this.settings.onChange(e.target ? (e.target as HTMLInputElement).checked : false);
        });

        this.pens.push(...container);

        this.value = !!this.settings.defaultValue;

        return this.pens;
    }



    private _onCheckboxChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.value = input.checked;
    }


    getValue(): boolean {
        return this.value;
    }
    setValue(newValue: boolean): void {
        this.value = newValue;

    }
}
