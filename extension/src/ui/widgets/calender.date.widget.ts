import { WidgetRegistry } from "../../data/widgetmanager";
import { PenArray } from "../../framework/penexutils";
import {
    type UserConfig,
    Widget,
    type WidgetConfig,
    type WidgetOptionsRecord,
} from "../../types";
import { applyMixins } from "../../utils/mixins";
import { TextOptionMixin } from "../widgetmixins";
import { CheckboxOption } from "../widgetoptions";

export class CalenderDateWidget extends Widget<CalenderDateData> {

    render(): PenArray {
        const config: UserConfig = this.getConfig();

        this.pens = PenArray.fromHTML(`
            <div id="calender-date-widget-${this.id}" style="display: flex; align-items: center;">
                <span id="calender-date-${this.id}"></span>
            </div>
        `);

        const calenderDateWidgetPen = `calender-date-widget-${this.id}`;
        this.applyTextOptions(
            this.pens.getById(calenderDateWidgetPen),
            config,
        );

        this.setDate();

        if (!this.displayInstance && !this.editorInstance) {
            this.setPosition(this.pens.getById(calenderDateWidgetPen));
            this.setParent(this.pens.getById(calenderDateWidgetPen));
        }
        return this.pens;
    }

    setDate() {
        const dateDisplayPen = this.pens.getById(`calender-date-${this.id}`);
        const now = new Date();
        const date = now.getDate().toString();
        dateDisplayPen.element.textContent = date;
    }

    static defaultConfig(): CalenderDateData {
        return {
            WidgetRecordId: "calender-date-widget",
            description: "Current calendar date",
            enabled: true,
            position: { x: 0.5, y: 0, scaleX: 1, scaleY: 1 },
            data: {
                ...TextOptionMixin.defaultOptions(),
            },
        };
    }
    static getWidgetOptionsRecord(): WidgetOptionsRecord {
        return {
            ...TextOptionMixin.getWidgetOptionsRecord(),
        };
    }
}

function register() {
    WidgetRegistry.registerWidget("calender-date-widget", CalenderDateWidget);
}

export default register();

export type CalenderDateData = WidgetConfig<{
    color: string;
    fontFamily: string;
    fontWeight: string;
}>;

export interface CalenderDateWidget extends TextOptionMixin { }

applyMixins(CalenderDateWidget, [TextOptionMixin]);
