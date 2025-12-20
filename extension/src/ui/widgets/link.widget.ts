import { PenArray } from "../../framework/penexutils";
import { UserConfig, Widget, WidgetConfig, WidgetOptionsRecord } from "../../types";
import { WidgetRegistry } from "../../data/widgetmanager";
import { ColorOption, TextOption, CheckboxOption } from "../widgetoptions";
import { TextOptionMixin } from "../widgetmixins";
import { applyMixins } from "../../utils/mixins";

export class LinkWidget extends Widget<WidgetConfig<LinkData>> {
    constructor(data: WidgetConfig<LinkData>) {
        super(data);
    }

    render(): PenArray {
        let config: UserConfig = this.getConfig();

        let textDecoration: string;
        let url: string;
        let openInNewTab: boolean;

        textDecoration = this.data.data.textDecoration?.trim() === "" ? "underline" : this.data.data.textDecoration;
        url = this.data.data.url?.trim() === "" ? "penguinify.github.io" : this.data.data.url;
        openInNewTab = typeof this.data.data.openInNewTab === "boolean" ? this.data.data.openInNewTab : false;

        const targetAttr = openInNewTab ? ` target="_blank" rel="noopener noreferrer"` : "";

        this.pens = PenArray.fromHTML(`
        <div id="text-widget-${this.id}">
            <a href="${url}"${targetAttr}>
                ${this.data.data.textContent || "Sample Text"}
            </a>
        </div>
        `);

        if (!this.displayInstance && !this.editorInstance) {
            this.setPosition(this.pens.getById(`text-widget-${this.id}`));
            this.setParent(this.pens.getById(`text-widget-${this.id}`));
        } else {
            this.pens[1].element.style.pointerEvents = "none";
        }

        this.applyTextOptions(this.pens.getById(`text-widget-${this.id}`), config);

        // Apply link-specific styles to the <a> element
        const linkElem = this.pens.getById(`text-widget-${this.id}`).asPenArray().querySelector("a");
        if (linkElem) {
            linkElem.element.style.color = "inherit";
            linkElem.element.style.textDecoration = textDecoration;
        }

        return this.pens;
    }

    static defaultConfig(): WidgetConfig<{}> {
        return {
            WidgetRecordId: "link-widget",
            description: "display custom link",
            enabled: true,
            position: {
                x: 0,
                y: 0,
                scaleX: 0.5,
                scaleY: 0.5,
            },
            data: {
                textContent: "penguinify",
                ...TextOptionMixin.defaultOptions(),
                url: "penguinify.github.io",
                openInNewTab: false,
                textDecoration: "underline"
            }
        };
    }

    static getWidgetOptionsRecord(): WidgetOptionsRecord {
        return {
            textContent: new TextOption("Text Content", "The text to display"),
            ...TextOptionMixin.getWidgetOptionsRecord(),
            url: new TextOption("URL", "The URL to link to"),
            openInNewTab: new CheckboxOption("Open in New Tab", "Open the link in a new browser tab"),
            textDecoration: new TextOption("Text Decoration", "CSS text-decoration property (e.g., underline, none)")
        };
    }
}

function register() {
    WidgetRegistry.registerWidget("link-widget", LinkWidget);
}
export default register();

export type LinkData = {
    textContent: string;
    fontWeight: string;
    fontFamily: string;
    fontSize: number;
    color: string;
    fontStyle: string;
    customCSS: string;
    url: string;
    openInNewTab: boolean;
    textDecoration: string;
};

export interface LinkWidget extends TextOptionMixin {}
applyMixins(LinkWidget, [TextOptionMixin]);
