import { CONFIG } from "./config"
import { DEBUG_LOGGING } from "./constants"
import { Component, Elements, Pen, PenArray } from "./framework/penexutils"
import { OptionTab } from "./ui/components/options/optionTab.component"
import { generateRandomId } from "./utils"

export interface UserConfig {
    background: BackgroundType,
    colors: ColorOptions
    tabTitle: string
    tabFaviconUrl: string
    fontFamily: string
    hideOptionsButtonUnlessHovered: boolean

    // someone better than me remove the any
    widgets: WidgetConfig<any>[]
}



export type BackgroundType = {
    type: "color",
    hex: string
} | {
    type: "image",
    url: string // can be a local file path or a remote url
    css: string // additional css to apply to the image background, sanitized before applying
} | {
    type: "video",
    fallbackColor: string // color to show if video fails to load
} | {
    type: "customcss",
    css: string // raw css string, sanitized before applying
}


export type ColorOptions = {
    textColor: string,
}

export type TabWrapper = {
    id: string,
    label: string,
    optionTab: OptionTab

}

export type SettingOptions = {
    type: "colorpicker",
    label: string,
    description: string,
    defaultValue: string
    onChange?: (newValue: string) => void,
} | {
    type: "dropdown",
    label: string,
    description: string,
    options: string[],
    path: string[], // path in the UserConfig object
    subOptions?: { [key: string]: SettingOptions[] }, // key is the option value
    defaultValue: string,
} | {
    type: "text",
    label: string,
    description: string,
    defaultValue: string,
    onChange?: (newValue: string) => void,
} | {
    type: "file",
    label: string,
    description: string,
    defaultValue: string,
    fileValue: string,
    path: string[]
} | {
    type: "checkbox",
    label: string,
    description: string,
    defaultValue: boolean,
    onChange?: (newValue: boolean) => void,
} | {
    type: "button",
    label: string,
    description: string,
    onClick: () => void,
}

export type WidgetConfig<T extends Object> = {
    WidgetRecordId: string,
    description: string,
    position: PositionData,
    enabled: boolean,
    data: T // configuration data specific to the widget
}
export type PositionData = {
    x: number,
    y: number
    scale: number
}

export abstract class Widget<T extends WidgetConfig<Object>> implements Component {
    pens: PenArray = new PenArray();
    data!: T;
    id: string = generateRandomId(); // unique id for this widget instance, ALWAYS use this for element ids within the widget to avoid conflicts in case the user wants multiple of the same widget.
    displayInstance: boolean = false; // is this widget being rendered in in the widgetDrawer?
    editorInstance: boolean = false; // is this widget being rendered in the widget editor?

    /*
    * Data is the widget configuration data, which is stored in the UserConfig object
    */
    constructor(data: T) {
        this.data = data;
    }

    abstract render(): PenArray;


    static defaultConfig(): WidgetConfig<Object> {
        return new Error("defaultConfig method not implemented on the widget, please implement this.") as any;
    }

    setPosition(pen: Pen<Elements>) {

        setTimeout(this._applyPosition.bind(this, pen), 0);



    }
    private _applyPosition(pen: Pen<Elements>) {

        console.log('Applying position for widget', this.data.WidgetRecordId, 'with data', this.data.position);
        pen.element.style.position = 'absolute';
        // the x and y are stored as a percentage of the screen size to allow for responsive design
        console.log('Parent element dimensions:', pen.element.parentElement?.clientWidth, 'x', pen.element.parentElement?.clientHeight);
        let calculatedX = pen.element.parentElement?.clientLeft + (this.data.position.x / 100) * pen.element.parentElement!.clientWidth;
        let calculatedY = pen.element.parentElement?.clientTop + (this.data.position.y / 100) * pen.element.parentElement!.clientHeight;
        console.log('Setting widget position to', calculatedX, calculatedY);

        // Calculate scale based on ratio of average of parent height/900 and width/1600
        let scale = this.data.position.scale;
        if (pen.element.parentElement) {
            const parentWidth = pen.element.parentElement.clientWidth;
            const parentHeight = pen.element.parentElement.clientHeight;
            let widthRatio = parentWidth / 1600;
            let heightRatio = parentHeight / 900;
            let ratio = (widthRatio + heightRatio) / 2;
            ratio = Math.max(0, Math.min(1, ratio));
            scale = this.data.position.scale * (0.1 + (10.0 - 0.1) * ratio);
            scale = parseFloat(scale.toFixed(2));
            console.log('Ratio:', ratio, 'Calculated scale:', scale);
        }

        pen.element.style.left = `${calculatedX}px`;
        pen.element.style.top = `${calculatedY}px`;
        pen.element.style.transformOrigin = 'top left';
        pen.element.style.transform = `scale(${scale})`;
        console.log(`Widget ${this.data.WidgetRecordId} positioned at (${calculatedX}px, ${calculatedY}px) with scale ${scale}`);
    }

    setParent(pen: Pen<Elements>) {
        pen.setParent(document.body);
    }

    getConfig(): UserConfig {
        return CONFIG
    }

    destroy(): void {
        this.pens.forEach(pen => {
            pen.element.remove();
        });
    }

    onResize(): void {
        //default, propobly wannat override this in the widget
        this.setPosition(this.pens[0]);
    }



}


export type ClockData = WidgetConfig<{
    useStrfFormat: boolean,
    formatString: string,
    showSeconds: boolean,
    militartTime: boolean,
    color: string,
    fontFamily: string
    fontWeight: string

}>

export type TextData = WidgetConfig<{
    textContent: string,
    fontWeight: string,
    fontFamily: string,
    fontSize: number,
    color: string,
    fontStyle: string
}>
