
import { Component, Elements, Pen, PenArray } from "../../../framework/penexutils";
import { SettingOptions } from "../../../types";
import { generateRandomId } from "../../../utils";

export class ButtonInput implements Component {
    pens: PenArray = new PenArray();
    parent: Pen<Elements>;
    settings: SettingOptions;
    id: string = generateRandomId();
    buttonElement!: Pen<Elements>;


    constructor(parent: Pen<Elements>, options: SettingOptions) {
        this.parent = parent;
        if (options.type !== 'button') {
            throw new Error('Invalid option type for CheckboxInput component');
        } else {
            this.settings = options;
        }
    }



    render(): PenArray {
        if (this.settings.type !== 'button') {
            throw new Error('Invalid settings for ButtonInput component');
        }
        let container = PenArray.fromHTML(`
            <div id="${this.id}-button-input" class="flex flex-col" data-description="${this.settings.description || ''}">
                <button id="${this.id}-input" class="rounded-md border-2 border-white px-4 py-2 bg-transparent hover:text-black focus:outline-hidden transition duration-500 cursor-pointer">
                    ${this.settings.label}
                </button>
            </div>
        `);
        container[0].setParent(this.parent);

        this.buttonElement = container.getById(`${this.id}-input`);
        this.buttonElement.element.addEventListener('click', this.settings.onClick || (() => {}));
        this.buttonElement.element.addEventListener('mouseenter', this._mouseHover.bind(this));
        this.buttonElement.element.addEventListener('mouseleave', this._mouseLeave.bind(this));


        this.pens.push(...container);


        return this.pens;
    }

    _mouseHover(): void {
        this.buttonElement.element.style.boxShadow = `inset ${this.buttonElement.element.offsetWidth + 50}px 0 0 0 white`;
    }

    _mouseLeave(): void {
        this.buttonElement.element.style.boxShadow = `inset 0 0 0 0 white`;
    }





}
