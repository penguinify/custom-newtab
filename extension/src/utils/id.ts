export function generateRandomId(length: number = 8): string {
	const characters =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	return Array.from({ length }, () =>
		characters.charAt(Math.floor(Math.random() * characters.length)),
	).join("");
}
