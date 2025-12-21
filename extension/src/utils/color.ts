import { getString } from "../data/database";
import { type Elements, type Pen, PenArray } from "../framework/penexutils";
import type { UserConfig } from "../types";
export function alterHex(hex: string, r: number, g: number, b: number): string {
    hex = hex.replace("#", "");
    let rHex = parseInt(hex.substring(0, 2), 16);
    let gHex = parseInt(hex.substring(2, 4), 16);
    let bHex = parseInt(hex.substring(4, 6), 16);

    rHex = Math.min(255, Math.max(0, rHex + r));
    gHex = Math.min(255, Math.max(0, gHex + g));
    bHex = Math.min(255, Math.max(0, bHex + b));

    return `#${rHex.toString(16).padStart(2, "0")}${gHex.toString(16).padStart(2, "0")}${bHex.toString(16).padStart(2, "0")}`;
}
export async function applyBackgroundColor(
    pen: Pen<Elements>,
    settings: UserConfig,
) {
    pen.element.style.backgroundColor = "black";
    switch (settings.background.type) {
        case "color":
            pen.element.style.backgroundColor = settings.background.hex;
            break;
        case "image":
            pen.element.style.backgroundImage = `url('${settings.background.url}')`;
            pen.element.style.backgroundSize = "cover";
            pen.element.style.backgroundPosition = "center";

            pen.element.style.cssText += settings.background.css;
            break;
        case "video": {
            // uses video in ArrayBuffer form
            const backgroundVideo = await getString("background_video") as Blob | null;
            const backgroundVideoType = await getString("background_video_extension") || "mp4";
            const videoUrl = URL.createObjectURL(backgroundVideo!);

            const pens = PenArray.fromHTML(`

<div id="fallbackColor" class="bg-blue absolute -z-1" style="height: ${pen.element.clientHeight}px; width: ${pen.element.clientWidth}px"></div>
<video autoplay muted loop disablepictureinpicture id="background-video" class=" w-full h-full absolute object-cover -z-1 pointer-events-none" style="height: ${pen.element.clientHeight}px; width: ${pen.element.clientWidth}px">
<source src="${videoUrl}" type="video/${backgroundVideoType}">
</video>
`);

            const videoPen = pens.getById("background-video");
            pen.element.style.background = "none";
            // custom logic for the preview video element
            videoPen.setParent(pen, 0);

            const fallbackPen = pens.getById("fallbackColor");
            fallbackPen.setParent(pen);
            fallbackPen.element.style.backgroundColor =
                settings.background.fallbackColor || "black";

            // once loaded fade out fallback color
            videoPen.element.addEventListener("loadeddata", () => {
                fallbackPen.element.style.transition = "opacity 0.5s ease-out";
                fallbackPen.element.style.opacity = "0";
                setTimeout(() => {
                    fallbackPen.element.remove();
                }, 1000);
            });

            break;
        }
        case "customcss":
            pen.element.style.cssText = settings.background.css;
            break;
    }
}

export const SVGDiscreteFilterId = "svg-discrete-filter";

export function createSVGDiscreteFilter() {
    const svgNS = "http://www.w3.org/2000/svg";
    const svgElem = document.createElementNS(svgNS, "svg");
    svgElem.setAttribute("style", "position: absolute; width: 0; height: 0;");

    svgElem.innerHTML = `
<defs>
<filter id="${SVGDiscreteFilterId}">
<feComponentTransfer>
<feFuncA type="discrete" tableValues="0 1"/>
</feComponentTransfer>
</filter>
</defs>
`;

    document.body.appendChild(svgElem);
}
