// good first widget to look at if you're new to the codebase

import { Elements, Pen, PenArray } from "../../framework/penexutils";
import { ClockData, UserConfig, Widget } from "../../types";
import { WidgetRegistry } from "../../widgetmanager";

export class ClockWidget extends Widget<ClockData> {
    private timeDisplayPen!: Pen<Elements>;

    constructor(data: ClockData) {
        super(data);
    }

    render(): PenArray {
        let config: UserConfig = this.getConfig();
        console.log('Rendering clock widget with config', this);
        // dont use tailwind in custom widgets, the utitlity classes are not guaranteed to be available
        this.pens = PenArray.fromHTML(`
        <div id="clock-widget-${this.id}"  style="font-family: ${config.fontFamily}; color: ${config.colors.textColor}">
            <span id="time-display-${this.id}" class="text-4xl">--:--:--</span>
        </div>
        `);

        this.timeDisplayPen = this.pens.getById(`time-display-${this.id}`);

        window.setInterval(() => {
            this._updateTime();
        }, 1000);

        this._updateTime();

        console.log(this.displayInstance);
        if (!this.displayInstance && !this.editorInstance) {

            this.setParent(this.pens.getById(`clock-widget-${this.id}`));
            this.setPosition(this.pens.getById(`clock-widget-${this.id}`));
        } else {
            console.log('Clock widget is in editor instance, skipping position set.');
        }

        // this.pens is automatically added to the main app container by the framework
        return this.pens;
    }

    private _updateTime() {
        const now = new Date();
        let hours = now.getHours();
        let minutes: number | string = now.getMinutes();
        let seconds: number | string = now.getSeconds();

        if (!this.data.data.is24Hour) {
            hours = hours % 12 || 12; // Convert to 12-hour format
        }
        if (minutes < 10) minutes = '0' + minutes;
        if (seconds < 10) seconds = '0' + seconds;

        let timeString = `${hours}:${minutes}`;
        if (this.data.data.showSeconds) {
            timeString += `:${seconds}`;
        }


        this.timeDisplayPen.element.innerText = timeString;
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
                scale: 1
            },
            data: {
                showSeconds: true,
                is24Hour: false,
            }
        };
    }



}

function register() {
    WidgetRegistry.registerWidget("clock-widget", ClockWidget);
}

export default register();

