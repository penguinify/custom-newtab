import { getString } from "../../data/database";
import { WidgetRegistry } from "../../data/widgetmanager";
import { PenArray } from "../../framework/penexutils";
import {
    type UserConfig,
    Widget,
    type WidgetConfig,
    type WidgetOptionsRecord,
} from "../../types";
import { generateRandomId } from "../../utils/id";
import {
    CheckboxOption,
    ColorOption,
    FileOption,
    TextOption,
} from "../widgetoptions";

export class ImageWidget extends Widget<WidgetConfig<ImageData>> {

    constructor(config: WidgetConfig<ImageData>) {
        super(config);
        if (config.ssid === undefined) {
            this.data.ssid = generateRandomId(3);
        }
    }

    render(): PenArray {
        // idk why, but typescript is being weird in this file, just ignore the errors, and all the other ones because it is not worth the time
        const config: UserConfig = this.getConfig();

        this.pens = PenArray.fromHTML(`
<img id="image-widget-${this.id}"  
alt="Image Widget" 
style="object-fit: fill"
/>
        `);

        if (!this.displayInstance && !this.editorInstance) {
            this.setPosition(this.pens.getById(`image-widget-${this.id}`));
            this.setParent(this.pens.getById(`image-widget-${this.id}`));
        } else {
        }

        let imageElement = this.pens.getById(
            `image-widget-${this.id}`,
        ).element as HTMLImageElement;

        if (this.data.data.useUrl) {
            const image = new Image();
            image.src = this.data.data.imageUrl;
            image.onload = () => {
                // set width and height to image dimensions
                imageElement.style.width = image.width + "px";
                imageElement.style.height = image.height + "px";
                imageElement.parentElement!.style.width = image.width + "px";
                imageElement.parentElement!.style.height = image.height + "px";
            }

            imageElement.src = this.data.data.imageUrl;

        } else {
            const image_data = getString(this.data.ssid + "_uploadImageData") || null; // the second part is the field name
            image_data.then((image_data) => {
                if (!image_data) {
                    imageElement.alt = "No image uploaded";
                    return;
                }
                const imageUrl = URL.createObjectURL(image_data as Blob);
                const image = new Image();
                image.src = imageUrl;
                image.onload = () => {
                    // set width and height to image dimensions
                    imageElement.style.width = image.width + "px";
                    imageElement.style.height = image.height + "px";
                    imageElement.parentElement!.style.width = image.width + "px";
                    imageElement.parentElement!.style.height = image.height + "px";
                };
                imageElement.src = imageUrl;
            });
        }

        // why does it return something? who knows and who will ever know
        return this.pens;
    }


    static defaultConfig(): WidgetConfig<{}> {
        return {
            WidgetRecordId: "image-widget",
            description: "display custom image",
            enabled: true,
            position: {
                x: 0,
                y: 0,
                scaleX: 0.1,
                scaleY: 0.1,
            },
            data: {
                useUrl: true,
                imageUrl: "https://placehold.co/50x50",
                uploadImageData: "",
            },
        };
    }
    static getWidgetOptionsRecord(): WidgetOptionsRecord {
        return {
            useUrl: new CheckboxOption(
                "Use Image URL",
                "Whether to use an image URL or upload an image",
            ),
            imageUrl: new TextOption("Image URL", "The URL of the image to display"),
            uploadImageData: new FileOption(
                "Upload Image",
                "Upload an image file to display",
            ),
        };
    }
}

function register() {
    WidgetRegistry.registerWidget("image-widget", ImageWidget);
}

export default register();
export type ImageData = WidgetConfig<{
    useUrl: boolean;
    imageUrl: string;
    uploadImageData: string; // not really anything, file inputs are really weird
}>;
