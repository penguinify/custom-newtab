import { setPathInUserConfig } from "../../../data/config";
import { Component, Elements, Pen, PenArray } from "../../../framework/penexutils";
import { SettingOptions } from "../../../types";
import { generateRandomId } from "../../../utils/id";
import { ButtonInput } from "./buttonInput.component";
import { CheckboxInput } from "./checkboxInput.component";
import { ColorPicker } from "./colorPicker.component";
import { FileInput } from "./fileInput.component";
import { TextInput } from "./textInput.component";

type ComponentConstructor = new (parent: Pen<Elements>, options: SettingOptions) => Component;

const componentMap: Record<string, ComponentConstructor> = {
    colorpicker: ColorPicker,
    text: TextInput,
    file: FileInput,
    checkbox: CheckboxInput,
    button: ButtonInput
    // Add other component mappings here as needed
};

export class DropdownWithSubcomponents implements Component {
    pens: PenArray = new PenArray();
    parent: Pen<Elements>;
    settings: SettingOptions;
    private value: string = '';
    id: string = generateRandomId();
    private subcomponents: Record<string, Component[]> = {};

    constructor(parent: Pen<Elements>, options: SettingOptions) {
        this.parent = parent;
        if (options.type !== 'dropdown') {
            throw new Error('Invalid option type for DropdownWithSubcomponents component');
        } else {
            this.settings = options;
        }
    }

    render(): PenArray {
        if (this.settings.type !== 'dropdown' || !this.settings.options || this.settings.options.length === 0) {
            throw new Error('Invalid settings for DropdownWithSubcomponents component');
        }

        let container = PenArray.fromHTML(`
            <div id="dropdown-${this.id}" class="flex flex-col h-full h-min gap-2" data-description="${this.settings.description || ''}">
                <label for="${this.id}-select" class=" flex gap-2 py-2 items-center">
                    <p class="text-lg">${this.settings.label}</p>
                </label>
                <select id="${this.id}-select" class="p-0 m-0 flex rounded-lg py-1 px-1 focus:border-4 focus:outline-hidden border-white border-2">
                    ${this.settings.options.map(opt => `<option value="${opt}" ${opt === this.settings.defaultValue ? "selected" : ""}>${opt}</option>`).join("")}
                </select>
                <div id="${this.id}-subcomponents" class="flex flex-col w-full h-min gap-6 pl-5 mt-2 border-l-1"></div>
            </div>
        `);
        container[0].setParent(this.parent);

        let select = container.getById(`${this.id}-select`);
        select.element.addEventListener('change', this._onDropdownChange.bind(this));

        this.pens.push(...container);

        this.value = this.settings.defaultValue || this.settings.options[0];

        // Render subcomponents for each dropdown option if subOptions exist
        if (this.settings.subOptions) {
            for (const key of Object.keys(this.settings.subOptions)) {
                this.subcomponents[key] = [];
                for (const subOpt of this.settings.subOptions[key]) {
                    const Comp = componentMap[subOpt.type];
                    if (Comp) {
                        const compInstance = new Comp(container.getById(`${this.id}-subcomponents`), subOpt);
                        this.subcomponents[key].push(compInstance);
                    }
                }
            }
        }

        // Initial render of subcomponents
        this._renderSubcomponents(this.value);

        return this.pens;
    }

    private _onDropdownChange(event: Event): void {
        const select = event.target as HTMLSelectElement;
        this.value = select.value;
        setPathInUserConfig(this.settings.path || [], this.value);
        this._renderSubcomponents(this.value);
    }

    private _renderSubcomponents(selectedKey: string): void {
        const container = this.pens.getById(`${this.id}-subcomponents`);
        if (!container) return;
        container.element.innerHTML = '';
        if (this.subcomponents[selectedKey]) {
            for (const comp of this.subcomponents[selectedKey]) {
                comp.render();
            }
        }
    }

    getValue(): string {
        return this.value;
    }
}
