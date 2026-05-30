import { openDB, type IDBPDatabase } from 'idb';
import type { PixelDoc } from '@/pixel/types';

const DB_NAME = 'pixelverse';
const STORE = 'creations';

export interface CreationRecord {
  id: string;
  name: string;
  width: number;
  height: number;
  frameCount: number;
  createdAt: number;
  updatedAt: number;
  thumb: string; // PNG data URL
  doc: PixelDoc; // full document (IndexedDB structured-clones the typed arrays)
}

export type CreationMeta = Omit<CreationRecord, 'doc'>;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export async function saveCreation(rec: CreationRecord): Promise<void> {
  const db = await getDb();
  await db.put(STORE, rec);
}

export async function getCreation(id: string): Promise<CreationRecord | undefined> {
  const db = await getDb();
  return db.get(STORE, id);
}

export async function deleteCreation(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(STORE, id);
}

/** Metadata + thumbnails for the gallery grid (most-recent first). */
export async function listCreations(): Promise<CreationMeta[]> {
  const db = await getDb();
  const all = (await db.getAll(STORE)) as CreationRecord[];
  return all
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map(({ doc: _doc, ...meta }) => meta);
}
