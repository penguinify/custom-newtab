import { OptionTab } from "./ui/components/optionTab.component"

export interface UserConfig {
    background: BackgroundType,
    colors: ColorOptions
}



export type BackgroundType = {
    type: "color",
    hex: string
} | {
    type: "image",
    url: string // can be a local file path or a remote url
    // path to the cache is generated using the url
} | {
    type: "video",
    url: string // can be a local file path or a remote url
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
