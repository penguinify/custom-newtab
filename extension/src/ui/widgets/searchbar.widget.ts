import { WidgetRegistry } from "../../data/widgetmanager";
import { PenArray } from "../../framework/penexutils";
import {
	type UserConfig,
	Widget,
	type WidgetConfig,
	type WidgetOptionsRecord,
} from "../../types";
import { ColorOption, TextOption } from "../widgetoptions";

export class SearchBarWidget extends Widget<WidgetConfig<TextData>> {
	render(): PenArray {
		// idk why, but typescript is being weird in this file, just ignore the errors, and all the other ones because it is not worth the time
		const config: UserConfig = this.getConfig();

		// Compose style strings for container and input
		const containerStyle = `
display: flex;
justify-content: center;
align-items: center;
border-radius: ${this.data.data.cornerRadius || "8px"};
border: ${this.data.data.outlineWidth || "2px"} solid ${this.data.data.outline || "#FFFFFF"};
background-color: ${this.data.data.backgroundColor || config.background.hex || "#000000"};
${this.data.data.customCSS || ""}
`
			.replace(/\s+/g, " ")
			.trim();

		const inputStyle = `
outline: none;
padding: ${this.data.data.paddingY || "5px"} ${this.data.data.paddingX || "10px"};
font-size: ${this.data.data.fontSize || "16px"};
width: 200px;
font-weight: ${this.data.data.fontWeight || "normal"};
font-family: ${this.data.data.fontFamily || config.fontFamily};
font-style: ${this.data.data.fontStyle || "normal"};
color: ${this.data.data.inputTextColor || config.colors.textColor};
background: transparent;
border: none;
`
			.replace(/\s+/g, " ")
			.trim();

		// Placeholder color via inline style (not standard, but will be handled below)
		const placeholderColor = this.data.data.placeholderTextColor || "#888888";

		this.pens = PenArray.fromHTML(`
<div id="searchbar-widget-${this.id}" style="${containerStyle}">
<input 
type="text" 
id="searchbar-input-${this.id}" 
placeholder="${this.data.data.placeholderText || "Search..."}"
style="${inputStyle}"
/>
</div>
`);

		const inputElement = this.pens.getById(`searchbar-input-${this.id}`);

		// Set placeholder color using JS for cross-browser support
		if (inputElement.element instanceof HTMLInputElement) {
			try {
				inputElement.element.style.setProperty(
					"color",
					this.data.data.inputTextColor || "#FFFFFF",
				);
				// Use a dynamic stylesheet for placeholder color
				const styleSheet = document.createElement("style");
				styleSheet.innerHTML = `
#searchbar-input-${this.id}::placeholder {
color: ${placeholderColor};
opacity: 1;
}
`;
				document.head.appendChild(styleSheet);
			} catch (_e) {
				// ignore
			}
		}

		if (!this.displayInstance && !this.editorInstance) {
			this.setParent(this.pens.getById(`searchbar-widget-${this.id}`));
			this.setPosition(this.pens.getById(`searchbar-widget-${this.id}`));
			inputElement.element.addEventListener("keydown", (event: any) => {
				if (event.key === "Enter") {
					this.search(inputElement.element.value);
				}
			});
		} else {
		}

		// why does it return something? who knows and who will ever know
		return this.pens;
	}

	search(query: string): void {
		const searchURL =
			this.data.data.searchEngineURL || "https://www.google.com/search?q=%s";
		const finalURL = searchURL.replace("%s", encodeURIComponent(query));
		window.location.href = finalURL;
	}

	static defaultConfig(): WidgetConfig<{}> {
		return {
			WidgetRecordId: "searchbar-widget",
			description: "lame searchbar widget.",
			enabled: true, // icl this doesn't even do anything unless the widget manager checks for it
			position: {
				x: 0,
				y: 0,
				scaleX: 0.5,
				scaleY: 0.5,
			},
			data: {
				placeholderText: "Search...",
				cornerRadius: "8px",
				backgroundColor: "#000000",
				inputTextColor: "#FFFFFF",
				placeholderTextColor: "#888888",
				outline: "#FFFFFF",
				outlineWidth: "2px",
				fontSize: "16px",
				fontWeight: "normal",
				fontFamily: "",
				fontStyle: "normal",
				paddingX: "10px",
				paddingY: "5px",
				customCSS: "",
				searchEngineURL: "https://www.google.com/search?q=%s",
			},
		};
	}
	static getWidgetOptionsRecord(): WidgetOptionsRecord {
		return {
			placeholderText: new TextOption(
				"Placeholder Text",
				"The placeholder text displayed in the search bar.",
			),
			cornerRadius: new TextOption(
				"Corner Radius",
				"The border radius of the search bar (e.g., '8px').",
			),
			backgroundColor: new ColorOption(
				"Background Color",
				"The background color of the search bar.",
			),
			outline: new ColorOption(
				"Outline Color",
				"The outline color of the search bar when focused.",
			),
			inputTextColor: new ColorOption(
				"Text Color",
				"The color of the text in the search bar.",
			),
			placeholderTextColor: new ColorOption(
				"Placeholder Text Color",
				"The color of the placeholder text in the search bar.",
			),
			outlineWidth: new TextOption(
				"Outline Width",
				"The width of the outline when the search bar is focused (e.g., '2px').",
			),
			fontSize: new TextOption(
				"Font Size",
				"The font size of the text in the search bar (e.g., '16px').",
			),
			fontWeight: new TextOption(
				"Font Weight",
				"The font weight of the text in the search bar (e.g., 'normal', 'bold').",
			),
			fontFamily: new TextOption(
				"Font Family",
				"The font family of the text in the search bar (e.g., 'Arial, sans-serif').",
			),
			fontStyle: new TextOption(
				"Font Style",
				"The font style of the text in the search bar (e.g., 'normal', 'italic').",
			),
			paddingX: new TextOption(
				"Padding X",
				"The horizontal padding inside the search bar (e.g., '10px').",
			),
			paddingY: new TextOption(
				"Padding Y",
				"The vertical padding inside the search bar (e.g., '5px').",
			),
			customCSS: new TextOption(
				"Custom CSS",
				"this is directely added to the style='' of the searchbar container element.",
			),
			searchEngineURL: new TextOption(
				"Search Engine URL",
				"The URL of the search engine to use, with '%s' as a placeholder for the query (e.g., 'https://www.google.com/search?q=%s').",
			),
		};
	}
}

function register() {
	WidgetRegistry.registerWidget("searchbar-widget", SearchBarWidget);
}

export default register();
