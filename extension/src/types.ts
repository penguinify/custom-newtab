import { OptionTab } from "./ui/components/optionTab.component"

export interface UserConfig {
    background: BackgroundType,
    colors: ColorOptions
    tabTitle: string
    tabFaviconUrl: string
    fontFamily: string
    hideOptionsButtonUnlessHovered: boolean
}



export type BackgroundType = {
    type: "color",
    hex: string
} | {
    type: "image",
    url: string // can be a local file path or a remote url
    css: string // additional css to apply to the image background, sanitized before applying
} | {
    type: "video",
    fallbackColor: string // color to show if video fails to load
} | {
    type: "customcss",
    css: string // raw css string, sanitized before applying
}


export type ColorOptions = {
    textColor: string,
}

export type TabWrapper = {
    id: string,
    label: string,
    optionTab: OptionTab

}

export type SettingOptions = {
    type: "colorpicker",
    label: string,
    description: string,
    defaultValue: string
    path: string[] // path in the UserConfig object
} | {
    type: "dropdown",
    label: string,
    description: string,
    options: string[],
    path: string[], // path in the UserConfig object
    subOptions?: { [key: string]: SettingOptions[] }, // key is the option value
    defaultValue: string,
} | {
    type: "text",
    label: string,
    description: string,
    defaultValue: string,
    path: string[]
} | {
    type: "file",
    label: string,
    description: string,
    defaultValue: string,
    fileValue: string,
    path: string[]
} | {
    type: "checkbox",
    label: string,
    description: string,
    defaultValue: boolean,
    path: string[]
}

