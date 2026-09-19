import type { AssetMeta } from '@/types/project';
import { STORE_ASSETS, storage } from '@/project/persistence/idb';
import { assetId as makeAssetId } from '@/utils/id';
import { ASSET_PROTOCOL, assetRefId, isAssetRef, toAssetRef } from '@/types/props';

export interface StoredAsset {
  key: string;
  projectId: string;
  meta: AssetMeta;
  blob: Blob;
}

/**
 * Asset storage boundary. The editor never touches IndexedDB directly, so a
 * cloud/CDN implementation can be dropped in without touching the UI.
 */
export interface AssetService {
  upload(projectId: string, file: File): Promise<AssetMeta>;
  list(projectId: string): Promise<AssetMeta[]>;
  getBlob(projectId: string, assetId: string): Promise<Blob | null>;
  /** A URL usable in `src`. Object URLs are cached and revoked on release. */
  getUrl(projectId: string, assetId: string): Promise<string | undefined>;
  delete(projectId: string, assetId: string): Promise<void>;
  releaseAll(): void;
}

const MAX_ASSET_BYTES = 12 * 1024 * 1024;

export class LocalAssetService implements AssetService {
  private urlCache = new Map<string, string>();

  private key(projectId: string, assetId: string): string {
    return `${projectId}:${assetId}`;
  }

  async upload(projectId: string, file: File): Promise<AssetMeta> {
    if (file.size > MAX_ASSET_BYTES) {
      throw new Error(
        `"${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is ${MAX_ASSET_BYTES / 1024 / 1024} MB.`,
      );
    }
    const dimensions = await readDimensions(file);
    const meta: AssetMeta = {
      id: makeAssetId(),
      filename: file.name,
      mimeType: file.type || 'application/octet-stream',
      width: dimensions.width,
      height: dimensions.height,
      size: file.size,
      createdAt: Date.now(),
    };
    const record: StoredAsset = {
      key: this.key(projectId, meta.id),
      projectId,
      meta,
      blob: file,
    };
    await storage.put(STORE_ASSETS, record);
    return meta;
  }

  async list(projectId: string): Promise<AssetMeta[]> {
    const all = await storage.getAll<StoredAsset>(STORE_ASSETS);
    return all
      .filter((record) => record.projectId === projectId)
      .map((record) => record.meta)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  async getBlob(projectId: string, assetId: string): Promise<Blob | null> {
    const record = await storage.get<StoredAsset>(STORE_ASSETS, this.key(projectId, assetId));
    return record?.blob ?? null;
  }

  async getUrl(projectId: string, assetId: string): Promise<string | undefined> {
    const key = this.key(projectId, assetId);
    const cached = this.urlCache.get(key);
    if (cached) return cached;
    const blob = await this.getBlob(projectId, assetId);
    if (!blob) return undefined;
    const url = URL.createObjectURL(blob);
    this.urlCache.set(key, url);
    return url;
  }

  async delete(projectId: string, assetId: string): Promise<void> {
    const key = this.key(projectId, assetId);
    const url = this.urlCache.get(key);
    if (url) {
      if (typeof URL.revokeObjectURL === 'function') URL.revokeObjectURL(url);
      this.urlCache.delete(key);
    }
    await storage.delete(STORE_ASSETS, key);
  }

  releaseAll(): void {
    if (typeof URL.revokeObjectURL === 'function') {
      for (const url of this.urlCache.values()) URL.revokeObjectURL(url);
    }
    this.urlCache.clear();
  }
}

let service: AssetService = new LocalAssetService();

export function getAssetService(): AssetService {
  return service;
}

export function setAssetService(next: AssetService): void {
  service = next;
}

async function readDimensions(file: File): Promise<{ width: number; height: number }> {
  if (!file.type.startsWith('image/') || typeof createImageBitmap !== 'function') {
    return { width: 0, height: 0 };
  }
  try {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  } catch {
    return { width: 0, height: 0 };
  }
}

export { ASSET_PROTOCOL, assetRefId, isAssetRef, toAssetRef };
