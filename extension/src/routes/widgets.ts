import { TextData, UserConfig, WidgetConfig } from "../types";
import { AsyncRoute, Components, Pen, PenArray, elementGlobals } from "../framework/penexutils";
import { getUserConfig } from "../config";
import { applyBackgroundColor, setFavicon, setTabTitle } from "../utils";
import { WidgetsDrawer } from "../ui/components/widgetsComponents/widgetsDrawer.component";
import { DescriptionBox } from "../ui/components/descriptionBox.component";
import { WidgetRegistry } from "../widgetmanager";
import { WidgetDisplay } from "../ui/components/widgetsComponents/widgetDisplay.component";
import { WidgetEditorRenderer } from "../ui/components/widgetsComponents/widgetEditorRenderer.component";
import { TextWidget } from "../ui/widgets/text.widget";


export class Widgets extends AsyncRoute {
    pens: PenArray = new PenArray();
    pensAsync: Promise<PenArray>;
    path = '/widgets.html';
    components: Components = new Components();
    widgetsDrawerComponent: WidgetsDrawer;

    static previewDOMRect: DOMRect;

    settings!: UserConfig;

    constructor() {
        super();

        this.pensAsync = this.renderAsync();
    }


    async renderAsync(): Promise<PenArray> {
        this.settings = await getUserConfig();

        setTabTitle(this.settings.tabTitle || 'new tab');
        setFavicon();

        let pens = PenArray.fromHTML(`
<div class="flex flex-col items-center justify-center h-3/4 w-3/4 absolute right-0" id="editor-container">
</div>


`);

        let container = pens.getById('editor-container');
        container.setParent(elementGlobals.mainApp);

        WidgetEditorRenderer.WidgetEditorInstances = [];

        this.widgetsDrawerComponent = new WidgetsDrawer();

        this.components.add(this.widgetsDrawerComponent);




        this._addDescriptionBox();

        setTimeout(() => {
            // for some reason this is needed to get the correct rect, idk why, chromes webtools are so broken
            Widgets.previewDOMRect = this.pens.getById('editor-container').element.getBoundingClientRect();

            this._loadSavedWidgets();


        }, 0);

        return pens;
    }

    onRoute(): void {

        let container = this.pens.getById('editor-container');
        applyBackgroundColor(container, this.settings);

        let main_element = document.body as HTMLElement;
        main_element.style.fontFamily = this.settings.fontFamily || 'Arial, sans-serif';
        document.body.style.backgroundColor = '#000000';

        document.body.style.setProperty('color', '#FFFFFF', 'important');
    }

    private _addDescriptionBox() {
        this.components.add(new DescriptionBox());
    }


    private _routeToOptions() {
        // works ig lol
        window.location.href = '/options.html';
    }

    private _loadSavedWidgets() {
        let widgets = this.settings.widgets || [];
        for (let widgetConfig of widgets) {
            let widgetClass = WidgetRegistry.getWidget(widgetConfig.WidgetRecordId);
            if (widgetClass) {
                new WidgetEditorRenderer<typeof widgetConfig>(Pen.fromElement(document.body), widgetClass, widgetConfig);

            }

        }
    }


}
