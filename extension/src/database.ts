const DB = "newTabDB"

const request = indexedDB.open(DB, 1)
request.onupgradeneeded = (event) => {
    let db = (event.target as IDBOpenDBRequest).result
    db.createObjectStore("data")
}

export async function saveString(key: string, value: string): Promise<void> {
    const db = await getDB();
    const transaction = db.transaction("data", "readwrite");
    const store = transaction.objectStore("data");
    store.put(value, key);
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

    if (request.readyState === 'done') {
        return request.result;
    }
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}
