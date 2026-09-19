import { renderToStaticMarkup } from 'react-dom/server';
import type { Page, Project } from '@/types/project';
import type { LinkValue } from '@/types/props';
import { assetRefId, isAssetRef } from '@/types/props';
import type { RenderEnv } from '@/engine/registry/types';
import { PageRenderer } from '@/engine/renderer/PageRenderer';
import { RenderEnvContext } from '@/engine/renderer/context';
import { googleFontsHref } from '@/engine/theme';
import { getAssetService } from '@/services/assets';
import { escapeHtml, sanitizeUrl } from '@/utils/sanitize';
import { buildStylesheet } from './css';
import { EXPORT_SCRIPT } from './script';

export interface ExportedFile {
  path: string;
  /** Text files carry `text`; binary assets carry `blob`. */
  text?: string;
  blob?: Blob;
}

export interface ExportOptions {
  /** Include sitemap.xml and robots.txt. */
  includeSeoFiles?: boolean;
}

/** Path of a page inside the exported site. */
export function pagePath(page: Page): string {
  return page.isHome ? 'index.html' : `${page.slug}/index.html`;
}

function prefixFor(page: Page): string {
  return page.isHome ? '' : '../';
}

function assetFileName(id: string, filename: string): string {
  const safe = (filename || 'asset')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(-60);
  return `${id}-${safe || 'asset'}`;
}

/**
 * Produce every file the published website needs.
 *
 * The markup comes from the same renderer the canvas uses, so the export is a
 * faithful copy of what was designed rather than a second implementation.
 */
export async function buildStaticSite(
  project: Project,
  options: ExportOptions = {},
): Promise<ExportedFile[]> {
  const files: ExportedFile[] = [];
  const assetService = getAssetService();

  // 1. Assets ---------------------------------------------------------------
  const assetPaths = new Map<string, string>();
  for (const asset of project.assets) {
    const blob = await assetService.getBlob(project.id, asset.id);
    if (!blob) continue; // A missing asset must not fail the whole export.
    const name = assetFileName(asset.id, asset.filename);
    assetPaths.set(asset.id, `assets/${name}`);
    files.push({ path: `assets/${name}`, blob });
  }

  // 2. Stylesheet and behaviour --------------------------------------------
  files.push({ path: 'styles.css', text: buildStylesheet(project) });
  files.push({ path: 'flarent.js', text: EXPORT_SCRIPT });

  // 3. Pages ----------------------------------------------------------------
  for (const page of project.pages) {
    const prefix = prefixFor(page);
    const env: RenderEnv = {
      mode: 'export',
      device: 'desktop',
      project,
      currentPageId: page.id,
      resolveAssetUrl: (ref) => resolveExportAsset(ref, assetPaths, prefix),
      resolveHref: (linkValue) => resolveExportHref(linkValue, project, page),
    };

    const markup = renderToStaticMarkup(
      <RenderEnvContext.Provider value={env}>
        <PageRenderer page={page} />
      </RenderEnvContext.Provider>,
    );

    files.push({ path: pagePath(page), text: renderDocument(project, page, markup, prefix, assetPaths) });
  }

  // 4. SEO files ------------------------------------------------------------
  if (options.includeSeoFiles !== false) {
    files.push({ path: 'sitemap.xml', text: buildSitemap(project) });
    files.push({ path: 'robots.txt', text: buildRobots(project) });
  }

  return files;
}

function resolveExportAsset(
  ref: string | undefined,
  assetPaths: Map<string, string>,
  prefix: string,
): string | undefined {
  if (!ref) return undefined;
  if (!isAssetRef(ref)) return sanitizeUrl(ref);
  const path = assetPaths.get(assetRefId(ref));
  return path ? `${prefix}${path}` : undefined;
}

