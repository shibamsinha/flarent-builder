import type { Project, ProjectSummary } from '@/types/project';
import { getProjectRepository } from '@/project/repository';
import { getAssetService } from '@/services/assets';
import { getTemplate } from '@/templates';
import type { ProfileInput } from '@/onboarding/profile';
import { projectId as makeProjectId } from '@/utils/id';

/**
 * Project-level operations that span more than one service (a project and its
 * assets, for instance). Keeps the dashboard free of storage details.
 */

export async function listProjects(): Promise<ProjectSummary[]> {
  return getProjectRepository().list();
}

/**
 * Build a project for a specific business rather than handing over a template
 * full of someone else's placeholder details.
 */
export async function createProjectFromTemplate(
  templateId: string,
  profile: ProfileInput,
): Promise<Project> {
  const template = getTemplate(templateId);
  if (!template) throw new Error(`Unknown template "${templateId}"`);
  const project = template.build(profile);
  await getProjectRepository().create(project);
  return project;
}

export async function duplicateProject(id: string): Promise<Project | null> {
  const repository = getProjectRepository();
  const source = await repository.get(id);
  if (!source) return null;

  const now = Date.now();
  const copy: Project = {
    ...structuredClone(source),
    id: makeProjectId(),
    name: `${source.name} copy`,
    createdAt: now,
    updatedAt: now,
  };

  // Assets are stored per project, so the copy needs its own.
  const assets = getAssetService();
  for (const asset of source.assets) {
    const blob = await assets.getBlob(source.id, asset.id);
    if (!blob) continue;
    const file = new File([blob], asset.filename, { type: asset.mimeType });
    const meta = await assets.upload(copy.id, file);
    remapAssetId(copy, asset.id, meta.id);
  }

  await repository.create(copy);
  return copy;
}

export async function deleteProject(id: string): Promise<void> {
  const repository = getProjectRepository();
  const project = await repository.get(id).catch(() => null);
  if (project) {
    const assets = getAssetService();
    for (const asset of project.assets) {
      await assets.delete(project.id, asset.id).catch(() => undefined);
    }
  }
  await repository.delete(id);
}

export async function renameProject(id: string, name: string): Promise<void> {
  const repository = getProjectRepository();
  const project = await repository.get(id);
  if (!project) return;
  await repository.update({ ...project, name: name.trim() || project.name, updatedAt: Date.now() });
}

/** Rewrite every `asset:<old>` reference in a duplicated project. */
function remapAssetId(project: Project, oldId: string, newId: string): void {
  const oldRef = `asset:${oldId}`;
  const newRef = `asset:${newId}`;

  const walk = (value: unknown): unknown => {
    if (typeof value === 'string') return value === oldRef ? newRef : value;
    if (Array.isArray(value)) return value.map(walk);
    if (value && typeof value === 'object') {
      const out: Record<string, unknown> = {};
      for (const [key, item] of Object.entries(value)) out[key] = walk(item);
      return out;
    }
    return value;
  };

  for (const page of project.pages) {
    page.nodes = walk(page.nodes) as typeof page.nodes;
  }
  project.assets = project.assets.map((asset) =>
    asset.id === oldId ? { ...asset, id: newId } : asset,
  );
  if (project.settings.faviconAssetId === oldId) project.settings.faviconAssetId = newId;
  if (project.settings.socialImageAssetId === oldId) project.settings.socialImageAssetId = newId;
}

export function formatRelativeTime(timestamp: number): string {
  const seconds = Math.round((Date.now() - timestamp) / 1000);
  if (seconds < 45) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  return new Date(timestamp).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
