import { updateConfigEvent } from "./config";

const DB = "newTabDB";

const request = indexedDB.open(DB, 1);
request.onupgradeneeded = (event) => {
	const db = (event.target as IDBOpenDBRequest).result;
	db.createObjectStore("data");
};

export async function saveString(key: string, value: string): Promise<void> {
	const db = await getDB();
	const transaction = db.transaction("data", "readwrite");
	const store = transaction.objectStore("data");
	store.put(value, key);

	window.dispatchEvent(updateConfigEvent);
}

export async function getString(key: string): Promise<string | null> {
	const db = await getDB();

	return new Promise((resolve, reject) => {
		const transaction = db.transaction("data", "readonly");
		const store = transaction.objectStore("data");
		const getRequest = store.get(key);
		getRequest.onsuccess = () => {
			resolve(getRequest.result || null);
		};
		getRequest.onerror = () => {
			reject(getRequest.error);
		};
	});
}

async function getDB(): Promise<IDBDatabase> {
	if (request.readyState === "done") {
		return request.result;
	}
	return new Promise((resolve, reject) => {
		request.addEventListener("success", () => {
			resolve(request.result);
		});
		request.addEventListener("error", () => {
			reject(request.error);
		});
	});
}

export function convertArrayBufferToBlob(
	data: ArrayBuffer,
	type: string, // type of the blob (e.g., 'image/png', 'application/pdf', etc.
): Blob {
	return new Blob([data], { type });
}
