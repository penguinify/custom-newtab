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

// google gemini might know about this function, i don't however
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const pad = (n: number, width = 2, z = '0'): string => n.toString().padStart(width, z);

const getIsoWeek = (date: Date): [number, number] => {
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = new Date(target.getFullYear(), 0, 4);
    const diff = target.valueOf() - firstThursday.valueOf();
    const weekNumber = 1 + Math.round(diff / 604800000); // 604800000 = 7 * 24 * 60 * 60 * 1000
    return [target.getFullYear(), weekNumber];
};


const getWeekOfYear = (date: Date, startDay: 0 | 1): number => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const day = startOfYear.getDay();
    // Adjust to find the first occurrence of the startDay
    const dayOffset = (day - startDay + 7) % 7;
    const firstWeekStart = new Date(startOfYear.valueOf());
    firstWeekStart.setDate(startOfYear.getDate() - dayOffset);

    // If the first week start is after the date, it's week 0
    if (firstWeekStart > date) return 0;

    const diff = date.valueOf() - firstWeekStart.valueOf();
    return Math.floor(diff / 604800000);
};


export function strftime(fmt: string, date: Date = new Date()): string {
    return fmt.replace(/%./g, (match) => {
        const code = match[1]; // Get the character after %

        switch (code) {
            // --- Days ---
            case 'a': return DAYS_SHORT[date.getDay()];
            case 'A': return DAYS_FULL[date.getDay()];
            case 'w': return date.getDay().toString();
            case 'd': return pad(date.getDate());
            case 'e': return date.getDate().toString().padStart(2, ' ');
            case 'u': return (date.getDay() || 7).toString(); // ISO day (1-7)

            // --- Months ---
            case 'b': return MONTHS_SHORT[date.getMonth()];
            case 'B': return MONTHS_FULL[date.getMonth()];
            case 'm': return pad(date.getMonth() + 1);

            // --- Years ---
            case 'y': return pad(date.getFullYear() % 100);
            case 'Y': return date.getFullYear().toString();
            case 'C': return Math.floor(date.getFullYear() / 100).toString();
            case 'G': return getIsoWeek(date)[0].toString(); // ISO Year
            case 'g': return pad(getIsoWeek(date)[0] % 100); // ISO Year short

            // --- Time ---
            case 'H': return pad(date.getHours());
            case 'I': {
                const h = date.getHours() % 12;
                return pad(h === 0 ? 12 : h);
            }
            case 'p': return date.getHours() < 12 ? 'AM' : 'PM';
            case 'M': return pad(date.getMinutes());
            case 'S': return pad(date.getSeconds());
            case 'f': return pad(date.getMilliseconds(), 3) + '000'; // Microseconds (fake)

            // --- Timezones ---
            case 'z': {
                const offset = -date.getTimezoneOffset();
                const abs = Math.abs(offset);
                return (offset >= 0 ? '+' : '-') + pad(Math.floor(abs / 60)) + pad(abs % 60);
            }
            case 'Z': {
                // Fallback approach to get "EST", "PST", etc.
                const str = date.toString();
                const bracket = str.match(/\((.+)\)/);
                return bracket ? bracket[1] : '';
            }

            // --- Weeks ---
            case 'U': return pad(getWeekOfYear(date, 0)); // Start Sunday
            case 'W': return pad(getWeekOfYear(date, 1)); // Start Monday
            case 'V': return pad(getIsoWeek(date)[1]); // ISO Week

            // --- Compounds / Pre-formatted ---
            case 'c': return date.toLocaleString();
            case 'x': return date.toLocaleDateString();
            case 'X': return date.toLocaleTimeString();
            case 'D': return `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${pad(date.getFullYear() % 100)}`;
            case 'F': return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
            case 'R': return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
            case 'T': return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
            case 'r': {
                const h = date.getHours() % 12;
                const hour12 = (h === 0 ? 12 : h);
                const ampm = date.getHours() < 12 ? 'AM' : 'PM';
                return `${pad(hour12)}:${pad(date.getMinutes())}:${pad(date.getSeconds())} ${ampm}`;
            }
            case 'j': {
                const start = new Date(date.getFullYear(), 0, 0);
                const diff = (date.valueOf() - start.valueOf()) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
                return pad(Math.floor(diff / 86400000), 3);
            }

            // --- Escapes ---
            case '%': return '%';

            // --- Fallback ---
            default: return match; // Return the original "%x" if not supported
        }
    });
}
