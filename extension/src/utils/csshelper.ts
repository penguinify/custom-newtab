export function mergeCSSValue(
	element: HTMLElement,
	property: string,
	value: string,
) {
	const existingValue = element.style.getPropertyValue(property);
	if (existingValue) {
		// Merge existing and new values
		const mergedValue = `${existingValue} ${value}`;
		element.style.setProperty(property, mergedValue, "important");
	} else {
		// Set new value directly
		element.style.setProperty(property, value, "important");
	}
}
