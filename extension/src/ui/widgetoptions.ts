import { type SettingOptions, WidgetOption, fileSaveData } from "../types";

// Whole point of this is to have js actually understand the types of options available for each widget setting, cause types just get wiped out otherwise

export class TextOption extends WidgetOption<string> {
	intoSettingsOptions(
		defaultValue: string,
		onChange: (newValue: string) => void,
	): SettingOptions {
		return {
			type: "text",
			label: this.label,
			description: this.description,
			defaultValue: defaultValue,
			onChange: onChange,
		};
	}
}

// basically the same as textoption ig
export class ColorOption extends WidgetOption<string> {
	intoSettingsOptions(
		defaultValue: string,
		onChange: (newValue: string) => void,
	): SettingOptions {
		return {
			type: "colorpicker",
			label: this.label,
			description: this.description,
			defaultValue: defaultValue,
			onChange: onChange,
		};
	}
}

export class CheckboxOption extends WidgetOption<boolean> {
	intoSettingsOptions(
		defaultValue: boolean,
		onChange: (newValue: boolean) => void,
	): SettingOptions {
		return {
			type: "checkbox",
			label: this.label,
			description: this.description,
			defaultValue: defaultValue,
			onChange: onChange,
		};
	}
}

export class FileOption extends WidgetOption<fileSaveData> {
	constructor(label: string, description: string) {
		super(label, description);
	}

	intoSettingsOptions(
		defaultValue: fileSaveData,
		onChange: (newValue: fileSaveData) => void,
	): SettingOptions {
		return {
			type: "file",
			label: this.label,
			description: this.description,
			onChange: onChange,
		};
	}
}

export class TextAreaOption extends WidgetOption<string> {
	intoSettingsOptions(
		defaultValue: string,
		onChange: (newValue: string) => void,
	): SettingOptions {
		return {
			type: "textarea",
			label: this.label,
			description: this.description,
			defaultValue: defaultValue,
			onChange: onChange,
		};
	}
}
