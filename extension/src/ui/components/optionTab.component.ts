import { Component, Elements, Pen, PenArray } from "../../framework/penexutils";
import { SettingOptions } from "../../types";
import { CheckboxInput } from "./checkboxInput.component";
import { ColorPicker } from "./colorPicker.component";
import { DropdownWithSubcomponents } from "./dropdownWithSubcomponents.component";
import { FileInput } from "./fileInput.component";
import { TextInput } from "./textInput.component";

export class OptionTab implements Component {
    pens: PenArray = new PenArray();
    id: string;
    parent: Pen<Elements>;
    hidden: boolean = false;
    options: SettingOptions[] = [];

    constructor(options: SettingOptions[], parent: Pen<Elements>, id: string) {

        this.id = id;
        this.parent = parent;
        this.options = options;
    }

    render(): PenArray {
        let container = PenArray.fromHTML(`
            <div id="${this.id}-options-tab" class="options-tab w-full flex flex-col  p-6 text-xl gap-4">
                <h2>${this.id.charAt(0).toUpperCase() + this.id.slice(1)} Settings</h2>
            </div>
        `);
        let containerPen = container.getById(`${this.id}-options-tab`);

        container[0].setParent(this.parent);
        this.pens.push(...container);
        this.options.forEach(option => {
            const optionPen = this._createOption(option);
            optionPen.forEach(pen => {
                pen.setParent(containerPen);
            });
        });



        this.hide();


        return this.pens;
    }

    private _createOption(option: SettingOptions): PenArray {
        let optionPen: PenArray = new PenArray();
        switch (option.type) {
            case 'colorpicker':
                this.pens.push(...new ColorPicker(this.pens.getById(`${this.id}-options-tab`), option).render());
                break;
            case 'dropdown':
                this.pens.push(...new DropdownWithSubcomponents(this.pens.getById(`${this.id}-options-tab`), option).render());
                break;
            case 'text':
                this.pens.push(...new TextInput(this.pens.getById(`${this.id}-options-tab`), option).render());
                break;
            case 'file':
                this.pens.push(...new FileInput(this.pens.getById(`${this.id}-options-tab`), option).render());
                break;
            case "checkbox":
                this.pens.push(...new CheckboxInput(this.pens.getById(`${this.id}-options-tab`), option).render());
                break;
                
        }
        return optionPen;

    }


    hide(): void {
        this.pens.getById(`${this.id}-options-tab`).element.style.display = 'none';
        this.hidden = true;
    }

    show(): void {
        this.pens.getById(`${this.id}-options-tab`).element.style.display = 'flex';
        this.hidden = false;
    }

    toggle(): void {
        this.hidden ? this.show() : this.hide();
    }

}
