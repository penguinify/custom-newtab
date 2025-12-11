import { TabWrapper, UserConfig } from "../types";
import { AsyncRoute, Components, Elements, Pen, PenArray } from "../framework/penexutils";
import { getUserConfig } from "../config";
import { OptionTab } from "../ui/components/optionTab.component";
import { OptionNavigation } from "../ui/components/optionNavigation.component";
import { applyBackgroundColor, setFavicon, setTabTitle } from "../utils";

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

        document.body.style.setProperty('color', this.settings.colors.textColor || '#FFFFFF', 'important');

        setTabTitle(this.settings.tabTitle + " - options" || 'options');
        setFavicon(this.settings.tabFaviconUrl || '');

        let pens = PenArray.fromHTML(
            `
<div class="flex flex-row items-center justify-center h-full w-full" id="options-container">
<div class="flex flex-row w-1/2 h-1/2" id="newtab-container">
</div>
</div>
`);

        let container = pens.getById('options-container');

        applyBackgroundColor(container, this.settings);


        this._createOptionsTabs(pens);


        return pens;
    }

    private _createOptionsTabs(pens: PenArray) {

        const generalTab = new OptionTab([
            {
                type: 'text',
                label: 'Tab title',
                description: 'Set the title of the new tab page.',
                defaultValue: this.settings.tabTitle,
                path: ['tabTitle']
            },
            {
                type: 'text',
                label: 'Favicon URL',
                description: 'Set the URL of the favicon for the new tab page.',
                defaultValue: this.settings.tabFaviconUrl,
                path: ['tabFaviconUrl']
            },
            {
                type: 'text',
                label: 'Font Family',
                description: 'Set the font family for the new tab page.',
                defaultValue: this.settings.fontFamily,
                path: ['fontFamily']
            },
            {
                type: 'checkbox',
                label: 'Hide options button unless hovered',
                description: 'Hide the options button on the new tab page unless the mouse is hovering over it.',
                defaultValue: this.settings.hideOptionsButtonUnlessHovered,
                path: ['hideOptionsButtonUnlessHovered']
            }
        ], pens.getById('newtab-container'), 'general');
        const appearanceTab = new OptionTab([
            {
                type: 'colorpicker',
                label: 'Text Color',
                description: 'Select the text color for the new tab page.',
                defaultValue: this.settings.colors.textColor,
                path: ['colors', 'textColor']
            },
            {
                type: 'dropdown',
                label: 'Background Type',
                description: 'Select the type of background for the new tab page.',
                options: ['color', 'image', 'video', 'customcss'],
                defaultValue: this.settings.background.type,
                path: ['background', 'type'],
                subOptions: {
                    'color': [
                        {
                            type: 'colorpicker',
                            label: 'Background Color',
                            description: 'Select the background color for the new tab page.',
                            defaultValue: this.settings.background.type === 'color' ? this.settings.background.hex : '#000000',
                            path: ['background', 'hex']
                        }
                    ],
                    'image': [
                        {
                            type: 'text',
                            label: 'Background Image URL',
                            description: 'Enter the URL of the background image.',
                            defaultValue: this.settings.background.type === 'image' ? this.settings.background.url : '',
                            path: ['background', 'url']
                        },
                        {
                            type: 'text',
                            label: 'Additional CSS',
                            description: 'Enter additional CSS to apply to the background image.',
                            defaultValue: this.settings.background.type === 'image' ? this.settings.background.css : '',
                            path: ['background', 'css']
                        }
                    ],
                    'video': [
                        {
                            type: 'file',
                            label: 'Background Video',
                            description: 'Upload the file of the youtube video',
                            defaultValue: '',
                            fileValue: '',
                            path: ['background_video']
                        },
                        {
                            type: 'colorpicker',
                            label: 'Fallback Color',
                            description: 'Select the fallback color to display if the video fails to load.',
                            defaultValue: this.settings.background.type === 'video' ? this.settings.background.fallbackColor : '#000000',
                            path: ['background', 'fallbackColor']
                        }
                    ],
                    'customcss': [
                        {
                            type: 'text',
                            label: 'Custom CSS',
                            description: 'Enter custom CSS for the new tab page.',
                            defaultValue: this.settings.background.type === 'customcss' ? this.settings.background.css : '',
                            path: ['background', 'css']
                        }
                    ]
                }

            }
        ], pens.getById('newtab-container'), 'appearance');
        const advancedTab = new OptionTab([], pens.getById('newtab-container'), 'advanced');

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

        const searchParams = new URLSearchParams(window.location.search);
        const activeTabId = searchParams.get('tab') || 'general';

        let optionNavigation = new OptionNavigation(this.tabs, pens.getById('newtab-container'), activeTabId);
        this.components.add(optionNavigation);

        this.components.add(generalTab);
        this.components.add(appearanceTab);
        this.components.add(advancedTab);


    }

    onRoute(): void {
        let main_element = document.body.children[0] as HTMLElement;
        main_element.style.fontFamily = this.settings.fontFamily || 'Arial, sans-serif';
    }






}