export function resolveExportHref(
  link: LinkValue | undefined,
  project: Project,
  current: Page,
): string | undefined {
  if (!link || link.kind === 'none') return undefined;
  switch (link.kind) {
    case 'page': {
      const target = project.pages.find((p) => p.id === link.pageId);
      if (!target) return undefined;
      return `${prefixFor(current)}${pagePath(target)}`;
    }
    case 'url':
      return sanitizeUrl(link.url);
    case 'anchor':
      return link.anchor ? `#${link.anchor.replace(/^#/, '')}` : undefined;
    case 'email':
      return link.value ? `mailto:${link.value}` : undefined;
    case 'phone':
      return link.value ? `tel:${link.value.replace(/[^\d+]/g, '')}` : undefined;
    default:
      return undefined;
  }
}

function renderDocument(
  project: Project,
  page: Page,
  markup: string,
  prefix: string,
  assetPaths: Map<string, string>,
): string {
  const { settings, theme } = project;
  const title = page.seo.title || `${page.name} — ${settings.siteName}`;
  const description = page.seo.description || settings.description;
  const canonical =
    page.seo.canonical ||
    (settings.baseUrl ? joinUrl(settings.baseUrl, page.isHome ? '' : `${page.slug}/`) : '');
  const favicon = settings.faviconAssetId ? assetPaths.get(settings.faviconAssetId) : undefined;
  const ogImageId = page.seo.ogImage || settings.socialImageAssetId;
  const ogImage = ogImageId ? assetPaths.get(ogImageId.replace(/^asset:/, '')) : undefined;
  const fonts = googleFontsHref(theme);

  const head: string[] = [
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${escapeHtml(title)}</title>`,
  ];
  if (description) head.push(`<meta name="description" content="${escapeHtml(description)}">`);
  if (page.seo.noIndex) head.push('<meta name="robots" content="noindex, nofollow">');
  if (canonical) head.push(`<link rel="canonical" href="${escapeHtml(canonical)}">`);
  head.push(`<meta property="og:type" content="website">`);
  head.push(`<meta property="og:title" content="${escapeHtml(page.seo.ogTitle || title)}">`);
  if (page.seo.ogDescription || description) {
    head.push(
      `<meta property="og:description" content="${escapeHtml(page.seo.ogDescription || description)}">`,
    );
  }
  if (canonical) head.push(`<meta property="og:url" content="${escapeHtml(canonical)}">`);
  if (ogImage) head.push(`<meta property="og:image" content="${escapeHtml(prefix + ogImage)}">`);
  head.push('<meta name="twitter:card" content="summary_large_image">');
  if (favicon) head.push(`<link rel="icon" href="${escapeHtml(prefix + favicon)}">`);
  if (fonts) {
    head.push('<link rel="preconnect" href="https://fonts.googleapis.com">');
    head.push('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>');
    head.push(`<link rel="stylesheet" href="${escapeHtml(fonts)}">`);
  }
  head.push(`<link rel="stylesheet" href="${prefix}styles.css">`);

  return `<!doctype html>
<html lang="${escapeHtml(project.settings.language || 'en')}">
<head>
${head.map((line) => `  ${line}`).join('\n')}
</head>
<body class="fl-root">
${markup}
<script src="${prefix}flarent.js" defer></script>
</body>
</html>
`;
}

function joinUrl(base: string, path: string): string {
  const trimmed = base.replace(/\/+$/, '');
  return path ? `${trimmed}/${path.replace(/^\/+/, '')}` : `${trimmed}/`;
}

export function buildSitemap(project: Project): string {
  const base = project.settings.baseUrl?.replace(/\/+$/, '') || '';
  const lastmod = new Date(project.updatedAt).toISOString().slice(0, 10);
  const urls = project.pages
    .filter((page) => !page.seo.noIndex)
    .map((page) => {
      const loc = `${base}/${page.isHome ? '' : `${page.slug}/`}`;
      return `  <url>\n    <loc>${escapeHtml(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function buildRobots(project: Project): string {
  const base = project.settings.baseUrl?.replace(/\/+$/, '') || '';
  const lines = ['User-agent: *'];
  lines.push(project.settings.robotsAllow ? 'Allow: /' : 'Disallow: /');
  if (base) lines.push('', `Sitemap: ${base}/sitemap.xml`);
  return `${lines.join('\n')}\n`;
}
