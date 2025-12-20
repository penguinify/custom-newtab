import { type Component, PenArray } from "../../../framework/penexutils";
import type { SettingOptions } from "../../../types";
import { generateRandomId } from "../../../utils/id";
import { ButtonInput } from "../inputs/buttonInput.component";
import { CheckboxInput } from "../inputs/checkboxInput.component";
import { ColorPicker } from "../inputs/colorPicker.component";
import { DropdownWithSubcomponents } from "../inputs/dropdownWithSubcomponents.component";
import { FileInput } from "../inputs/fileInput.component";
import { TextInput } from "../inputs/textInput.component";

export class WidgetOptionsEditor implements Component {
	pens: PenArray = new PenArray();
	title: string = "Widget Options";
	description: string = "";
	options: SettingOptions[] = [];
	id: string = generateRandomId();

	constructor(options: SettingOptions[], title: string, description: string) {
		this.options = options;
		this.title = title;
		this.description = description;
		this.addCloseButton();
	}

	render(): PenArray {
		const container = PenArray.fromHTML(`
<div class="w-full h-full flex flex-col gap-4 bg-black/50 fixed top-0 left-0 z-50 text-white">
            <div id="widget-options-${this.id}" class="w-1/4 p-3 bg-black border-r-2 border-white flex flex-col h-full gap-3 overflow-y-auto pb-16" >
<h2 class="text-2xl">${this.title}</h2>
<p class="mb-4 text-white/75">${this.description}</p>
</div>
</div>

        `);
		const containerPen = container.getById(`widget-options-${this.id}`);

		container[0].setParent(document.body);
		this.pens.push(...container);
		this.options.forEach((option) => {
			const optionPen = this._createOption(option);
			optionPen.forEach((pen) => {
				pen.setParent(containerPen);
			});
		});

		this.pens[this.pens.length - 1].element.parentElement.style.marginTop =
			"25px";

		this.hide();

		return this.pens;
	}

	private addCloseButton(): void {
		this.options.push({
			type: "button",
			label: "Close",
			description: "Close the widget options editor",
			onClick: this.hide.bind(this),
		});
	}

	private _createOption(option: SettingOptions): PenArray {
		const optionPen: PenArray = new PenArray();
		switch (option.type) {
			case "colorpicker":
				this.pens.push(
					...new ColorPicker(
						this.pens.getById(`widget-options-${this.id}`),
						option,
					).render(),
				);
				break;
			case "dropdown":
				this.pens.push(
					...new DropdownWithSubcomponents(
						this.pens.getById(`widget-options-${this.id}`),
						option,
					).render(),
				);
				break;
			case "text":
				this.pens.push(
					...new TextInput(
						this.pens.getById(`widget-options-${this.id}`),
						option,
					).render(),
				);
				break;
			case "file":
				this.pens.push(
					...new FileInput(
						this.pens.getById(`widget-options-${this.id}`),
						option,
					).render(),
				);
				break;
			case "checkbox":
				this.pens.push(
					...new CheckboxInput(
						this.pens.getById(`widget-options-${this.id}`),
						option,
					).render(),
				);
				break;
			case "button":
				this.pens.push(
					...new ButtonInput(
						this.pens.getById(`widget-options-${this.id}`),
						option,
					).render(),
				);
		}
		return optionPen;
	}

	hide(): void {
		// typescript, wrap it up, it isn't pivotal if it is null or not lol
		this.pens.getById(
			`widget-options-${this.id}`,
		).element.parentElement.style.display = "none";
	}

	show(): void {
		this.pens.getById(
			`widget-options-${this.id}`,
		).element.parentElement.style.display = "flex";
	}
}
