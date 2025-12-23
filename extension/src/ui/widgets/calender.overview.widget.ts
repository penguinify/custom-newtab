import { WidgetRegistry } from "../../data/widgetmanager";
import { PenArray } from "../../framework/penexutils";
import {
    Widget,
    type UserConfig,
    type WidgetConfig,
    type WidgetOptionsRecord,
} from "../../types";
import { applyMixins } from "../../utils/mixins";
import { TextOptionMixin, BackgroundOptionMixin } from "../widgetmixins";
import { CheckboxOption, ColorOption, TextOption } from "../widgetoptions";

export class CalenderOverviewWidget extends Widget<CalenderOverviewData> {

    render(): PenArray {
        const config: UserConfig = this.getConfig();

        this.pens = PenArray.fromHTML(`
            <div id="calender-overview-widget-${this.id}" style="display: flex; flex-direction: column; align-items: center;">
                <div id="calender-overview-${this.id}" class="calender-overview"></div>
            </div>
        `);

        const calenderOverviewWidgetPen = `calender-overview-widget-${this.id}`;

        this.applyTextOptions(
            this.pens.getById(calenderOverviewWidgetPen),
            config,
        );


        this.renderCalendar();

        if (!this.displayInstance && !this.editorInstance) {
            this.setPosition(this.pens.getById(calenderOverviewWidgetPen));
            this.setParent(this.pens.getById(calenderOverviewWidgetPen));
        }

        if (this.displayInstance) {
            this.pens.getById(calenderOverviewWidgetPen).element.style.transform = "scale(0.7)";
        }

        return this.pens;
    }

    renderCalendar() {
        const calendarPen = this.pens.getById(`calender-overview-${this.id}`);
        const data = this.data.data;
        const now = new Date();

        if (data.viewType === 'week') {
            this.renderWeekView(calendarPen, now);
        } else {
            this.renderMonthView(calendarPen, now);
        }
    }

    renderWeekView(calendarPen: any, currentDate: Date) {
        const startOfWeek = this.getStartOfWeek(currentDate);

        let weekPen = PenArray.fromHTML('<div class="week-view" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; text-align: center;">')[0];

        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(startOfWeek);
            dayDate.setDate(startOfWeek.getDate() + i);
            const isToday = this.isSameDay(dayDate, currentDate);



            let pens = PenArray.fromHTML(`
                <div style="padding: 4px; aspect-ratio: 1 / 1; border-radius: ${this.data.data.borderRadius || 0}px;">
                    <div>${dayDate.getDate()}</div>
               </div>
            `);

            if (isToday) {
                this.applyBackgroundOptions(
                    pens[0],
                    this.getConfig()
                )
            }

            pens[0].setParent(weekPen);


        }

        weekPen.setParent(calendarPen);

    }

    renderMonthView(calendarPen: any, currentDate: Date) {
        const data = this.data.data;
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const startDate = this.getStartOfWeek(firstDayOfMonth);


        let monthPen = PenArray.fromHTML('<div class="month-view" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; text-align: center;"></div>')[0];

        // Header row
        for (let i = 0; i < 7; i++) {
            const headerPen = PenArray.fromHTML(`
                <div style="font-weight: bold; padding: 8px;"></div>
            `)[0];
            headerPen.setParent(monthPen);
        };

        // Calendar days
        const totalDays = Math.ceil((lastDayOfMonth.getDate() + firstDayOfMonth.getDay()) / 7) * 7;

        for (let i = 0; i < totalDays; i++) {
            const dayDate = new Date(startDate);
            dayDate.setDate(startDate.getDate() + i);

            const isCurrentMonth = dayDate.getMonth() === month;
            const isToday = this.isSameDay(dayDate, currentDate);

            const pen = PenArray.fromHTML(`
                <div style="
                    padding: 8px;
aspect-ratio: 1 / 1;
border-radius: ${this.data.data.borderRadius || 0}px;
${isToday ? `background-color: ${this.data.data.backgroundColor};` : ''}
${!isCurrentMonth ? 'opacity: 0.3;' : ''}
${data.showWeekends && (dayDate.getDay() === 0 || dayDate.getDay() === 6) ? `color: ${data.weekendColor};` : ''}
                ">
                    ${dayDate.getDate()}
                </div>
"
            `);

            pen[0].setParent(monthPen);

        }




        monthPen.setParent(calendarPen);
    }

    getStartOfWeek(date: Date): Date {
        const startOfWeek = new Date(date);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day;
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);
        return startOfWeek;
    }

    isSameDay(date1: Date, date2: Date): boolean {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    }

    static defaultConfig(): CalenderOverviewData {
        return {
            WidgetRecordId: "calender-overview-widget",
            description: "Calendar overview with week or month view",
            enabled: true,
            position: { x: 0.5, y: 0.5, scaleX: 0.1, scaleY: 0.1 },
            data: {
                viewType: "week",
                useShortDayNames: false,
                currentDayHighlight: "#007bff",
                showWeekends: true,
                borderRadius: 4,
                weekendColor: "#ff6b6b",
                ...TextOptionMixin.defaultOptions(),
                backgroundColor: "#00bbff"
            },
        };
    }

    static getWidgetOptionsRecord(): WidgetOptionsRecord {
        return {
            viewType: new TextOption(
                "View Type",
                "Select calendar view type: 'week' or 'month'",
            ),
            useShortDayNames: new CheckboxOption("Short Day Names", "Use abbreviated day names (S, M, T...)"),
            borderRadius: new TextOption("Border Radius", "Border radius for day cells"),
            showWeekends: new CheckboxOption("Highlight Weekends", "Show weekends in different color"),
            weekendColor: new ColorOption("Weekend Color", "Text color for weekend days"),
            ...TextOptionMixin.getWidgetOptionsRecord(),
            ...BackgroundOptionMixin.getWidgetOptionsRecord(),
        };
    }
}

function register() {
    WidgetRegistry.registerWidget("calender-overview-widget", CalenderOverviewWidget);
}

export default register();

export type CalenderOverviewData = WidgetConfig<{
    viewType: "week" | "month";
    useShortDayNames: boolean;
    currentDayHighlight: string;
    showWeekends: boolean;
    weekendColor: string;
} & ReturnType<typeof TextOptionMixin.defaultOptions> & ReturnType<typeof BackgroundOptionMixin.defaultOptions>>;

export interface CalenderOverviewWidget extends TextOptionMixin, BackgroundOptionMixin { }

applyMixins(CalenderOverviewWidget, [TextOptionMixin, BackgroundOptionMixin]);
