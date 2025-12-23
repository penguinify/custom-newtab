import { getUserConfig, saveUserConfig } from "../../../data/config";
import { WidgetRegistry } from "../../../data/widgetmanager";
import {
    type Component,
    type Elements,
    type Pen,
    PenArray,
} from "../../../framework/penexutils";
import type { SettingOptions, Widget } from "../../../types";
import { ButtonInput } from "../inputs/buttonInput.component";
import { CheckboxInput } from "../inputs/checkboxInput.component";
import { TextInput } from "../inputs/textInput.component";
import { WidgetDisplay } from "./widgetDisplay.component";
import { WidgetEditorRenderer } from "./widgetEditorRenderer.component";

export class WidgetsDrawer implements Component {
    pens: PenArray = new PenArray();
    widgetDrawerPen!: Pen<Elements>;
    widgetListPen!: Pen<Elements>;

    render(): PenArray {
        this.pens = PenArray.fromHTML(`
        <div id="widgets-drawer" class="absolute left-0 top-0 h-full w-1/4 bg-black p-8 border-r-2 border-white overflow-y-auto z-50 text-white">
            <h2 class="text-2xl mb-5">Your Widgets</h2>
            <div class="flex flex-col space-y-2 mt-4" id="widget-list"></div>
        </div>
        `);

        this.widgetDrawerPen = this.pens.getById("widgets-drawer");
        this.widgetListPen = this.pens.getById("widget-list");

        this.createSettings();
        this.populateWidgetList();

        this.widgetListPen.setParent(this.widgetDrawerPen, 100);

        return this.pens;
    }

    private populateWidgetList() {
        for (const [, widgetConstructor] of WidgetRegistry) {
            if (typeof widgetConstructor === "function") {
                new WidgetDisplay(
                    this.widgetListPen,
                    widgetConstructor as new (data: any) => Widget<any>,
                ).render();
            }
        }
    }

    private createSettings() {
        this.createSnappingControls();
        this.createImportExportButtons();

        this.createSaveButton();
    }

    private createSaveButton() {
        const saveButton = new ButtonInput(this.widgetDrawerPen, {
            type: "button",
            description: "Save your current widget configuration",
            label: "Save Widgets",
            onClick: () => WidgetEditorRenderer.saveAllToOptions(),
        } as SettingOptions);
        saveButton.render();
    }

    private createSnappingControls() {
        const snappingCheckbox = new CheckboxInput(this.widgetDrawerPen, {
            type: "checkbox",
            label: "Enable grid snapping",
            description: "this affects scaling and positioning of widgets",
            defaultValue: true,
            onChange: (value: boolean) => {
                WidgetEditorRenderer.SnapToGrid = value;
            },
        } as SettingOptions);

        const snappingValue = new TextInput(this.widgetDrawerPen, {
            type: "text",
            label: "Grid size",
            description: "Size of the grid for snapping (in pixels)",
            defaultValue: "10",
            onChange: (value: string) => {
                const intValue = parseInt(value, 10);
                if (!Number.isNaN(intValue) && intValue > 0) {
                    WidgetEditorRenderer.SnapInterval = intValue;
                }
            },
        } as SettingOptions);

        snappingCheckbox.render();
        snappingValue.render();
        snappingValue.pens[0].element.style.marginBottom = "32px";
    }

    private createImportExportButtons() {
        const exportButton = new ButtonInput(this.widgetDrawerPen, {
            type: "button",
            description: "Export your current configuration as JSON",
            label: "Export Widgets",
            onClick: this.exportWidgets.bind(this),
        } as SettingOptions);

        const importButton = new ButtonInput(this.widgetDrawerPen, {
            type: "button",
            description: "Import widget configuration from a JSON file",
            label: "Import Widgets",
            onClick: this.importWidgets.bind(this),
        } as SettingOptions);

        importButton.render();
        exportButton.render();
        exportButton.pens[0].element.style.marginTop = "16px";
        exportButton.pens[0].element.style.marginBottom = "24px";
    }

    private async exportWidgets() {
        WidgetEditorRenderer.saveAllToOptions();
        const userConfig = await getUserConfig();
        const dataStr = JSON.stringify(userConfig, null, 2);
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
        const exportFileDefaultName = "widgets-config.json";

        const linkElement = document.createElement("a");
        linkElement.setAttribute("href", dataUri);
        linkElement.setAttribute("download", exportFileDefaultName);
        document.body.appendChild(linkElement);
        linkElement.click();
        document.body.removeChild(linkElement);
    }

    private async importWidgets() {
        try {
            const file = await this.promptFileOpen();
            if (!file) return;

            const fileContent = await this.readFileAsText(file);
            const importedConfig = JSON.parse(fileContent);
            await saveUserConfig(importedConfig);
            window.location.reload();
        } catch (error) {
            console.error("Failed to import widgets configuration:", error);
        }
    }

    private promptFileOpen(): Promise<File | null> {
        return new Promise((resolve) => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "application/json";
            input.style.display = "none";

            input.onchange = () => {
                const file = input.files?.[0] ?? null;
                resolve(file);
                document.body.removeChild(input);
            };

            input.oncancel = () => {
                resolve(null);
                document.body.removeChild(input);
            };

            document.body.appendChild(input);
            input.click();
        });
    }

    private readFileAsText(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target && typeof event.target.result === "string") {
                    resolve(event.target.result);
                } else {
                    reject(new Error("Failed to read file."));
                }
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    }
}
