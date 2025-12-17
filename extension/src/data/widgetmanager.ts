import { DEBUG_LOGGING } from "./constants";
import { Widget, WidgetConfig } from "../types";



// im to bad at typescript not to use any
export class WidgetRegistry {
    static registry: Record<string, new (data: any) => Widget<any>> = {};

    static registerWidget<T extends WidgetConfig<Object>>(widgetId: string, widgetClass: new (data: T) => Widget<T>): void {
        if (DEBUG_LOGGING) {
            console.log(`Registering widget: ${widgetId}`);
        }
        WidgetRegistry.registry[widgetId] = widgetClass;
    }

    static getWidget<T extends WidgetConfig<Object>>(widgetId: string): (new (data: T) => Widget<T>) | undefined {
        return WidgetRegistry.registry[widgetId] as (new (data: T) => Widget<T>) | undefined;
    }

    // iterable registry
    static *[Symbol.iterator]() {
        for (const key in WidgetRegistry.registry) {
            yield [key, WidgetRegistry.registry[key]];
        }
    }
}



// imports all the widget classes so they can register themselves lmao. 


