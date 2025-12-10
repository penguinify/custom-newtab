import { TabWrapper, UserConfig } from "../types";
import { AsyncRoute, Components, Elements, Pen, PenArray } from "../framework/penexutils";
import { getUserConfig } from "../config";
import { OptionTab } from "../ui/components/optionTab.component";
import { OptionNavigation } from "../ui/components/optionNavigation.component";

export class Options extends AsyncRoute {
    pens: PenArray = new PenArray();
    pensAsync: Promise<PenArray>;
    path = '/options';
    components: Components = new Components();
    tabs: TabWrapper[] = [];

    settings!: UserConfig;

    constructor() {
        super();

        this.pensAsync = this.renderAsync();

    }

    async renderAsync(): Promise<PenArray> {
        this.settings = await getUserConfig();

        let pens = PenArray.fromHTML(
            `
<div class="flex flex-row items-center justify-center h-full w-full" id="options-container">
<div class="flex flex-row w-1/2 h-1/2" id="newtab-container">
</div>
</div>
`);

        let container = pens.getById('options-container');

        this._applyBackgroundColor(container);


        this._createOptionsTabs(pens);



        return pens;
    }

    private _createOptionsTabs(pens: PenArray) {

        const generalTab = new OptionTab(new PenArray(), pens.getById('newtab-container'), 'general');
        const appearanceTab = new OptionTab(new PenArray(), pens.getById('newtab-container'), 'appearance');
        const advancedTab = new OptionTab(new PenArray(), pens.getById('newtab-container'), 'advanced');

        this.tabs = [
        {
            id: 'general',
            label: 'General',
            optionTab: generalTab
        },
            {
            id: 'appearance',
            label: 'Appearance',
            optionTab: appearanceTab
            },
            {
            id: 'advanced',
            label: 'Advanced',
            optionTab: advancedTab
            }
        ]
        let optionNavigation = new OptionNavigation(this.tabs, pens.getById('newtab-container'), 'general');
        this.components.add(optionNavigation);

        this.components.add(generalTab);
        this.components.add(appearanceTab);
        this.components.add(advancedTab);


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
                let videoPen = PenArray.fromHTML(
                    `

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
