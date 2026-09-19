import type { BuilderNode, Page, Project } from '@/types/project';
import { SCHEMA_VERSION } from '@/types/project';
import { DEFAULT_THEME } from '@/engine/schema/defaults';
import { nodeId, pageId, projectId } from '@/utils/id';
import { slugify, uniqueSlug } from '@/utils/slug';

type RawProject = Record<string, unknown>;

/**
 * Migrations run in order until the document reaches SCHEMA_VERSION.
 * Add the next one as `1: (p) => …` when the schema changes; never edit an
 * existing migration, since old documents still depend on it.
 */
const migrations: Record<number, (project: RawProject) => RawProject> = {};

export class UnsupportedVersionError extends Error {
  constructor(public readonly version: number) {
    super(
      `This project was created with a newer version of Flarent Builder (schema v${version}). Update the app to open it.`,
    );
    this.name = 'UnsupportedVersionError';
  }
}

export function migrateProject(raw: unknown): Project {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Project data is not a valid object.');
  }
  let data = { ...(raw as RawProject) };
  let version = typeof data.schemaVersion === 'number' ? data.schemaVersion : 1;

  if (version > SCHEMA_VERSION) throw new UnsupportedVersionError(version);

  while (version < SCHEMA_VERSION) {
    const migrate = migrations[version];
    if (!migrate) {
      data.schemaVersion = SCHEMA_VERSION;
      break;
    }
    data = migrate(data);
    version = typeof data.schemaVersion === 'number' ? data.schemaVersion : version + 1;
  }

  return repairProject(data);
}

/**
 * Bring a document up to the invariants the editor relies on. Anything
 * unrecognised is dropped rather than allowed to crash the canvas: a slightly
 * lossy open beats an unopenable project.
 */
export function repairProject(raw: RawProject): Project {
  const now = Date.now();
  const seenNodeIds = new Set<string>();

  const pages = asArray(raw.pages)
    .map((page) => repairPage(page as RawProject, seenNodeIds))
    .filter((page): page is Page => page !== null);

  if (pages.length === 0) {
    pages.push({ id: pageId(), name: 'Home', slug: '', isHome: true, seo: {}, nodes: [] });
  }

  // Exactly one home page, and it always owns the root slug.
  const homeIndex = Math.max(
    pages.findIndex((page) => page.isHome),
    0,
  );
  const usedSlugs: string[] = [];
  pages.forEach((page, index) => {
    page.isHome = index === homeIndex;
    if (page.isHome) {
      page.slug = '';
    } else {
      page.slug = uniqueSlug(slugify(page.slug || page.name) || 'page', usedSlugs);
      usedSlugs.push(page.slug);
    }
  });

  const theme = raw.theme as Project['theme'] | undefined;
  const settings = raw.settings as Partial<Project['settings']> | undefined;
  const name = asString(raw.name, 'Untitled website');

  return {
    id: asString(raw.id, projectId()),
    name,
    schemaVersion: SCHEMA_VERSION,
    createdAt: asNumber(raw.createdAt, now),
    updatedAt: asNumber(raw.updatedAt, now),
    templateId: typeof raw.templateId === 'string' ? raw.templateId : undefined,
    settings: {
      siteName: asString(settings?.siteName, name),
      description: asString(settings?.description, ''),
      language: asString(settings?.language, 'en'),
      baseUrl: asString(settings?.baseUrl, 'https://example.com'),
      robotsAllow: settings?.robotsAllow !== false,
      faviconAssetId: settings?.faviconAssetId,
      socialImageAssetId: settings?.socialImageAssetId,
    },
    theme: {
      colors: { ...DEFAULT_THEME.colors, ...(theme?.colors ?? {}) },
      typography: { ...DEFAULT_THEME.typography, ...(theme?.typography ?? {}) },
      radius: { ...DEFAULT_THEME.radius, ...(theme?.radius ?? {}) },
      containerWidth: asNumber(theme?.containerWidth, DEFAULT_THEME.containerWidth),
    },
    navigation: {
      items: asArray((raw.navigation as RawProject | undefined)?.items)
        .map((item) => {
          const record = item as RawProject;
          if (!record || typeof record !== 'object') return null;
          return {
            id: asString(record.id, nodeId()),
            label: asString(record.label, 'Link'),
            pageId: typeof record.pageId === 'string' ? record.pageId : undefined,
            url: typeof record.url === 'string' ? record.url : undefined,
            newTab: record.newTab === true,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
        // Drop navigation entries pointing at deleted pages.
        .filter((item) => !item.pageId || pages.some((page) => page.id === item.pageId)),
    },
    pages,
    assets: asArray(raw.assets)
      .map((asset) => asset as Project['assets'][number])
      .filter((asset) => asset && typeof asset.id === 'string'),
  };
}

function repairPage(raw: RawProject, seenNodeIds: Set<string>): Page | null {
  if (!raw || typeof raw !== 'object') return null;
  const name = asString(raw.name, 'Untitled page');
  return {
    id: asString(raw.id, pageId()),
    name,
    slug: asString(raw.slug, slugify(name)),
    isHome: raw.isHome === true,
    seo: (raw.seo && typeof raw.seo === 'object' ? raw.seo : {}) as Page['seo'],
    nodes: asArray(raw.nodes)
      .map((node) => repairNode(node as RawProject, seenNodeIds))
      .filter((node): node is BuilderNode => node !== null),
  };
}

function repairNode(raw: RawProject, seen: Set<string>): BuilderNode | null {
  if (!raw || typeof raw !== 'object' || typeof raw.type !== 'string') return null;
  let id = asString(raw.id, nodeId());
  // Duplicate ids break selection and undo; re-key rather than refuse to open.
  if (seen.has(id)) id = nodeId();
  seen.add(id);

  const node: BuilderNode = {
    id,
    type: raw.type,
    props: (raw.props && typeof raw.props === 'object' ? raw.props : {}) as Record<string, unknown>,
  };
  if (typeof raw.name === 'string') node.name = raw.name;
  if (raw.styles && typeof raw.styles === 'object') node.styles = raw.styles as BuilderNode['styles'];
  if (raw.hidden && typeof raw.hidden === 'object') node.hidden = raw.hidden as BuilderNode['hidden'];
  if (raw.animation && typeof raw.animation === 'object') {
    node.animation = raw.animation as BuilderNode['animation'];
  }
  if (raw.locked === true) node.locked = true;
  if (Array.isArray(raw.children)) {
    node.children = raw.children
      .map((child) => repairNode(child as RawProject, seen))
      .filter((child): child is BuilderNode => child !== null);
  }
  return node;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}
