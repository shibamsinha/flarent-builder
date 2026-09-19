import type { Project } from '@/types/project';
import { buildStaticSite, type ExportedFile } from '@/engine/export/staticExport';

export interface PublishResult {
  ok: boolean;
  /** Where the site can be reached, when the target provides a URL. */
  url?: string;
  fileCount: number;
  totalBytes: number;
  publishedAt: number;
  message: string;
}

/**
 * Publishing target. V1 ships a downloadable static bundle; Flarent Hosting,
 * custom domains and deployment history slot in behind the same call.
 */
export interface Publisher {
  readonly id: string;
  readonly label: string;
  publish(project: Project): Promise<PublishResult>;
}

/** Builds the site and hands the visitor a .zip of the finished website. */
export class StaticExportPublisher implements Publisher {
  readonly id = 'static-export';
  readonly label = 'Download website';

  async publish(project: Project): Promise<PublishResult> {
    const files = await buildStaticSite(project);
    const { default: JSZip } = await import('jszip');
    const zip = new JSZip();

    let totalBytes = 0;
    for (const file of files) {
      if (file.blob) {
        zip.file(file.path, file.blob);
        totalBytes += file.blob.size;
      } else {
        const text = file.text ?? '';
        zip.file(file.path, text);
        totalBytes += new Blob([text]).size;
      }
    }

    const archive = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
    downloadBlob(archive, `${slugForFile(project.name)}-website.zip`);

    return {
      ok: true,
      fileCount: files.length,
      totalBytes,
      publishedAt: Date.now(),
      message: `Exported ${files.length} files (${formatBytes(totalBytes)}).`,
    };
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function slugForFile(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'flarent';
}

let publisher: Publisher = new StaticExportPublisher();

export function getPublisher(): Publisher {
  return publisher;
}

export function setPublisher(next: Publisher): void {
  publisher = next;
}

export type { ExportedFile };
