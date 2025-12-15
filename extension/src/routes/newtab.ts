import { UserConfig, Widget } from "../types";
import { AsyncRoute, Components, Pen, PenArray, elementGlobals } from "../framework/penexutils";
import { getUserConfig } from "../config";
import { applyBackgroundColor, setFavicon, setTabTitle } from "../utils";
import { WidgetEditorRenderer } from "../ui/components/widgetsComponents/widgetEditorRenderer.component";
import { WidgetRegistry } from "../widgetmanager";
import { router } from "..";


export class NewTab extends AsyncRoute {
    pens: PenArray = new PenArray();
    pensAsync: Promise<PenArray>;
    path = '/index.html';
    components: Components = new Components();

    settings!: UserConfig;
    widgets: Widget<any>[] = [];
    widgetsLoaded: boolean = false;

    constructor() {
        super();

        this.pensAsync = this.renderAsync();

    }

    async renderAsync(): Promise<PenArray> {
        this.settings = await getUserConfig();

        setTabTitle(this.settings.tabTitle || 'new tab');
        setFavicon();

        let pens = PenArray.fromHTML(`
<div class="flex flex-col items-center justify-center h-full w-full" id="newtab-container">
</div>
<div class="fixed bottom-4 right-4 z-10">
<button id="options-button" class="underline text-sm ${this.settings.hideOptionsButtonUnlessHovered ? "opacity-0 hover:opacity-100" : ""} cursor-pointer" style="color: ${this.settings.colors.textColor};">options</button>
</div>


`);

        let container = pens.getById('newtab-container');
        container.setParent(elementGlobals.mainApp);

        applyBackgroundColor(container, this.settings);

        let optionsButton = pens.getById('options-button');
        optionsButton.element.addEventListener('click', NewTab._openOptionsPage);

        window.addEventListener('resize', this._resizeHandler.bind(this));

        setTimeout(() => {
            if (!this.widgetsLoaded)
        {
            this.loadWidgets();
            this.widgetsLoaded = true;
            }
        }, 0);

        return pens;
    }

    _resizeHandler(): void {
        this.pens.getById('newtab-container').element.querySelectorAll('video').forEach(video => {
            video.remove();
        });
        applyBackgroundColor(this.pens.getById('newtab-container'), this.settings);
        for (let widget of this.widgets) {
            console.log(widget);
            if (widget.onResize) {
                // thats why I check if widget.onResize exists typescript
                widget.onResize();
            }
        }
    }

    private static _openOptionsPage() {
        if (chrome.runtime && chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        } else {
            window.open('options.html', '_blank');
        }
    }

    loadWidgets() {
        for (let widgetConfig of this.settings.widgets) {
            let widgetClass = WidgetRegistry.getWidget(widgetConfig.WidgetRecordId);
            if (widgetClass) {
                this.widgets.push(new widgetClass(widgetConfig));
                // yes, render exists typescript
                this.widgets[this.widgets.length - 1].render();

            }

        }

    }



}
