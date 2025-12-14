import { Component, Pen, PenArray } from "../../framework/penexutils";

export class DescriptionBox implements Component {
    pens: PenArray = new PenArray();
    private descriptionBox!: Pen<HTMLElement>;
    private descriptionContainer!: Pen<HTMLElement>;
    private currentX: number = 0;
    private currentY: number = 0;
    private targetX: number = 0;
    private targetY: number = 0;

    constructor() {
    }

    render(): PenArray {
        this.pens = PenArray.fromHTML(`
            <div id ="description-container" class="px-2 py-1 bg-black/75 rounded-lg border-2 border-white absolute z-100 ponter-events-none ease-in-out transition-opacity">
                <p class="text-white pointer-events-none" id="description-box"></p>
            </div>
        `);

        this.descriptionBox = this.pens.getById('description-box');
        this.descriptionContainer = this.pens.getById('description-container');
        this.descriptionBox.element.textContent = '';

        window.addEventListener('mousemove', this._onMouseMove.bind(this));
        this.animationFrame();

        return this.pens;
    }

    _onMouseMove(event: MouseEvent): void {
        let target = event.target as HTMLElement;

        if (target.closest('[data-description]') || target.id === 'description-container') {
            // ignore if hovering over the description box itself
            if (target.id !== 'description-container') {
                let description = target.closest('[data-description]')?.getAttribute('data-description') || '';

                this.descriptionBox.element.textContent = description;
            }

            this.descriptionContainer.element.style.opacity = '1';


            this.targetX = event.clientX + 15;
            this.targetY = event.clientY + 15;




        } else {
            this.targetX = event.clientX + 100;
            this.targetY = event.clientY + 100;
            this.descriptionContainer.element.style.opacity = '0';


        }
    }

    animationFrame(): void {
        requestAnimationFrame(this.animationFrame.bind(this));
        this.currentX += (this.currentX - this.targetX) * -0.05
        this.currentY += (this.currentY - this.targetY) * -0.05

        this.descriptionContainer.element.style.left = `${this.currentX}px`;
        this.descriptionContainer.element.style.top = `${this.currentY}px`;
    }
}
