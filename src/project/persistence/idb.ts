/**
 * A minimal promise wrapper around IndexedDB.
 *
 * IndexedDB (rather than localStorage) because projects carry image blobs and
 * quickly exceed the 5 MB string quota. Everything degrades to an in-memory
 * store if the browser blocks storage entirely, so the editor still runs.
 */

const DB_NAME = 'flarent-builder';
const DB_VERSION = 1;

export const STORE_PROJECTS = 'projects';
export const STORE_ASSETS = 'assets';
export const STORE_SUBMISSIONS = 'submissions';

let dbPromise: Promise<IDBDatabase> | null = null;

export function isIndexedDbAvailable(): boolean {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    return false;
  }
}

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
        db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_ASSETS)) {
        db.createObjectStore(STORE_ASSETS, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORE_SUBMISSIONS)) {
        db.createObjectStore(STORE_SUBMISSIONS, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open the local database'));
    request.onblocked = () => reject(new Error('The local database is blocked by another tab'));
  });
  return dbPromise;
}

async function tx<T>(
  store: string,
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(store, mode);
    const request = run(transaction.objectStore(store));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Database request failed'));
  });
}

export const idb = {
  get: <T>(store: string, key: string) => tx<T | undefined>(store, 'readonly', (s) => s.get(key)),
  getAll: <T>(store: string) => tx<T[]>(store, 'readonly', (s) => s.getAll()),
  put: <T>(store: string, value: T) => tx(store, 'readwrite', (s) => s.put(value)),
  delete: (store: string, key: string) => tx(store, 'readwrite', (s) => s.delete(key)),
  clear: (store: string) => tx(store, 'readwrite', (s) => s.clear()),
};

/** Fallback store used when IndexedDB is unavailable (private windows, etc.). */
export class MemoryStore {
  private data = new Map<string, Map<string, unknown>>();

  private bucket(store: string): Map<string, unknown> {
    let bucket = this.data.get(store);
    if (!bucket) {
      bucket = new Map();
      this.data.set(store, bucket);
    }
    return bucket;
  }

  async get<T>(store: string, key: string): Promise<T | undefined> {
    return this.bucket(store).get(key) as T | undefined;
  }
  async getAll<T>(store: string): Promise<T[]> {
    return [...this.bucket(store).values()] as T[];
  }
  async put<T extends { id?: string; key?: string }>(store: string, value: T): Promise<void> {
    const key = value.id ?? value.key;
    if (key) this.bucket(store).set(key, value);
  }
  async delete(store: string, key: string): Promise<void> {
    this.bucket(store).delete(key);
  }
  async clear(store: string): Promise<void> {
    this.bucket(store).clear();
  }
}

const memory = new MemoryStore();

/** Storage facade that transparently falls back to memory. */
export const storage = {
  async get<T>(store: string, key: string): Promise<T | undefined> {
    if (!isIndexedDbAvailable()) return memory.get<T>(store, key);
    try {
      return await idb.get<T>(store, key);
    } catch {
      return memory.get<T>(store, key);
    }
  },
  async getAll<T>(store: string): Promise<T[]> {
    if (!isIndexedDbAvailable()) return memory.getAll<T>(store);
    try {
      return await idb.getAll<T>(store);
    } catch {
      return memory.getAll<T>(store);
    }
  },
  async put<T extends object>(store: string, value: T): Promise<void> {
    if (!isIndexedDbAvailable()) return memory.put(store, value as never);
    try {
      await idb.put(store, value);
    } catch {
      await memory.put(store, value as never);
    }
  },
  async delete(store: string, key: string): Promise<void> {
    if (!isIndexedDbAvailable()) return memory.delete(store, key);
    try {
      await idb.delete(store, key);
    } catch {
      await memory.delete(store, key);
    }
  },
};
