import { WidgetRegistry } from "../../data/widgetmanager";
import { type Elements, type Pen, PenArray } from "../../framework/penexutils";
import {
    type UserConfig,
    Widget,
    type WidgetConfig,
    type WidgetOptionsRecord,
} from "../../types";
import { applyMixins } from "../../utils/mixins";
import { TextOptionMixin } from "../widgetmixins";
import { CheckboxOption, TextOption } from "../widgetoptions";

export class CalenderMonthWidget extends Widget<CalenderMonthData> {

    render(): PenArray {
        const config: UserConfig = this.getConfig();

        this.pens = PenArray.fromHTML(`
            <div id="calender-month-widget-${this.id}" style="display: flex; align-items: center;">
                <span id="calender-month-${this.id}">/span>
            </div>
        `);


        const calenderMonthWidgetPen = `calender-month-widget-${this.id}`;
        this.applyTextOptions(
            this.pens.getById(calenderMonthWidgetPen),
            config,
        );

        this.setMonth();




        if (!this.displayInstance && !this.editorInstance) {
            this.setPosition(this.pens.getById(calenderMonthWidgetPen));
            this.setParent(this.pens.getById(calenderMonthWidgetPen));
        }
        return this.pens;
    }

    setMonth() {
        const monthDisplayPen = this.pens.getById(`calender-month-${this.id}`);
        const now = new Date();
        const month = now.toLocaleString("default", {
            month: this.data.data.shorthand ? "short" : "long",
        });
        monthDisplayPen.element.textContent = month;
    }


    static defaultConfig(): WeatherTempData {
        return {
            WidgetRecordId: "calender-month-widget",
            description: "Current calender month",
            enabled: true,
            position: { x: 0.5, y: 0, scaleX: 1, scaleY: 1 },
            data: {
                shorthand: false,
                ...TextOptionMixin.defaultOptions(),
            },
        };
    }
    static getWidgetOptionsRecord(): WidgetOptionsRecord {
        return {
            shorthand: new CheckboxOption(
                "Shorthand Month",
                "Display the month in shorthand (e.g., Jan, Feb) format.",
            ),
            ...TextOptionMixin.getWidgetOptionsRecord(),
        };
    }
}

function register() {
    WidgetRegistry.registerWidget("calender-month-widget", CalenderMonthWidget);
}

export default register();

export type CalenderMonthData = WidgetConfig<{
    shorthand: boolean;
    color: string;
    fontFamily: string;
    fontWeight: string;
}>;

export interface CalenderMonthWidget extends TextOptionMixin { }

applyMixins(CalenderMonthWidget, [TextOptionMixin]);
