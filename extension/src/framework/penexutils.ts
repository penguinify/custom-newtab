import { DEBUG_LOGGING } from '../constants';
import { setup } from './penex'

type HTMLMarkup = string

export interface Component {
    pens: PenArray;
    render?(): PenArray;
    renderAsync?(): Promise<PenArray>;
}
class Components {
    pens: PenArray = new PenArray();

    constructor() { }

    add(...components: Component[]): void {
        if (DEBUG_LOGGING) console.debug('[Components] Adding components:', components);
        components.forEach((component) => {
            if (component.render === undefined) return;
            if (DEBUG_LOGGING) console.debug('[Components] Rendering component:', component);
            this.pens.push(...component.render());
        });
    }


}

export enum elementGlobals {
    // The main application container, usually a div with id 'app' defined in the layout
    // useful for components to attach themselves to the main app container instead of just the route or etc.
    mainApp = 'app',
}

export type Elements = HTMLElementTagNameMap[keyof HTMLElementTagNameMap]

class Pen<T extends Elements> {
    element: T
    parent?: Elements | elementGlobals

    constructor(tag: string, parent?: T | elementGlobals) {
        if (DEBUG_LOGGING) console.debug('[Pen] Creating element:', tag, 'with parent:', parent);
        this.element = document.createElement(tag) as T

        if (parent) this.setParent(parent)
    }

    setParent(parent: HTMLElement | elementGlobals | Pen<Elements>, childNumber?: number): void {
        if (DEBUG_LOGGING) console.debug('[Pen] Setting parent:', parent, 'childNumber:', childNumber);
        if (parent instanceof HTMLElement) {
            this.parent = parent
            if (childNumber !== undefined && childNumber < parent.children.length) {
                parent.insertBefore(this.element, parent.children[childNumber])
                if (DEBUG_LOGGING) console.debug('[Pen] Inserted element at childNumber:', childNumber);
            } else {
                this.parent.appendChild(this.element)
                if (DEBUG_LOGGING) console.debug('[Pen] Appended element to parent');
            }
        } else if (parent === elementGlobals.mainApp) {
            this.parent = elementGlobals.mainApp
            if (DEBUG_LOGGING) console.debug('[Pen] Set parent to mainApp');
        } else if (parent instanceof Pen) {
            this.parent = parent.element
            if (childNumber !== undefined && childNumber < parent.element.children.length) {
                parent.element.insertBefore(this.element, parent.element.children[childNumber])
                if (DEBUG_LOGGING) console.debug('[Pen] Inserted element at childNumber in Pen:', childNumber);
            } else {
                parent.element.appendChild(this.element)
                if (DEBUG_LOGGING) console.debug('[Pen] Appended element to Pen parent');
            }
        }
    }

    asPenArray(): PenArray {
        return new PenArray(this)
    }


    static fromElement<E extends Elements>(element: E, parent?: E | elementGlobals): Pen<E> {
        if (DEBUG_LOGGING) console.debug('[Pen] Creating from existing element:', element, 'with parent:', parent);
        let pen: Pen<E> = new Pen(element.tagName)
        pen.element = element

        if (parent) pen.setParent(parent)
        else if (element.parentElement) pen.setParent(element.parentElement!)

        return pen
    }




}

export class PenArray extends Array<Pen<Elements>> {


    constructor(...pens: Pen<Elements>[]) {
        super(...pens)
    }

    getById(id: string): Pen<Elements> {
        if (DEBUG_LOGGING) console.debug('[PenArray] getById:', id);
        return this.find((pen) => pen.element.id === id)!;
    }

    querySelectorAll(selector: string): PenArray {
        if (DEBUG_LOGGING) console.debug('[PenArray] querySelectorAll:', selector);
        const elements: Set<Element> = new Set();

        this.forEach((pen) => {
            if (pen.element.matches(selector)) {
                elements.add(pen.element);
            }
            pen.element.querySelectorAll(selector).forEach((child) => {
                elements.add(child);
            });
        });

        // Convert Set to array and sort by document order
        const sortedElements = Array.from(elements).sort((a, b) => {
            if (a === b) return 0;
            if (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_PRECEDING) return 1;
            return -1;
        });

        const pens = new PenArray(...sortedElements.map(el => Pen.fromElement(el as HTMLElement)));
        if (DEBUG_LOGGING) console.debug('[PenArray] querySelectorAll result:', pens);
        return pens;
    }

