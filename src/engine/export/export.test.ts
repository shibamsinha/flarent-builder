import { beforeAll, describe, expect, it } from 'vitest';
import type { Project } from '@/types/project';
import { registerBuiltInComponents } from '@/engine/registry/components';
import { createNode } from '@/engine/registry/registry';
import { createEmptyProject } from '@/engine/schema/defaults';
import * as commands from '@/engine/commands';
import { buildStylesheet } from './css';
import { buildRobots, buildSitemap, buildStaticSite, pagePath, resolveExportHref } from './staticExport';

beforeAll(() => registerBuiltInComponents());

function siteWithPages(): Project {
  let project = createEmptyProject('Export test');
  project = commands.updateSettings(project, { baseUrl: 'https://flarent.test' });
  const home = project.pages[0];

  const heading = createNode('heading', { props: { text: 'Hello world', level: 'h1' } });
  const section = createNode('section', { children: [heading] });
  project = commands.addNode(project, { pageId: home.id, node: section, parentId: null, index: 0 });
  project = commands.updateNodeStyles(project, home.id, heading.id, 'mobile', { fontSize: 24 });

  const created = commands.createPage(project, { name: 'About' });
  return created.project;
}

describe('stylesheet generation', () => {
  it('emits base rules unwrapped and narrower ones in max-width queries', () => {
    const project = siteWithPages();
    const css = buildStylesheet(project);
    const nodeId = project.pages[0].nodes[0].id;

    expect(css).toContain(':root');
    expect(css).toContain('--fl-color-primary');
    expect(css).toContain(`.fl-n-${nodeId}`);
    expect(css).toContain('@media (max-width: 640px)');
    expect(css).toContain('font-size: 24px');
  });

  it('converts camelCase keys and numeric values correctly', () => {
    const project = siteWithPages();
    const css = buildStylesheet(project);
    expect(css).toContain('padding-top');
    expect(css).toMatch(/line-height: 1\.15;/);
  });

  it('emits a display:none rule for hidden nodes', () => {
    let project = siteWithPages();
    const home = project.pages[0];
    project = commands.setNodeHidden(project, home.id, home.nodes[0].id, 'mobile', true);
    expect(buildStylesheet(project)).toContain('display: none !important');
  });
});

describe('page paths and links', () => {
  it('puts the home page at the root and others in folders', () => {
    const project = siteWithPages();
    expect(pagePath(project.pages[0])).toBe('index.html');
    expect(pagePath(project.pages[1])).toBe('about/index.html');
  });

  it('builds relative hrefs that work from any depth', () => {
    const project = siteWithPages();
    const [home, about] = project.pages;

    expect(resolveExportHref({ kind: 'page', pageId: about.id }, project, home)).toBe('about/index.html');
    expect(resolveExportHref({ kind: 'page', pageId: home.id }, project, about)).toBe('../index.html');
  });

  it('blocks dangerous URLs', () => {
    const project = siteWithPages();
    const href = resolveExportHref(
      { kind: 'url', url: 'javascript:alert(1)' },
      project,
      project.pages[0],
    );
    expect(href).toBeUndefined();
  });

  it('builds mailto and tel links', () => {
    const project = siteWithPages();
    const page = project.pages[0];
    expect(resolveExportHref({ kind: 'email', value: 'a@b.com' }, project, page)).toBe('mailto:a@b.com');
    expect(resolveExportHref({ kind: 'phone', value: '+1 (555) 000' }, project, page)).toBe('tel:+1555000');
  });
});

describe('seo files', () => {
  it('lists every indexable page in the sitemap', () => {
    const project = siteWithPages();
    const sitemap = buildSitemap(project);
    expect(sitemap).toContain('<loc>https://flarent.test/</loc>');
    expect(sitemap).toContain('<loc>https://flarent.test/about/</loc>');
  });

  it('omits pages marked noindex', () => {
    let project = siteWithPages();
    project = commands.updatePage(project, project.pages[1].id, { seo: { noIndex: true } });
    expect(buildSitemap(project)).not.toContain('/about/');
  });

  it('writes robots.txt from the site setting', () => {
    const project = siteWithPages();
    expect(buildRobots(project)).toContain('Allow: /');
    expect(buildRobots(commands.updateSettings(project, { robotsAllow: false }))).toContain('Disallow: /');
  });
});

describe('buildStaticSite', () => {
  it('produces a complete, self-contained site', async () => {
    const project = siteWithPages();
    const files = await buildStaticSite(project);
    const paths = files.map((file) => file.path);

    expect(paths).toContain('index.html');
    expect(paths).toContain('about/index.html');
    expect(paths).toContain('styles.css');
    expect(paths).toContain('flarent.js');
    expect(paths).toContain('sitemap.xml');
    expect(paths).toContain('robots.txt');
  });

  it('renders real markup, not editor chrome', async () => {
    const project = siteWithPages();
    const files = await buildStaticSite(project);
    const html = files.find((file) => file.path === 'index.html')?.text ?? '';

    expect(html).toContain('<!doctype html>');
    expect(html).toContain('Hello world');
    expect(html).toContain('<h1');
    expect(html).toContain('<link rel="stylesheet" href="styles.css">');
    // No editor artefacts leak into the published page.
    expect(html).not.toContain('f-overlay');
    expect(html).not.toContain('Drop elements into');
  });

  it('references the stylesheet relatively from nested pages', async () => {
    const project = siteWithPages();
    const files = await buildStaticSite(project);
    const html = files.find((file) => file.path === 'about/index.html')?.text ?? '';
    expect(html).toContain('href="../styles.css"');
  });

  it('includes SEO metadata', async () => {
    let project = siteWithPages();
    project = commands.updatePage(project, project.pages[0].id, {
      seo: { title: 'Home page', description: 'A description' },
    });
    const files = await buildStaticSite(project);
    const html = files.find((file) => file.path === 'index.html')?.text ?? '';

    expect(html).toContain('<title>Home page</title>');
    expect(html).toContain('name="description" content="A description"');
    expect(html).toContain('property="og:title"');
    expect(html).toContain('rel="canonical"');
  });
});
