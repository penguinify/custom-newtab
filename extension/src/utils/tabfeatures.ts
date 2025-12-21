import { getString } from "../data/database";
import { mimeMap } from "./mimemap";

export function setTabTitle(title: string) {
    document.title = title;
}

export async function setFavicon() {
    let faviconUrl = "";
    const faviconData = await getString("tab_favicon");
    let extension = await getString("tab_favicon_extension");
    extension = mimeMap[extension as string];
    if (faviconData) {
        faviconUrl = `data:${extension};base64,${faviconData}`;
    }
    let link: HTMLLinkElement | null =
        document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.getElementsByTagName("head")[0].appendChild(link);
    }
    link.href = faviconUrl;
}
