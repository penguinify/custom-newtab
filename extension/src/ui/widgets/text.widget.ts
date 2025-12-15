

import { Elements, Pen, PenArray } from "../../framework/penexutils";
import { TextData, UserConfig, Widget, WidgetConfig } from "../../types";
import { WidgetRegistry } from "../../widgetmanager";

export class TextWidget extends Widget<WidgetConfig<TextData>> {

    constructor(data: WidgetConfig<TextData>) {
        super(data);
    }

    render(): PenArray {
        // idk why, but typescript is being weird in this file, just ignore the errors, and all the other ones because it is not worth the time
        let config: UserConfig = this.getConfig();

        let fontFamily: string;
        let color: string;
        let fontWeight: string;
        let fontSize: string;
        let fontStyle: string;

        fontFamily = this.data.data.fontFamily.trim() === "" ? config.fontFamily : this.data.data.fontFamily;
        color = this.data.data.color.trim() === "" ? config.colors.textColor : this.data.data.color;
        fontWeight = this.data.data.fontWeight.trim() === "" ? "normal" : this.data.data.fontWeight;
        fontSize = this.data.data.fontSize && this.data.data.fontSize > 0 ? `${this.data.data.fontSize}px` : "16px";
        fontStyle = this.data.data.fontStyle.trim() === "" ? "normal" : this.data.data.fontStyle;

        this.pens = PenArray.fromHTML(`
        <div id="text-widget-${this.id}" style="font-family: ${config.fontFamily}; color: ${config.colors.textColor}; font-weight: ${fontWeight}; font-size: ${fontSize}; font-style: ${fontStyle}; line-height: 0;">
            <span style="font-size: 1.5rem;">${this.data.data.textContent || "Sample Text"}</span>
        </div>
        `);




        if (!this.displayInstance && !this.editorInstance) {

            this.setParent(this.pens.getById(`text-widget-${this.id}`));
            this.setPosition(this.pens.getById(`text-widget-${this.id}`));
        } else {
        }

        // why does it return something? who knows and who will ever know
        return this.pens;
    }


    static defaultConfig(): WidgetConfig<{}> {
        return {
            WidgetRecordId: "text-widget",
            description: "display custom text",
            enabled: true,
            position: {
                x: 0,
                y: 0,
                scale: 1
            },
            data: {
                textContent: "penguinify",
                fontWeight: "normal",
                fontFamily: "Arial, sans-serif",
                fontSize: 16,
                color: "",
                fontStyle: ""


            }
        };
    }



}

function register() {
    WidgetRegistry.registerWidget("text-widget", TextWidget);
}

export default register();

