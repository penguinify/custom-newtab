import { CONFIG } from "./data/config";
import {
    type Component,
    type Elements,
    type Pen,
    PenArray,
} from "./framework/penexutils";
import type { OptionTab } from "./ui/components/options/optionTab.component";
import type {
    CheckboxOption,
    ColorOption,
    TextOption,
} from "./ui/widgetoptions";
import { generateRandomId } from "./utils/id";

export interface UserConfig {
    background: BackgroundType;
    colors: ColorOptions;
    tabTitle: string;
    tabFaviconUrl: string;
    fontFamily: string;
    hideOptionsButtonUnlessHovered: boolean;

    // someone better than me remove the any
    widgets: WidgetConfig<any>[];
}

export type BackgroundType =
    | {
        type: "color";
        hex: string;
    }
    | {
        type: "image";
        url: string; // can be a local file path or a remote url
        css: string; // additional css to apply to the image background, sanitized before applying
    }
    | {
        type: "video";
        fallbackColor: string; // color to show if video fails to load
    }
    | {
        type: "customcss";
        css: string; // raw css string, sanitized before applying
    };

export type ColorOptions = {
    textColor: string;
};

export type TabWrapper = {
    id: string;
    label: string;
    optionTab: OptionTab;
};

export type SettingOptions =
    | {
        type: "colorpicker";
        label: string;
        description: string;
        defaultValue: string;
        onChange?: (newValue: string) => void;
    }
    | {
        type: "dropdown";
        label: string;
        description: string;
        options: string[];
        path: string[]; // path in the UserConfig object
        subOptions: { [key: string]: SettingOptions[] }; // key is the option value
        defaultValue: string;
    }
    | {
        type: "text";
        label: string;
        description: string;
        defaultValue: string;
        onChange: (newValue: string) => void;
    }
    | {
        type: "file";
        label: string;
        description: string;
        onChange: (newValue: fileSaveData) => void;
    }
    | {
        type: "checkbox";
        label: string;
        description: string;
        defaultValue: boolean;
        onChange: (newValue: boolean) => void;
    }
    | {
        type: "button";
        label: string;
        description: string;
        onClick: () => void;
    };

export type fileSaveData = {
    blob: Blob;
    extension: string;
};

export type WidgetConfig<T extends Object> = {
    WidgetRecordId: string;
    description: string;
    position: PositionData;
    ssid?: string; // optional unique id for this widget config, if not provided, won't be generated. (usually only needed for file/image widgets to avoid naming conflicts)
    enabled: boolean;
    data: T; // configuration data specific to the widget
};
export type PositionData = {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
};

export abstract class Widget<T extends WidgetConfig<Object>>
    implements Component {
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
        return new Error(
            "defaultConfig method not implemented on the widget, please implement this.",
        ) as any;
    }

    setPosition(pen: Pen<Elements>) {
        setTimeout(this._applyPosition.bind(this, pen), 0);
    }
    private _applyPosition(pen: Pen<Elements>) {
        const parent = pen.element.parentElement;
        if (!parent) return;

        // Calculate position as percentage of parent size
        const left =
            parent.clientLeft + (this.data.position.x / 100) * parent.clientWidth;
        const top =
            parent.clientTop + (this.data.position.y / 100) * parent.clientHeight;

        // Calculate scale ratios, clamped between 0 and 1
        const widthRatio = parent.clientWidth / 1600;
        const heightRatio = parent.clientHeight / 900;
        let ratio = (widthRatio + heightRatio) / 2;
        ratio = Math.max(0, Math.min(1, ratio));
        const scaleX = this.data.position.scaleX * (0.1 + (10.0 - 0.1) * ratio);
        const scaleY = this.data.position.scaleY * (0.1 + (10.0 - 0.1) * ratio);

        // all factors going into the position
        console.table({
            parentWidth: parent.clientWidth,
            parentHeight: parent.clientHeight,
            xPercent: this.data.position.x,
            yPercent: this.data.position.y,
            calculatedLeft: left,
            calculatedTop: top,
            widthRatio: widthRatio,
            heightRatio: heightRatio,
            ratio: ratio,
            scaleX: scaleX,
            scaleY: scaleY,
        });

        // Apply styles
        pen.element.style.position = "absolute";
        pen.element.style.left = `${left}px`;
        pen.element.style.top = `${top}px`;
        pen.element.style.transformOrigin = "top left";
        pen.element.style.transform = `scale(${scaleX.toFixed(2)}, ${scaleY.toFixed(2)})`;
    }

    setParent(pen: Pen<Elements>) {
        pen.setParent(document.body);
    }

    getConfig(): UserConfig {
        return CONFIG;
    }

    destroy(): void {
        this.pens.forEach((pen) => {
            pen.element.remove();
        });
    }

    onResize(): void {
        //default, propobly wannat override this in the widget
        this.setPosition(this.pens[0]);
    }

    // typescript wont let me make this abstract so i gotta force it out somehow
    static getWidgetOptionsRecord(): WidgetOptionsRecord {
        return new Error(
            "getWidgetOptionsRecord method not implemented on the widget, please implement this.",
        ) as any;
    }
}

export abstract class WidgetOption<T> {
    label: string;
    description: string;

    constructor(label: string, description: string) {
        this.label = label;
        this.description = description;
    }

    abstract intoSettingsOptions(
        defaultValue: T,
        onChange: (newValue: T) => void,
    ): SettingOptions;
}

export type WidgetOptionType = TextOption | ColorOption | CheckboxOption;

export interface WidgetOptionsRecord {
    [key: string]: WidgetOption<any>;
}
