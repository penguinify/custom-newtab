import { UserConfig } from "../types";
import { AsyncRoute, Components, Elements, Pen, PenArray } from "../framework/penexutils";
import { getUserConfig } from "../config";
import { applyBackgroundColor, setFavicon, setTabTitle } from "../utils";

export class NewTab extends AsyncRoute {
    pens: PenArray = new PenArray();
    pensAsync: Promise<PenArray>;
    path = '/';
    components: Components = new Components();

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
<div class="flex flex-col items-center justify-center h-full w-full" id="newtab-container">
</div>
<div class="fixed bottom-4 right-4 z-10">
<button id="options-button" class="underline text-sm ${this.settings.hideOptionsButtonUnlessHovered ? "opacity-0 hover:opacity-100" : ""} cursor-pointer" style="color: ${this.settings.colors.textColor};">options</button>
</div>


`);

        let container = pens.getById('newtab-container');

        applyBackgroundColor(container, this.settings);

        let optionsButton = pens.getById('options-button');
        optionsButton.element.addEventListener('click', NewTab._openOptionsPage);



        return pens;
    }

    private static _openOptionsPage() {
        if (chrome.runtime && chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        } else {
            window.open('options.html', '_blank');
        }
    }




}
