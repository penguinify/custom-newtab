import { TabWrapper, UserConfig } from "../types";
import { AsyncRoute, Components, Elements, Pen, PenArray } from "../framework/penexutils";
import { getUserConfig, setPathInUserConfig } from "../data/config";
import { OptionTab } from "../ui/components/options/optionTab.component";
import { OptionNavigation } from "../ui/components/options/optionNavigation.component";
import { applyBackgroundColor, setFavicon, setTabTitle } from "../utils";
import { RouterRendererWrapperComponent } from "../ui/components/routerRendererWrapper.component";
import { NewTab } from "./newtab";
import { DescriptionBox } from "../ui/components/descriptionBox.component";
import { router } from "..";



export class Options extends AsyncRoute {
    pens: PenArray = new PenArray();
    pensAsync: Promise<PenArray>;
    path = '/options.html';
    components: Components = new Components();
    tabs: TabWrapper[] = [];

    settings!: UserConfig;
    previewWrapper!: RouterRendererWrapperComponent;

    constructor() {
        super();

        this.pensAsync = this.renderAsync();

    }


    async renderAsync(): Promise<PenArray> {
        this.settings = await getUserConfig();

        document.body.style.setProperty('color', this.settings.colors.textColor || '#FFFFFF', 'important');

        setTabTitle(this.settings.tabTitle + " - options" || 'options');
        setFavicon();

        let pens = PenArray.fromHTML(
            `
<div class="flex flex-row items-center justify-center h-full w-full" id="options-container">
<div class="flex flex-row w-1/2 h-1/2" id="newtab-container">
</div>
</div>
`);
        this.pens = pens;
        let container = pens.getById('options-container');

        applyBackgroundColor(container, this.settings);


        this._createOptionsTabs();
        this._addDescriptionBox();

        window.addEventListener('userConfigUpdated', async () => {
            this.settings = await getUserConfig();
            document.body.querySelectorAll('video').forEach(video => {
                video.remove();
            });
            applyBackgroundColor(container, this.settings);
            document.body.style.setProperty('color', this.settings.colors.textColor || '#FFFFFF', 'important');
            this.previewWrapper.renderAsync();
        });


        return pens;
    }

    private _generatePreview() {
        let previewRoute = new NewTab();
        this.previewWrapper = new RouterRendererWrapperComponent(
            this.pens.getById('options-container'),
            previewRoute,
            'w-1/3 h-1/3 rounded-lg border-2 border-white'
        );

        this.previewWrapper.renderAsync()
    }

    private _addDescriptionBox() {
        this.components.add(new DescriptionBox());
    }


    private _createOptionsTabs() {

        const generalTab = new OptionTab([
            {
                type: 'text',
                label: 'Tab title',
                description: 'Set the title of the new tab page.',
                defaultValue: this.settings.tabTitle,
                onChange: this._updateUserConfig.bind(this, ['tabTitle']),
            },
            {
                type: 'file',
                label: 'Upload Favicon',
                description: 'Upload a custom favicon for the new tab page.',
                defaultValue: '',
                fileValue: '',
                path: ['tab_favicon']
            },
            {
                type: 'text',
                label: 'Font Family',
                description: 'Set the font family for the new tab page.',
                defaultValue: this.settings.fontFamily,
                onChange: this._updateUserConfig.bind(this, ['fontFamily']),
            },
            {
                type: 'checkbox',
                label: 'Hide options button unless hovered',
                description: 'Hide the options button on the new tab page unless the mouse is hovering over it.',
                defaultValue: this.settings.hideOptionsButtonUnlessHovered,
                onChange: this._updateUserConfig.bind(this, ['hideOptionsButtonUnlessHovered']),
            }
        ], this.pens.getById('newtab-container'), 'general');
        const appearanceTab = new OptionTab([
            {
                type: 'colorpicker',
                label: 'Text Color',
                description: 'Select the text color for the new tab page.',
                defaultValue: this.settings.colors.textColor,
                onChange: this._updateUserConfig.bind(this, ['colors', 'textColor']),
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
                            onChange: this._updateUserConfig.bind(this, ['background', 'hex']),
                        }
                    ],
                    'image': [
                        {
                            type: 'text',
                            label: 'Background Image URL',
                            description: 'Enter the URL of the background image.',
                            defaultValue: this.settings.background.type === 'image' ? this.settings.background.url : '',
                            onChange: this._updateUserConfig.bind(this, ['background', 'url']),
                        },
                        {
                            type: 'text',
                            label: 'Additional CSS',
                            description: 'Enter additional CSS to apply to the background image.',
                            defaultValue: this.settings.background.type === 'image' ? this.settings.background.css : '',
                            onChange: this._updateUserConfig.bind(this, ['background', 'css']),
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
                            onChange: this._updateUserConfig.bind(this, ['background', 'fallbackColor']),
                        }
                    ],
                    'customcss': [
                        {
                            type: 'text',
                            label: 'Custom CSS',
                            description: 'Enter custom CSS for the new tab page.',
                            defaultValue: this.settings.background.type === 'customcss' ? this.settings.background.css : '',
                            onChange: this._updateUserConfig.bind(this, ['background', 'css']),
                        }
                    ]
                }

            }
        ], this.pens.getById('newtab-container'), 'appearance');
        const widgetsTab = new OptionTab([
            {
                type: 'button',
                label: 'Manage Widgets',
                description: 'Open the widget management interface.',
                onClick: () => {
                    try {
                        
                    window.location.href = chrome.runtime.getURL('widgets.html');
                    } catch (error) {
                        window.location.href = 'widgets.html'; 
                    }
                }
            }

        ], this.pens.getById('newtab-container'), 'widgets');

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
                id: 'widggets',
                label: 'Widgets',
                optionTab: widgetsTab
            }
        ]

        const searchParams = new URLSearchParams(window.location.search);
        const activeTabId = searchParams.get('tab') || 'general';

        let optionNavigation = new OptionNavigation(this.tabs, this.pens.getById('newtab-container'), activeTabId);
        this.components.add(optionNavigation);

        this.components.add(generalTab);
        this.components.add(appearanceTab);
        this.components.add(widgetsTab);


    }

    onRoute(): void {
        let main_element = document.body.children[0] as HTMLElement;
        main_element.style.fontFamily = this.settings.fontFamily || 'Arial, sans-serif';
    }


    private _updateUserConfig<T>(path: string[], value: T): void {
        setPathInUserConfig(path, value);
    }



}
