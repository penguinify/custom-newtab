import {
	type Component,
	type Elements,
	type Pen,
	PenArray,
} from "../../../framework/penexutils";
import type { TabWrapper } from "../../../types";

export class OptionNavigation implements Component {
	pens: PenArray = new PenArray();
	parent: Pen<Elements>;
	currentTabId: string = "";
	tabs: TabWrapper[] = [];
	searchParamaters: URLSearchParams = new URLSearchParams(
		window.location.search,
	);

	constructor(tabs: TabWrapper[], parent: Pen<Elements>, defaultTabId: string) {
		this.tabs = tabs;
		this.currentTabId = defaultTabId;
		this.parent = parent;
	}

	render(): PenArray {
		const container = PenArray.fromHTML(`
            <div id="option-navigation" class="option-navigation flex flex-col border-r border-white mr-4 p-4 text-xl">
            </div>
        `);
		const containerPen = container.getById("option-navigation");
		container[0].setParent(this.parent);

		this.tabs.forEach((tab) => {
			const tabButton = PenArray.fromHTML(`
                <button id="tab-button-${tab.id}" class="px-4 py-2 hover:underline decoration-dotted  decoration-white underline-offset-2 text-left">
                    ${tab.label}
                </button>
            `);
			const buttonPen = tabButton.getById(`tab-button-${tab.id}`);
			buttonPen.element.addEventListener(
				"click",
				this.showTab.bind(this, tab.id),
			);

			tabButton[0].setParent(containerPen);
			container.push(...tabButton);
		});

		this.pens = container;

		window.addEventListener("load", this.showTab.bind(this, this.currentTabId));

		return this.pens;
	}

	showTab(tabId: string): void {
		this.tabs.find((tab) => tab.id === this.currentTabId)?.optionTab.hide();

		this.currentTabId = tabId;
		this.tabs.find((tab) => tab.id === tabId)?.optionTab.show();

		this.searchParamaters.set("tab", tabId);
		window.history.replaceState(
			{},
			"",
			`${window.location.pathname}?${this.searchParamaters.toString()}`,
		);

		this._updateActiveTabButton();
	}

	private _updateActiveTabButton(): void {
		for (const tab of this.tabs) {
			const tabButton = this.pens.getById(`tab-button-${tab.id}`);
			tabButton.element.style = "";
		}

		const tabButton = this.pens.getById(`tab-button-${this.currentTabId}`);
		tabButton.element.style = "text-decoration: underline;";
	}
}
