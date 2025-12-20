// google gemini might know about this function, i don't however
const MONTHS_SHORT = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];
const MONTHS_FULL = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_FULL = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
];
const pad = (n: number, width = 2, z = "0"): string =>
	n.toString().padStart(width, z);
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
			case "a":
				return DAYS_SHORT[date.getDay()];
			case "A":
				return DAYS_FULL[date.getDay()];
			case "w":
				return date.getDay().toString();
			case "d":
				return pad(date.getDate());
			case "e":
				return date.getDate().toString().padStart(2, " ");
			case "u":
				return (date.getDay() || 7).toString(); // ISO day (1-7)

			// --- Months ---
			case "b":
				return MONTHS_SHORT[date.getMonth()];
			case "B":
				return MONTHS_FULL[date.getMonth()];
			case "m":
				return pad(date.getMonth() + 1);

			// --- Years ---
			case "y":
				return pad(date.getFullYear() % 100);
			case "Y":
				return date.getFullYear().toString();
			case "C":
				return Math.floor(date.getFullYear() / 100).toString();
			case "G":
				return getIsoWeek(date)[0].toString(); // ISO Year
			case "g":
				return pad(getIsoWeek(date)[0] % 100); // ISO Year short

			// --- Time ---
			case "H":
				return pad(date.getHours());
			case "I": {
				const h = date.getHours() % 12;
				return h;
			}
			case "p":
				return date.getHours() < 12 ? "AM" : "PM";
			case "M":
				return pad(date.getMinutes());
			case "S":
				return pad(date.getSeconds());
			case "f":
				return `${pad(date.getMilliseconds(), 3)}000`; // Microseconds (fake)

			// --- Timezones ---
			case "z": {
				const offset = -date.getTimezoneOffset();
				const abs = Math.abs(offset);
				return (
					(offset >= 0 ? "+" : "-") + pad(Math.floor(abs / 60)) + pad(abs % 60)
				);
			}
			case "Z": {
				// Fallback approach to get "EST", "PST", etc.
				const str = date.toString();
				const bracket = str.match(/\((.+)\)/);
				return bracket ? bracket[1] : "";
			}

			// --- Weeks ---
			case "U":
				return pad(getWeekOfYear(date, 0)); // Start Sunday
			case "W":
				return pad(getWeekOfYear(date, 1)); // Start Monday
			case "V":
				return pad(getIsoWeek(date)[1]); // ISO Week

			// --- Compounds / Pre-formatted ---
			case "c":
				return date.toLocaleString();
			case "x":
				return date.toLocaleDateString();
			case "X":
				return date.toLocaleTimeString();
			case "D":
				return `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${pad(date.getFullYear() % 100)}`;
			case "F":
				return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
			case "R":
				return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
			case "T":
				return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
			case "r": {
				const h = date.getHours() % 12;
				const hour12 = h === 0 ? 12 : h;
				const ampm = date.getHours() < 12 ? "AM" : "PM";
				return `${pad(hour12)}:${pad(date.getMinutes())}:${pad(date.getSeconds())} ${ampm}`;
			}
			case "j": {
				const start = new Date(date.getFullYear(), 0, 0);
				const diff =
					date.valueOf() -
					start.valueOf() +
					(start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
				return pad(Math.floor(diff / 86400000), 3);
			}

			// --- Escapes ---
			case "%":
				return "%";

			// --- Fallback ---
			default:
				return match; // Return the original "%x" if not supported
		}
	});
}