    querySelector(selector: string): Pen<Elements> | null {
        if (DEBUG_LOGGING) console.debug('[PenArray] querySelector:', selector);
        for (let pen of this) {
            if (pen.element.matches(selector)) {
                if (DEBUG_LOGGING) console.debug('[PenArray] querySelector found match:', pen);
                return pen
            }
            const child = pen.element.querySelector(selector)
            if (child) {
                if (DEBUG_LOGGING) console.debug('[PenArray] querySelector found child match:', child);
                return Pen.fromElement(child as HTMLElement)
            }
        }
        if (DEBUG_LOGGING) console.debug('[PenArray] querySelector found no match');
        return null
    }
    static fromHTML(html: HTMLMarkup): PenArray {
        if (DEBUG_LOGGING) console.debug('[PenArray] fromHTML:', html);
        const element = document.createElement('div')
        element.innerHTML = html

        const pens: PenArray = new PenArray()

        // double it up to get both direct children and nested children
        Array.from(element.children).forEach((child) => {
            const pen = Pen.fromElement(child as HTMLElement, elementGlobals.mainApp)
            pens.push(pen)
            if (DEBUG_LOGGING) console.debug('[PenArray] fromHTML added direct child:', pen);
        })

        element.querySelectorAll('*').forEach((child) => {

            // skip the first level children as they are already added
            if (Array.from(element.children).includes(child)) return;

            const pen = Pen.fromElement(child as HTMLElement)
            pens.push(pen)
            if (DEBUG_LOGGING) console.debug('[PenArray] fromHTML added nested child:', pen);
        })


        return pens
    }



}

export abstract class Route {
    layout(layout: string): string | undefined {
        return layout
    }
    path: string = '/'

    pens: PenArray = new PenArray()
    components: Components = new Components()
    render(): PenArray {
        return new PenArray();
    }
    onRoute?(): void

}

// Useful for routes that require asynchronous data fetching before rendering
export abstract class AsyncRoute extends Route {
    async renderAsync(): Promise<PenArray> {
        return new PenArray();
    }

    // Functio to give pensAsync a default value as a loading state or as a default value.
    renderFallback(): PenArray {
        return new PenArray();
    }


    pensAsync: Promise<PenArray> = Promise.resolve(new PenArray());

}

export class Router {
    routes: Route[] = []
    path: string
    defaultLayout: HTMLMarkup
    app: string = elementGlobals.mainApp;

    constructor(app: string, defaultLayout: HTMLMarkup, initialPath: string = '/', routes?: Route[]) {
        if (DEBUG_LOGGING) console.debug('[Router] Initializing with app:', app, 'defaultLayout:', defaultLayout, 'initialPath:', initialPath, 'routes:', routes);
        this.defaultLayout = defaultLayout
        this.path = initialPath
        this.app = app
        if (routes) this.addRoutes(routes)

        this.navigateTo(this.path)
    }

    addRoute(route: Route): void {
        if (DEBUG_LOGGING) console.debug('[Router] Adding route:', route);
        this.routes.push(route)
    }

    addRoutes(routes: Route[]): void {
        if (DEBUG_LOGGING) console.debug('[Router] Adding routes:', routes);
        this.routes.push(...routes)
    }

    private appendRouteToMainApp(route: Route): void {
        if (DEBUG_LOGGING) console.debug('[Router] Appending route to main app:', route);
        // reload webpage
        window.document.body.innerHTML = ''

        let layout = route.layout(this.defaultLayout) || this.defaultLayout
        if (DEBUG_LOGGING) console.debug('[Router] Using layout:', layout);
        setup(this.app, layout, route.components)

        let mainApp = document.getElementById(this.app)
        if (mainApp === null) throw new Error('No main app element found.')
        for (let i = 0; i < route.pens.length; i++) {
            try {
                if (route.pens[i].parent === elementGlobals.mainApp) {
                    mainApp.appendChild(route.pens[i].element)
                    if (DEBUG_LOGGING) console.debug('[Router] Appended pen to mainApp:', route.pens[i]);
                }
            } catch (e) {
                if (DEBUG_LOGGING) console.error('[Router] Error appending pen:', e, 'at component', route.pens[i]);
                throw 'Error: ' + e + ' at component ' + route.pens[i]
            }
        }

    }

    async navigateTo(path: string): Promise<void> {
        if (DEBUG_LOGGING) console.debug('[Router] Navigating to path:', path);
        const route = this.routes.find(r => r.path === path)
        if (!route) {
            if (DEBUG_LOGGING) console.error('[Router] No route with path found:', path);
            throw new Error(`No route with path ${path} found.`)
        }

        this.path = path

        if (route instanceof AsyncRoute) {
            if (DEBUG_LOGGING) console.debug('[Router] Route is AsyncRoute, rendering fallback');
            let fallBackPens = route.renderFallback()
            route.pens = fallBackPens
            this.appendRouteToMainApp(route)

            route.pens = await route.pensAsync
            if (DEBUG_LOGGING) console.debug('[Router] AsyncRoute pens loaded:', route.pens);

        }

        this.appendRouteToMainApp(route)

        window.history.pushState({}, '', path)

        if (DEBUG_LOGGING) console.debug('[Router] Route onRoute callback');
        route.onRoute?.()

    }


}

export function sanitize(unsafe_string: string): string {
    if (DEBUG_LOGGING) console.debug('[sanitize] Sanitizing string:', unsafe_string);
    const map: {
        [key: string]: string
    } = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    const result = unsafe_string.replace(/[&<>"']/g, function (m) { return map[m]; });
    if (DEBUG_LOGGING) console.debug('[sanitize] Result:', result);
    return result;
}

export { Components, Pen }
