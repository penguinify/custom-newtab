import { Component, Elements, Pen, PenArray } from "../../framework/penexutils";

export class OptionTab implements Component {
    pens: PenArray = new PenArray();
    id: string;
    parent: Pen<Elements>;
    hidden: boolean = false;

    constructor(pens: PenArray, parent: Pen<Elements>, id: string) {

        this.id = id;
        this.parent = parent;
        this.pens = pens;
    }
    
    render(): PenArray {
        let container = PenArray.fromHTML(`
            <div id="${this.id}-options-tab" class="options-tab w-full text-white p-6 text-lg">
                <h2>${this.id.charAt(0).toUpperCase() + this.id.slice(1)} Settings</h2>
            </div>
        `);
        let containerPen = container.getById(`${this.id}-options-tab`);
        if (this.pens.length === 0) {
            containerPen.element.innerHTML += `<p>No content available.</p>`;
        } else {
            this.pens.forEach(pen => {
                pen.setParent(containerPen);
            });
        }

        container[0].setParent(this.parent);

        this.pens.push(...container);

        this.hide(); // Hide by default


        return this.pens;
    }

    hide(): void {
        this.pens.getById(`${this.id}-options-tab`).element.style.display = 'none';
        this.hidden = true;
    }

    show(): void {
        this.pens.getById(`${this.id}-options-tab`).element.style.display = 'block';
        this.hidden = false;
    }

    toggle(): void {
        this.hidden ? this.show() : this.hide();
    }

}
