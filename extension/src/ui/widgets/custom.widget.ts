// build anything!

import { WidgetRegistry } from "../../data/widgetmanager";
import { PenArray } from "../../framework/penexutils";
import { Widget, UserConfig, WidgetConfig, WidgetOptionsRecord } from "../../types";
import { TextAreaOption } from "../widgetoptions";

export class CustomWidget extends Widget<CustomWidgetData> {

    render(): PenArray {
        const config: UserConfig = this.getConfig();
        this.pens = PenArray.fromHTML(this.data.data.htmlContent || `<div></div>`);
        
        // give the pens as context to the javascript code
        let pens = this.pens;
        try {
            
            const func = new Function('pens', this.data.data.javascriptCode || '');
            func(pens);
        } catch (error) {
            console.error("Error executing custom widget JavaScript code:", error);
        }
        
        if (!this.displayInstance && !this.editorInstance) {
            this.setPosition(this.pens[0]);
            this.setParent(this.pens[0]);
        }

        return this.pens;
    }

    static defaultConfig(): CustomWidgetData {
        return {
            WidgetRecordId: "custom-widget",
            description: "A customizable widget with HTML and JavaScript",
            enabled: true,
            position: { x: 0.5, y: 0, scaleX: 1, scaleY: 1 },
            data: {
                htmlContent: `<div id="custom-widget-${this.id}">custom widget (cool)</div>`,
                javascriptCode: `// You can manipulate the pens here\nconsole.log(pens);`,
            },
        };
    }

    static getWidgetOptionsRecord(): WidgetOptionsRecord {
        return {
            htmlContent: new TextAreaOption(
                "HTML Content",
                "The HTML content to display in the widget.",
            ),
            javascriptCode: new TextAreaOption(
                "JavaScript Code",
                "Custom JavaScript code to manipulate the widget's pens.",
            ),
        };
    }
}

function register() {
    WidgetRegistry.registerWidget("custom-widget", CustomWidget);
}

export default register();

export type CustomWidgetData = WidgetConfig<{
    htmlContent: string;
    javascriptCode: string;

}>
