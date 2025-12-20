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
export function convertArrayBufferToBase64(buffer: ArrayBuffer): string {
	let binary = "";
	const bytes = new Uint8Array(buffer);
	const len = bytes.byteLength;
	for (let i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return window.btoa(binary);
}

export function convertBase64ToArrayBuffer(base64: string): ArrayBuffer {
	const binaryString = window.atob(base64);
	const len = binaryString.length;
	const bytes = new Uint8Array(len);
	for (let i = 0; i < len; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}
	return bytes.buffer;
}
