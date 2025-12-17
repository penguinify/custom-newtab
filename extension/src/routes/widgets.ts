import { UserConfig, WidgetConfig } from "../types";
import { TextData } from "../ui/widgets/text.widget";
import { AsyncRoute, Components, Pen, PenArray, elementGlobals } from "../framework/penexutils";
import { getUserConfig } from "../data/config";
import { alterHex, applyBackgroundColor, setFavicon, setTabTitle } from "../utils";
import { WidgetsDrawer } from "../ui/components/widgetsComponents/widgetsDrawer.component";
import { DescriptionBox } from "../ui/components/descriptionBox.component";
import { WidgetRegistry } from "../data/widgetmanager";
import { WidgetDisplay } from "../ui/components/widgetsComponents/widgetDisplay.component";
import { WidgetEditorRenderer } from "../ui/components/widgetsComponents/widgetEditorRenderer.component";
import { TextWidget } from "../ui/widgets/text.widget";


export class Widgets extends AsyncRoute {
    pens: PenArray = new PenArray();
    pensAsync: Promise<PenArray>;
    path = '/widgets.html';
    components: Components = new Components();
    widgetsDrawerComponent!: WidgetsDrawer;

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
<div class="flex flex-col items-center justify-center h-3/4 w-3/4 absolute right-0 text-white" id="editor-container">
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
            const editorContainer = this.pens.getById('editor-container');
            Widgets.previewDOMRect = editorContainer.element.getBoundingClientRect();

            editorContainer.element.oncontextmenu = (e) => {
                e.preventDefault();
                return false;
            };

            this._loadSavedWidgets();


        }, 0);

        return pens;
    }

    onRoute(): void {

        let container = this.pens.getById('editor-container');
        applyBackgroundColor(container, this.settings);

        let main_element = document.body as HTMLElement;
        main_element.style.fontFamily = this.settings.fontFamily || 'Arial, sans-serif';
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
