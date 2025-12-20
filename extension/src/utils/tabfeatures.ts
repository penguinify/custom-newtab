import { getString } from "../data/database";

export function setTabTitle(title: string) {
    document.title = title;
}const FaviconMap: Record<string, string> = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'ico': 'image/x-icon',
    'svg': 'image/svg+xml',
    'gif': 'image/gif',
};

export async function setFavicon() {
    let faviconUrl = '';
    let faviconData = await getString('tab_favicon');
    let extension = await getString('tab_favicon_extension');
    extension = FaviconMap[extension as string];
    if (faviconData) {
        faviconUrl = `data:${extension};base64,${faviconData}`;
    }
    let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = faviconUrl;

}

