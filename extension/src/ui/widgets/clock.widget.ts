// good first widget to look at if you're new to the codebase

import { Elements, Pen, PenArray } from "../../framework/penexutils";
import { UserConfig, Widget, WidgetConfig, WidgetOptionsRecord } from "../../types";
import { strftime } from "../../utils";
import { WidgetRegistry } from "../../data/widgetmanager";
import { CheckboxOption, ColorOption, TextOption } from "../widgetoptions";

export class ClockWidget extends Widget<ClockData> {
    private timeDisplayPen!: Pen<Elements>;

    constructor(data: ClockData) {
        super(data);
    }

    render(): PenArray {
        let config: UserConfig = this.getConfig();
        let color: string;
        let fontFamily: string;
        let fontWeight: string;
        if (this.data.data.color.trim() === "") {
            color = config.colors.textColor;
        } else {
            color = this.data.data.color;
        }
        if (this.data.data.fontFamily.trim() === "") {
            fontFamily = config.fontFamily;
        } else {
            fontFamily = this.data.data.fontFamily;
        }
        if (this.data.data.fontWeight.trim() === "") {
            fontWeight = "normal";
        } else {
            fontWeight = this.data.data.fontWeight;
        }



        // dont use tailwind in custom widgets, the utitlity classes are not guaranteed to be available
        this.pens = PenArray.fromHTML(`
        <div id="clock-widget-${this.id}"  style="font-family: ${config.fontFamily}; color: ${color}; font-weight: ${fontWeight}; white-space: nowrap;">
            <span id="time-display-${this.id}" class="text-4xl">--:--:--</span>
        </div>
        `);

        this.timeDisplayPen = this.pens.getById(`time-display-${this.id}`);

        window.setInterval(() => {
            this._updateTime();
        }, 1000);

        this._updateTime();

        if (!this.displayInstance && !this.editorInstance) {

            this.setParent(this.pens.getById(`clock-widget-${this.id}`));
            this.setPosition(this.pens.getById(`clock-widget-${this.id}`));
        } else {
        }

        // this.pens is automatically added to the main app container by the framework
        return this.pens;
    }

    private _updateTime() {
        if (this.data.data.useStrfFormat) {
            // use strftime format
            this.timeDisplayPen.element.textContent = strftime(this.data.data.formatString);
            return;
        }

        let now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        if (!this.data.data.militartTime) {
            hours = hours % 12;
            if (hours === 0) hours = 12; // handle midnight and noon
        }
        if (this.data.data.showSeconds) {
            let seconds = now.getSeconds();
            this.timeDisplayPen.element.textContent = `${this._padZero(hours)}:${this._padZero(minutes)}:${this._padZero(seconds)}`;
        } else {
            this.timeDisplayPen.element.textContent = `${this._padZero(hours)}:${this._padZero(minutes)}`;
        }
    }

    private _padZero(num: number): string {
        return num < 10 ? '0' + num : num.toString();
    }



    static defaultConfig(): ClockData {
        return {
            WidgetRecordId: "clock-widget",
            // description shown in the widget drawer, not to be changed really every so dont worry.
            description: "A simple clock widget that displays the current time.",

            enabled: true,
            position: {
                x: 0,
                y: 0,
                scaleX: 0.5,
                scaleY: 0.5,
            },
            data: {
                militartTime: false,
                showSeconds: true,
                useStrfFormat: false,
                formatString: "%H:%M:%S",
                color: "",
                fontFamily: "",
                fontWeight: ""
            }
        };
    } static getWidgetOptionsRecord(): WidgetOptionsRecord {
        return {
            useStrfFormat: new CheckboxOption("Use strftime Format", "If true, the clock will use the strftime format string provided below. If false, it will use the simple hour:minute(:second) format."),
            formatString: new TextOption("Format String", "The strftime format string to use for displaying the time. Only used if 'Use strftime Format' is true."),
            showSeconds: new CheckboxOption("Show Seconds", "If true, the clock will display seconds."),
            militartTime: new CheckboxOption("Military Time", "If true, the clock will use 24-hour format."),
            color: new ColorOption("Text Color", "The color of the clock text. Leave blank to use the default text color."),
            fontFamily: new TextOption("Font Family", "The font family to use for the clock text. Leave blank to use the default font."),
            fontWeight: new TextOption("Font Weight", "The font weight to use for the clock text (e.g., 'normal', 'bold'). Leave blank to use the default weight."),
        }
    }



}

function register() {
    WidgetRegistry.registerWidget("clock-widget", ClockWidget);
}

export default register();


export type ClockData = WidgetConfig<{
    useStrfFormat: boolean
    formatString: string
    showSeconds: boolean
    militartTime: boolean
    color: string
    fontFamily: string
    fontWeight: string

}>

