import { getString } from "./database";
import { Elements, Pen, PenArray } from "./framework/penexutils";
import { UserConfig } from "./types";

export function generateRandomId(length: number = 8): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
}

export async function applyBackgroundColor(pen: Pen<Elements>, settings: UserConfig) {

    pen.element.style.backgroundColor = "black";
    switch (settings.background.type) {
        case "color":
            pen.element.style.backgroundColor = settings.background.hex;
            break;
        case "image":
            pen.element.style.backgroundImage = `url('${settings.background.url}')`;
            pen.element.style.backgroundSize = 'cover';
            pen.element.style.backgroundPosition = 'center';

            pen.element.style.cssText += settings.background.css;
            break;
        case "video":
            // uses video in ArrayBuffer form
            const backgroundVideo = await getString('background_video')
            const videoExtension = await getString('background_video_extension')
            const videoBlob = new Blob([convertBase64ToArrayBuffer(backgroundVideo as string)], { type: `video/${videoExtension || 'mp4'}` });
            const videoUrl = URL.createObjectURL(videoBlob);

            let pens = PenArray.fromHTML(`

<div id="fallbackColor" class="bg-blue absolute -z-1" style="height: ${pen.element.clientHeight}px; width: ${pen.element.clientWidth}px"></div>
<video autoplay muted loop disablepictureinpicture id="background-video" class=" w-full h-full absolute object-cover -z-1 pointer-events-none" style="height: ${pen.element.clientHeight}px; width: ${pen.element.clientWidth}px">
<source src="${videoUrl}" type="video/${videoExtension || 'mp4'}">
</video>
`);

            let videoPen = pens.getById('background-video');
            pen.element.style.background = 'none';
            // custom logic for the preview video element
            videoPen.setParent(pen, 0);

            let fallbackPen = pens.getById('fallbackColor');
            fallbackPen.setParent(pen);
            fallbackPen.element.style.backgroundColor = settings.background.fallbackColor || 'black';

            // once loaded fade out fallback color
            videoPen.element.addEventListener('loadeddata', () => {
                fallbackPen.element.style.transition = 'opacity 0.5s ease-out';
                fallbackPen.element.style.opacity = '0';
                setTimeout(() => {
                    fallbackPen.element.remove();
                }, 1000);
            });

            break;
        case "customcss":
            pen.element.style.cssText = settings.background.css;
            break;
    }

}

export function setTabTitle(title: string) {
    document.title = title;
}

const FaviconMap: Record<string, string> = {
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

export function convertArrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

export function convertBase64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

export function collides(DOMRectA: DOMRect, DOMRectB: DOMRect): boolean {
    return !(
        DOMRectA.top > DOMRectB.bottom ||
        DOMRectA.bottom < DOMRectB.top ||
        DOMRectA.left > DOMRectB.right ||
        DOMRectA.right < DOMRectB.left
    );
}
