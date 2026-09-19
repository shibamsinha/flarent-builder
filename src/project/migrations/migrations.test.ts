import { describe, expect, it } from 'vitest';
import { SCHEMA_VERSION } from '@/types/project';
import { collectIds } from '@/engine/commands/tree';
import { migrateProject, UnsupportedVersionError } from './index';

describe('migrateProject', () => {
  it('rejects non-objects', () => {
    expect(() => migrateProject(null)).toThrow();
    expect(() => migrateProject('nope')).toThrow();
  });

  it('refuses documents from a newer schema', () => {
    expect(() => migrateProject({ schemaVersion: SCHEMA_VERSION + 5 })).toThrow(
      UnsupportedVersionError,
    );
  });

  it('stamps the current schema version', () => {
    const project = migrateProject({ name: 'Site', pages: [] });
    expect(project.schemaVersion).toBe(SCHEMA_VERSION);
  });

  it('always produces at least one home page', () => {
    const project = migrateProject({ name: 'Site', pages: [] });
    expect(project.pages).toHaveLength(1);
    expect(project.pages[0].isHome).toBe(true);
    expect(project.pages[0].slug).toBe('');
  });

  it('promotes exactly one home page and re-slugs the rest', () => {
    const project = migrateProject({
      name: 'Site',
      pages: [
        { id: 'p1', name: 'Home', slug: '', isHome: true, nodes: [] },
        { id: 'p2', name: 'About', slug: '', isHome: true, nodes: [] },
      ],
    });
    expect(project.pages.filter((p) => p.isHome)).toHaveLength(1);
    expect(project.pages[1].slug).toBe('about');
  });

  it('deduplicates slugs', () => {
    const project = migrateProject({
      name: 'Site',
      pages: [
        { id: 'p1', name: 'Home', nodes: [] },
        { id: 'p2', name: 'Work', slug: 'work', nodes: [] },
        { id: 'p3', name: 'Work', slug: 'work', nodes: [] },
      ],
    });
    const slugs = project.pages.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('drops malformed nodes rather than failing to open', () => {
    const project = migrateProject({
      name: 'Site',
      pages: [
        {
          id: 'p1',
          name: 'Home',
          nodes: [
            { id: 'n1', type: 'section', props: {}, children: [null, { noType: true }, { id: 'n2', type: 'text' }] },
            'garbage',
          ],
        },
      ],
    });
    expect(project.pages[0].nodes).toHaveLength(1);
    expect(project.pages[0].nodes[0].children).toHaveLength(1);
  });

  it('re-keys duplicated node ids', () => {
    const project = migrateProject({
      name: 'Site',
      pages: [
        {
          id: 'p1',
          name: 'Home',
          nodes: [
            { id: 'same', type: 'section', props: {} },
            { id: 'same', type: 'section', props: {} },
          ],
        },
      ],
    });
    const ids = collectIds(project.pages[0].nodes);
    expect(new Set(ids).size).toBe(2);
  });

  it('fills in missing theme and settings with defaults', () => {
    const project = migrateProject({ name: 'Site', pages: [], theme: { colors: { primary: '#123456' } } });
    expect(project.theme.colors.primary).toBe('#123456');
    expect(project.theme.colors.background).toBeTruthy();
    expect(project.theme.radius.md).toBeGreaterThan(0);
    expect(project.settings.siteName).toBe('Site');
  });

  it('removes navigation entries for pages that no longer exist', () => {
    const project = migrateProject({
      name: 'Site',
      pages: [{ id: 'p1', name: 'Home', nodes: [] }],
      navigation: { items: [{ id: 'n1', label: 'Gone', pageId: 'deleted' }] },
    });
    expect(project.navigation.items).toHaveLength(0);
  });
});
