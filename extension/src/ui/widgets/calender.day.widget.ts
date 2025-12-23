import { WidgetRegistry } from "../../data/widgetmanager";
import { PenArray } from "../../framework/penexutils";
import {
    Widget,
    type UserConfig,
    type WidgetConfig,
    type WidgetOptionsRecord,
} from "../../types";
import { applyMixins } from "../../utils/mixins";
import { TextOptionMixin } from "../widgetmixins";
import { CheckboxOption } from "../widgetoptions";

export class CalenderDayWidget extends Widget<CalenderDayData> {

    render(): PenArray {
        const config: UserConfig = this.getConfig();

        this.pens = PenArray.fromHTML(`
            <div id="calender-day-widget-${this.id}" style="display: flex; align-items: center;">
                <span id="calender-day-${this.id}"></span>
            </div>
        `);

        const calenderDayWidgetPen = `calender-day-widget-${this.id}`;
        this.applyTextOptions(
            this.pens.getById(calenderDayWidgetPen),
            config,
        );

        this.setDay();

        if (!this.displayInstance && !this.editorInstance) {
            this.setPosition(this.pens.getById(calenderDayWidgetPen));
            this.setParent(this.pens.getById(calenderDayWidgetPen));
        }
        return this.pens;
    }

    setDay() {
        const dayDisplayPen = this.pens.getById(`calender-day-${this.id}`);
        const now = new Date();
        const daysFull = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const daysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const config = this.getConfig();

        const useShorthand = this.data.data.shorthand ?? false;
        const dayIndex = now.getDay();
        dayDisplayPen.element.textContent = useShorthand ? daysShort[dayIndex] : daysFull[dayIndex];
    }

    static defaultConfig(): CalenderDayData {
        return {
            WidgetRecordId: "calender-day-widget",
            description: "Current day of the week",
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
            shorthand: new CheckboxOption("Shorthand", "Show abbreviated day name"),
            ...TextOptionMixin.getWidgetOptionsRecord(),
        };
    }
}

function register() {
    WidgetRegistry.registerWidget("calender-day-widget", CalenderDayWidget);
}

export default register();

export type CalenderDayData = WidgetConfig<{
    shorthand: boolean;
    color: string;
    fontFamily: string;
    fontWeight: string;
}>;

export interface CalenderDayWidget extends TextOptionMixin { }

applyMixins(CalenderDayWidget, [TextOptionMixin]);
