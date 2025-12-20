// not really "mixins" because ts automatically does inheritance fine when you extend classes, but i think naming it mixins rather than baseclasses makes it clearer that you use them in addition to the widget class
// dumb oop stuff, idek how to implement good inheritance

import type { Elements, Pen } from "../framework/penexutils";
import type { UserConfig, WidgetOptionsRecord } from "../types";
import { createSVGDiscreteFilter, SVGDiscreteFilterId } from "../utils/color";
import { CheckboxOption, ColorOption, TextOption } from "./widgetoptions";

// this one is for the options! i might add like some for weird functions later but toodles
export abstract class OptionMixin {
	data: any; // will be filled in by the widget

	static defaultOptions(): Record<string, any> {
		return {}; // abstract methods cant be static :(
	}

	// releazing how badly this is named
	// btw i forgot to say that all these are supposed to be flattened objects that you add to your own code
	static getWidgetOptionsRecord(): WidgetOptionsRecord {
		return {};
	}

	// BTW when making a mixin you need to do like add the real functionality of the objects urself <3
}

export class TextOptionMixin extends OptionMixin {
	static defaultOptions(): Record<string, any> {
		return {
			fontWeight: "normal",
			fontFamily: "",
			fontSize: 16,
			color: "",
			fontStyle: "",
			customCSS: "",
			fontSmoothing: true,
		};
	}

	static getWidgetOptionsRecord(): WidgetOptionsRecord {
		return {
			fontWeight: new TextOption(
				"Font Weight",
				"The weight of the font (e.g., normal, bold, 100, 200, etc.)",
			),
			fontFamily: new TextOption(
				"Font Family",
				"The font family to use (e.g., Arial, sans-serif)",
			),
			fontSize: new TextOption("Font Size", "The size of the font in pixels"),
			color: new ColorOption(
				"Color",
				"The color of the text (CSS color value)",
			),
			fontStyle: new TextOption(
				"Font Style",
				"The style of the font (e.g., normal, italic, oblique)",
			),
			customCSS: new TextOption(
				"Custom CSS",
				"Additional CSS to apply to the widget container",
			),
			fontSmoothing: new CheckboxOption(
				"Font Smoothing",
				"Enable or disable font smoothing",
			),
		};
	}

	// i get any remove the point of typescript but im WAY to lazy to make this generic properly
	applyTextOptions<_T>(pen: Pen<Elements>, config: UserConfig): void {
		// Get default options from the mixin
		const defaultConfig = (
			this.constructor as typeof TextOptionMixin
		).defaultOptions();
		// Merge defaults with provided data
		const merged = { ...defaultConfig, ...(this.data.data as any) };

		const resolvedColor = merged.color.trim() || config.colors.textColor;
		const resolvedFontFamily = merged.fontFamily.trim() || config.fontFamily;
		const resolvedFontWeight = merged.fontWeight.trim() || "normal";
		const resolvedFontSize =
			!merged.fontSize || Number.isNaN(merged.fontSize) || merged.fontSize <= 0
				? "16px"
				: `${merged.fontSize}px`;
		const resolvedFontStyle = merged.fontStyle.trim() || "normal";
		let fontSmoothingStyle = "";

		if (merged.fontSmoothing === false) {
			createSVGDiscreteFilter();
			fontSmoothingStyle = `filter: url(#${SVGDiscreteFilterId});`;
		}

		pen.element.style.setProperty(
			"font-family",
			resolvedFontFamily,
			"important",
		);
		pen.element.style.setProperty("color", resolvedColor, "important");
		pen.element.style.setProperty(
			"font-weight",
			resolvedFontWeight,
			"important",
		);
		pen.element.style.setProperty("font-size", resolvedFontSize, "important");
		pen.element.style.setProperty("font-style", resolvedFontStyle, "important");
		// csstext is difference cause it just append
		pen.element.style.cssText += fontSmoothingStyle + merged.customCSS;
	}
}
