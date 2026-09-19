import type { BuilderNode, Page, PageSeo, Project, ThemeConfig } from '@/types/project';
import { SCHEMA_VERSION } from '@/types/project';
import type { LinkValue } from '@/types/props';
import { walkTree } from '@/engine/commands/tree';
import { n } from '@/engine/registry/build';
import { DEFAULT_THEME } from '@/engine/schema/defaults';
import { nodeId, pageId, projectId } from '@/utils/id';

export interface PageSpec {
  name: string;
  slug?: string;
  isHome?: boolean;
  seo?: PageSeo;
  nodes: BuilderNode[];
}

export interface SiteSpec {
  templateId: string;
  siteName: string;
  description: string;
  theme: Partial<ThemeConfig> & { colors?: Partial<ThemeConfig['colors']> };
  pages: PageSpec[];
}

/** Reference a page by name; resolved to a real id once pages exist. */
export function pageLink(name: string, newTab = false): LinkValue {
  return { kind: 'page', pageId: `@${name}`, newTab };
}

export function urlLink(url: string, newTab = true): LinkValue {
  return { kind: 'url', url, newTab };
}

export function assembleProject(spec: SiteSpec, projectName?: string): Project {
  const now = Date.now();
  const pages: Page[] = spec.pages.map((page, index) => ({
    id: pageId(),
    name: page.name,
    slug: page.isHome ?? index === 0 ? '' : (page.slug ?? slug(page.name)),
    isHome: page.isHome ?? index === 0,
    seo: page.seo ?? { title: `${page.name} — ${spec.siteName}` },
    nodes: page.nodes,
  }));

  const byName = new Map(pages.map((page) => [page.name, page.id]));

  // Resolve every `@PageName` reference now that ids exist.
  for (const page of pages) {
    walkTree(page.nodes, (node) => {
      resolveLinks(node.props, byName);
    });
  }

  return {
    id: projectId(),
    name: projectName?.trim() || spec.siteName,
    schemaVersion: SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
    templateId: spec.templateId,
    settings: {
      siteName: projectName?.trim() || spec.siteName,
      description: spec.description,
      language: 'en',
      baseUrl: 'https://example.com',
      robotsAllow: true,
    },
    theme: {
      colors: { ...DEFAULT_THEME.colors, ...(spec.theme.colors ?? {}) },
      typography: { ...DEFAULT_THEME.typography, ...(spec.theme.typography ?? {}) },
      radius: { ...DEFAULT_THEME.radius, ...(spec.theme.radius ?? {}) },
      containerWidth: spec.theme.containerWidth ?? DEFAULT_THEME.containerWidth,
    },
    navigation: {
      items: pages.map((page) => ({ id: nodeId(), label: page.name, pageId: page.id })),
    },
    pages,
    assets: [],
  };
}

function resolveLinks(value: unknown, byName: Map<string, string>): void {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    for (const item of value) resolveLinks(item, byName);
    return;
  }
  const record = value as Record<string, unknown>;
  if (record.kind === 'page' && typeof record.pageId === 'string' && record.pageId.startsWith('@')) {
    const resolved = byName.get(record.pageId.slice(1));
    if (resolved) record.pageId = resolved;
    else record.kind = 'none';
  }
  for (const item of Object.values(record)) resolveLinks(item, byName);
}

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/* ------------------------- reusable page parts ------------------------- */

export function navbar(options: {
  brand: string;
  ctaLabel?: string;
  ctaPage?: string;
  sticky?: boolean;
  background?: string;
  text?: string;
}): BuilderNode {
  return n(
    'navbar',
    {
      logoText: options.brand,
      showCta: options.ctaLabel !== undefined,
      ctaLabel: options.ctaLabel ?? 'Contact',
      ctaLink: options.ctaPage ? pageLink(options.ctaPage) : { kind: 'none' },
      sticky: options.sticky ?? true,
    },
    {
      desktop: {
        backgroundColor: options.background ?? 'var(--fl-color-background)',
        color: options.text ?? 'var(--fl-color-text)',
      },
    },
  );
}

export function footer(options: {
  brand: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  hoursNote?: string;
  background?: string;
}): BuilderNode {
  const faint = 'rgba(255,255,255,0.64)';
  const column = (title: string, body: string) =>
    n('column', {}, {}, [
      n('heading', { text: title, level: 'h4' }, { desktop: { color: '#fff', fontSize: 15, letterSpacing: '0.06em', textTransform: 'uppercase' } }),
      n('text', { text: body }, { desktop: { color: faint, fontSize: 15 } }),
    ]);

  return n('footer', {}, { desktop: { backgroundColor: options.background ?? 'var(--fl-color-text)' } }, [
    n('container', {}, { desktop: { gap: 36 } }, [
      n('columns', { count: 4 }, { desktop: { gap: 36 } }, [
        n('column', {}, {}, [
          n('heading', { text: options.brand, level: 'h3' }, { desktop: { color: '#fff', fontSize: 22 } }),
          n('text', { text: options.tagline }, { desktop: { color: faint, fontSize: 15 } }),
          n('socialLinks', { size: 18, shape: 'circle' }, { desktop: { marginTop: 6 } }),
        ]),
        column('Contact', `${options.email}<br>${options.phone}`),
        column('Visit', options.address),
        column('Hours', options.hoursNote ?? 'Mon–Fri 9:00–18:00<br>Sat 10:00–16:00'),
      ]),
      n('divider', { color: 'rgba(255,255,255,0.14)' }),
      n('text', { text: `© ${new Date().getFullYear()} ${options.brand}. All rights reserved.` }, {
        desktop: { color: 'rgba(255,255,255,0.45)', fontSize: 13, textAlign: 'center' },
      }),
    ]),
  ]);
}

/** A complete, realistic contact page shared by every template. */
export function contactPage(options: {
  brand: string;
  intro: string;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  surface?: string;
}): BuilderNode[] {
  return [
    n('section', {}, { desktop: { paddingTop: 72, paddingBottom: 24, backgroundColor: options.surface ?? 'var(--fl-color-surface)' } }, [
      n('container', {}, { desktop: { gap: 14, alignItems: 'center', textAlign: 'center', maxWidth: 720 } }, [
        n('heading', { text: 'Get in touch', level: 'h1' }, { desktop: { fontSize: 52, textAlign: 'center' }, mobile: { fontSize: 32 } }),
        n('text', { text: options.intro }, { desktop: { fontSize: 18, textAlign: 'center' } }),
      ]),
    ]),
    n('section', {}, { desktop: { paddingTop: 56, paddingBottom: 88 } }, [
      n('container', {}, {}, [
        n('columns', { count: 2, ratio: '1:2' }, { desktop: { gap: 44, alignItems: 'start' } }, [
          n('column', {}, { desktop: { gap: 24 } }, [
            n('businessHours', {}),
            n('card', {}, { desktop: { gap: 10 } }, [
              n('heading', { text: 'Find us', level: 'h3' }, { desktop: { fontSize: 18 } }),
              n('text', { text: `${options.address}<br>${options.phone}<br>${options.email}` }, { desktop: { fontSize: 15 } }),
              n('whatsapp', { phone: options.whatsapp, label: 'Message us on WhatsApp', size: 'sm' }, { desktop: { marginTop: 8 } }),
            ]),
          ]),
          n('column', {}, {}, [n('contactForm', { layout: 'grid' })]),
        ]),
      ]),
    ]),
    n('section', {}, { desktop: { paddingTop: 0, paddingBottom: 88 } }, [
      n('container', {}, {}, [n('map', { address: options.address, height: 420 })]),
    ]),
  ];
}
