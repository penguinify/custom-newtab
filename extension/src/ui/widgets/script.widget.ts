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
import { CheckboxOption, TextAreaOption, TextOption } from "../widgetoptions";

export class ScriptWidget extends Widget<WidgetConfig<ScriptData>> {
    render(): PenArray {
        // idk why, but typescript is being weird in this file, just ignore the errors, and all the other ones because it is not worth the time

        const config: UserConfig = this.getConfig();

        let error: string | void = undefined;
        if (this.data.data.acknowledged) {

            error = this.evaluateScript(this.data.data.scriptContent || "");
        }

        this.pens = PenArray.fromHTML(`
        <div id="script-widget-${this.id}" >
            <span style="font-size:7px; mix-blend-mode: difference; color:white;">${this.data.data.previewText || "Script Widget (Doesn't appear in the new tab)"} :: ${error ? `Error: ${error}` : "Executed Successfully"}</span>
        </div>
        `);


        // no parent/setposition to worry about because this widget does not appear in the new tab

        // why does it return something? who knows and who will ever know
        return this.pens;
    }

    private evaluateScript(script: string): string | void {
        try {
            eval(script);
        } catch (e) {
            return e;
        }
    }

    static defaultConfig(): WidgetConfig<{}> {
        return {
            WidgetRecordId: "script-widget",
            description: "A widget that executes custom JavaScript code",
            enabled: true,
            position: {
                x: 0,
                y: 0,
                scaleX: 0.5,
                scaleY: 0.5,
            },
            data: {
                previewText: "Script Widget (Doesn't appear in the new tab)",
                acknowledged: false,
                scriptContent: "",
            },
        };
    }
    static getWidgetOptionsRecord(): WidgetOptionsRecord {
        return {
            previewText: new TextOption(
                "Preview Text",
                "The text to display in the widget preview",
            ),
            acknowledged: new CheckboxOption(
                "Acknowledge Risks",
                "EXECUTING RANDOM SCRIPTS ARE REALLY DANGEROUS. DONT CONSIDER USING USE THIS WIDGET UNLESS **YOU KNOW EXACTLY WHAT THE JS IS DOING**"
            ),
            scriptContent: new TextAreaOption(
                "Script Content",
                "The script content to execute",
            )
        };
    }
}

function register() {
    WidgetRegistry.registerWidget("script-widget", ScriptWidget);
}

export default register();
export type ScriptData = WidgetConfig<{
    previewText: string;
    acknowledged: boolean;
    scriptContent: string;
}>;


