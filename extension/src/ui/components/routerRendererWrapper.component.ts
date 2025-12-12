// does what it says on the tin, it wraps a router inside of itself, i think its pretty nifty but you can decide for yoursel

import { AsyncRoute, Component, Elements, Pen, PenArray, Route, Router, elementGlobals } from "../../framework/penexutils";
import { generateRandomId } from "../../utils";


export class RouterRendererWrapperComponent implements Component {
    private parent: Pen<Elements>;
    route: Route | AsyncRoute;
    private styles: string;
    public pens: PenArray = new PenArray();
    public id: string = generateRandomId(4);
    public initialized: boolean = false;

    constructor(parent: Pen<Elements>, router: Route | AsyncRoute, styles: string) {
        this.route = router;
        this.parent = parent;
        this.styles = styles;


    }


    // creates the wrapper
    init() {
        this.pens = PenArray.fromHTML(`
        <div class="${this.styles}" id="router-wrapper-${this.id}">
            <!-- Route content will be rendered here -->
        </div>
`);
    }


    async renderAsync(): Promise<PenArray> {
        let routePens: PenArray;
        if (this.route instanceof AsyncRoute) {
            routePens = await this.route.renderAsync();
        } else {
            routePens = this.route.render();
        }

        if (!this.initialized) {
            this.init();
            this.initialized = true;
        }

        let wrapperDiv = this.pens[0];
        wrapperDiv.element.innerHTML = '';
        wrapperDiv.setParent(this.parent);
        console.log(this.parent)


        for (let pen of routePens) {
            if (pen.parent === elementGlobals.mainApp) {
                console.warn('RouterRendererWrapperComponent: pen parent is mainApp, changing to wrapperDiv');
                pen.setParent(wrapperDiv);
            }
        }
        console.log('RouterRendererWrapperComponent rendered route:', this.pens);

        return this.pens;
    }
}


