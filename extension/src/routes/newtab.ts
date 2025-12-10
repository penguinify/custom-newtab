import { UserConfig } from "../types";
import { AsyncRoute, Components, Elements, Pen, PenArray } from "../framework/penexutils";
import { getUserConfig } from "../config";

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

        let pens = PenArray.fromHTML(`
<div class="flex flex-col items-center justify-center h-full w-full" id="newtab-container">
</div>
<div class="fixed bottom-4 right-4 z-10">
<button id="options-button" class="underline text-sm" style="color: ${this.settings.colors.textColor};">options</button>
</div>


`);

        let container = pens.getById('newtab-container');

        this._applyBackgroundColor(container);

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

    private _applyBackgroundColor(pen: Pen<Elements>) {
        switch (this.settings.background.type) {
            case "color":
                pen.element.style.backgroundColor = this.settings.background.hex;
                break;
            case "image":
                pen.element.style.backgroundImage = `url('${this.settings.background.url}')`;
                pen.element.style.backgroundSize = 'cover';
                pen.element.style.backgroundPosition = 'center';
                break;
            case "video":
                let videoPen = PenArray.fromHTML(`
<video autoplay muted loop id="background-video" class="fixed top-0 left-0 w-full h-full object-cover z-0">
<source src="${this.settings.background.url}" type="video/mp4">
</video>

`);
                videoPen[0].setParent(pen);
                break;
            case "customcss":
                pen.element.style.cssText = this.settings.background.css;
                break;
        }

    }



}
