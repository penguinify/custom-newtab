import { getUserConfig } from "../data/config";
import { WidgetRegistry } from "../data/widgetmanager";
import {
	AsyncRoute,
	Components,
	elementGlobals,
	Pen,
	PenArray,
} from "../framework/penexutils";
import type { UserConfig } from "../types";
import { DescriptionBox } from "../ui/components/descriptionBox.component";
import { WidgetEditorRenderer } from "../ui/components/widgetsComponents/widgetEditorRenderer.component";
import { WidgetsDrawer } from "../ui/components/widgetsComponents/widgetsDrawer.component";
import { applyBackgroundColor } from "../utils/color";
import { setFavicon, setTabTitle } from "../utils/tabfeatures";

export class Widgets extends AsyncRoute {
	pens: PenArray = new PenArray();
	pensAsync: Promise<PenArray>;
	path = "/widgets.html";
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

		setTabTitle(this.settings.tabTitle || "new tab");
		setFavicon();

		const pens = PenArray.fromHTML(`
<div class="flex flex-col items-center justify-center h-3/4 w-3/4 absolute right-0 text-white" id="editor-container">
</div>


`);

		const container = pens.getById("editor-container");
		container.setParent(elementGlobals.mainApp);

		WidgetEditorRenderer.WidgetEditorInstances = [];

		this.widgetsDrawerComponent = new WidgetsDrawer();

		this.components.add(this.widgetsDrawerComponent);

		this._addDescriptionBox();

		setTimeout(() => {
			// for some reason this is needed to get the correct rect, idk why, chromes webtools are so broken
			const editorContainer = this.pens.getById("editor-container");
			Widgets.previewDOMRect = editorContainer.element.getBoundingClientRect();

			editorContainer.element.oncontextmenu = (e) => {
				e.preventDefault();
				return false;
			};
			document.addEventListener("keydown", (e: KeyboardEvent) => {
				if (
					e.key === "Delete" ||
					(e.key === "Backspace" &&
						(e.target as HTMLElement).tagName !== "INPUT" &&
						(e.target as HTMLElement).tagName !== "TEXTAREA")
				) {
					WidgetEditorRenderer.WidgetEditorInstances.forEach((instance) => {
						if (WidgetEditorRenderer.instanceSelected === instance) {
							instance.destroy();
							WidgetEditorRenderer.instanceSelected = null;
						}
					});
				}
			});

			this._loadSavedWidgets();
		}, 0);

		return pens;
	}

	onRoute(): void {
		const container = this.pens.getById("editor-container");
		applyBackgroundColor(container, this.settings);

		const main_element = document.body as HTMLElement;
		main_element.style.fontFamily =
			this.settings.fontFamily || "Arial, sans-serif";
	}

	private _addDescriptionBox() {
		this.components.add(new DescriptionBox());
	}

	private _loadSavedWidgets() {
		const widgets = this.settings.widgets || [];
		for (const widgetConfig of widgets) {
			const widgetClass = WidgetRegistry.getWidget(widgetConfig.WidgetRecordId);
			if (widgetClass) {
				new WidgetEditorRenderer<typeof widgetConfig>(
					Pen.fromElement(document.body),
					widgetClass,
					widgetConfig,
				);
			}
		}
	}
}
