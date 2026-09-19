import { beforeAll, describe, expect, it } from 'vitest';
import type { Project } from '@/types/project';
import { registerBuiltInComponents } from '@/engine/registry/components';
import { createNode } from '@/engine/registry/registry';
import { createEmptyProject } from '@/engine/schema/defaults';
import { collectIds, findNode, locateNode } from './tree';
import * as commands from './index';

beforeAll(() => registerBuiltInComponents());

function seed(): { project: Project; pageId: string } {
  const project = createEmptyProject('Test site');
  const pageId = project.pages[0].id;
  return { project, pageId };
}

function withSection(): { project: Project; pageId: string; sectionId: string } {
  const { project, pageId } = seed();
  const section = createNode('section', { children: [] });
  const next = commands.addNode(project, { pageId, node: section, parentId: null, index: 0 });
  return { project: next, pageId, sectionId: section.id };
}

describe('addNode', () => {
  it('adds a node to the page root', () => {
    const { project, pageId, sectionId } = withSection();
    expect(project.pages[0].nodes).toHaveLength(1);
    expect(findNode(project.pages[0].nodes, sectionId)).not.toBeNull();
    void pageId;
  });

  it('adds nested children', () => {
    const { project, pageId, sectionId } = withSection();
    const heading = createNode('heading');
    const next = commands.addNode(project, { pageId, node: heading, parentId: sectionId, index: 0 });
    expect(findNode(next.pages[0].nodes, sectionId)?.children).toHaveLength(1);
  });

  it('bumps updatedAt', () => {
    const { project, pageId } = seed();
    const before = project.updatedAt;
    const next = commands.addNode(project, {
      pageId,
      node: createNode('section'),
      parentId: null,
      index: 0,
    });
    expect(next.updatedAt).toBeGreaterThanOrEqual(before);
  });

  it('leaves the original project untouched', () => {
    const { project, pageId } = seed();
    commands.addNode(project, { pageId, node: createNode('section'), parentId: null, index: 0 });
    expect(project.pages[0].nodes).toHaveLength(0);
  });
});

describe('moveNode', () => {
  function threeSections() {
    const { project, pageId } = seed();
    const ids: string[] = [];
    let current = project;
    for (let i = 0; i < 3; i += 1) {
      const node = createNode('section', { children: [] });
      ids.push(node.id);
      current = commands.addNode(current, { pageId, node, parentId: null, index: i });
    }
    return { project: current, pageId, ids };
  }

  it('reorders siblings the way a user expects when moving down', () => {
    const { project, pageId, ids } = threeSections();
    // Move the first section to the end.
    const next = commands.moveNode(project, { pageId, nodeId: ids[0], parentId: null, index: 3 });
    expect(next.pages[0].nodes.map((n) => n.id)).toEqual([ids[1], ids[2], ids[0]]);
  });

  it('reorders siblings when moving up', () => {
    const { project, pageId, ids } = threeSections();
    const next = commands.moveNode(project, { pageId, nodeId: ids[2], parentId: null, index: 0 });
    expect(next.pages[0].nodes.map((n) => n.id)).toEqual([ids[2], ids[0], ids[1]]);
  });

  it('moves a node into another container', () => {
    const { project, pageId, ids } = threeSections();
    const next = commands.moveNode(project, { pageId, nodeId: ids[2], parentId: ids[0], index: 0 });
    expect(next.pages[0].nodes).toHaveLength(2);
    expect(locateNode(next.pages[0].nodes, ids[2])?.parent?.id).toBe(ids[0]);
  });

  it('ignores a move of a node that does not exist', () => {
    const { project, pageId } = threeSections();
    expect(commands.moveNode(project, { pageId, nodeId: 'ghost', parentId: null, index: 0 })).toBe(
      project,
    );
  });
});

describe('duplicateNode', () => {
  it('places the copy directly after the original with fresh ids', () => {
    const { project, pageId, sectionId } = withSection();
    const withChild = commands.addNode(project, {
      pageId,
      node: createNode('heading'),
      parentId: sectionId,
      index: 0,
    });

    const { project: next, newNodeId } = commands.duplicateNode(withChild, pageId, sectionId);
    const nodes = next.pages[0].nodes;

    expect(nodes).toHaveLength(2);
    expect(nodes[1].id).toBe(newNodeId);

    const allIds = collectIds(nodes);
    expect(new Set(allIds).size).toBe(allIds.length);
  });

  it('returns the project unchanged for a missing node', () => {
    const { project, pageId } = seed();
    const result = commands.duplicateNode(project, pageId, 'ghost');
    expect(result.project).toBe(project);
    expect(result.newNodeId).toBeNull();
  });
});

describe('props and styles', () => {
  it('merges prop patches', () => {
    const { project, pageId, sectionId } = withSection();
    const next = commands.updateNodeProps(project, pageId, sectionId, { tag: 'div' });
    expect(findNode(next.pages[0].nodes, sectionId)?.props.tag).toBe('div');
  });

  it('runs a component-declared child sync', () => {
    const { project, pageId } = seed();
    const columns = createNode('columns');
    const added = commands.addNode(project, { pageId, node: columns, parentId: null, index: 0 });
    expect(findNode(added.pages[0].nodes, columns.id)?.children).toHaveLength(2);

    const grown = commands.updateNodeProps(added, pageId, columns.id, { count: 4 });
    expect(findNode(grown.pages[0].nodes, columns.id)?.children).toHaveLength(4);

    const shrunk = commands.updateNodeProps(grown, pageId, columns.id, { count: 1 });
    expect(findNode(shrunk.pages[0].nodes, columns.id)?.children).toHaveLength(1);
  });

  it('writes styles to the requested breakpoint only', () => {
    const { project, pageId, sectionId } = withSection();
    const next = commands.updateNodeStyles(project, pageId, sectionId, 'mobile', { paddingTop: 12 });
    const node = findNode(next.pages[0].nodes, sectionId);
    expect(node?.styles?.mobile?.paddingTop).toBe(12);
    expect(node?.styles?.desktop?.paddingTop).toBe(96);
  });

  it('clears a breakpoint back to inherited values', () => {
    const { project, pageId, sectionId } = withSection();
    const withOverride = commands.updateNodeStyles(project, pageId, sectionId, 'mobile', {
      paddingTop: 12,
    });
    const cleared = commands.clearDeviceStyles(withOverride, pageId, sectionId, 'mobile');
    expect(findNode(cleared.pages[0].nodes, sectionId)?.styles?.mobile).toBeUndefined();
  });

  it('stores per-device visibility', () => {
    const { project, pageId, sectionId } = withSection();
    const hidden = commands.setNodeHidden(project, pageId, sectionId, 'mobile', true);
    expect(findNode(hidden.pages[0].nodes, sectionId)?.hidden?.mobile).toBe(true);

    const shown = commands.setNodeHidden(hidden, pageId, sectionId, 'mobile', false);
    expect(findNode(shown.pages[0].nodes, sectionId)?.hidden).toBeUndefined();
  });
});

describe('pages', () => {
  it('generates a slug from the name', () => {
    const { project } = seed();
    const { project: next, page } = commands.createPage(project, { name: 'About Us' });
    expect(page.slug).toBe('about-us');
    expect(next.pages).toHaveLength(2);
  });

  it('never creates duplicate slugs', () => {
    const { project } = seed();
    const first = commands.createPage(project, { name: 'About' });
    const second = commands.createPage(first.project, { name: 'About' });
    expect(second.page.slug).toBe('about-2');
  });

  it('keeps the home page at the root slug', () => {
    const { project } = seed();
    const next = commands.updatePage(project, project.pages[0].id, { slug: 'home' });
    expect(next.pages[0].slug).toBe('');
  });

  it('moves the root slug when the home page changes', () => {
    const { project } = seed();
    const withAbout = commands.createPage(project, { name: 'About' });
    const switched = commands.setHomePage(withAbout.project, withAbout.page.id);

    const about = switched.pages.find((p) => p.id === withAbout.page.id)!;
    const original = switched.pages.find((p) => p.id !== withAbout.page.id)!;

    expect(about.isHome).toBe(true);
    expect(about.slug).toBe('');
    expect(original.isHome).toBeFalsy();
    expect(original.slug).not.toBe('');
  });

  it('refuses to delete the only page', () => {
    const { project } = seed();
    expect(commands.deletePage(project, project.pages[0].id)).toBe(project);
  });

  it('removes navigation links pointing at a deleted page', () => {
    const { project } = seed();
    const created = commands.createPage(project, { name: 'Contact' });
    const withNav = commands.updateNavigation(created.project, {
      items: [{ id: 'nav1', label: 'Contact', pageId: created.page.id }],
    });
    const deleted = commands.deletePage(withNav, created.page.id);
    expect(deleted.navigation.items).toHaveLength(0);
  });

  it('duplicates a page with new node ids', () => {
    const { project, pageId } = withSection();
    const { project: next, page } = commands.duplicatePage(project, pageId);
    expect(page).not.toBeNull();

    const originalIds = collectIds(next.pages[0].nodes);
    const copyIds = collectIds(page!.nodes);
    expect(copyIds).toHaveLength(originalIds.length);
    for (const id of copyIds) expect(originalIds).not.toContain(id);
  });
});

describe('theme and settings', () => {
  it('merges a single token without dropping the rest', () => {
    const { project } = seed();
    const next = commands.updateTheme(project, { colors: { primary: '#000000' } });
    expect(next.theme.colors.primary).toBe('#000000');
    expect(next.theme.colors.secondary).toBe(project.theme.colors.secondary);
    expect(next.theme.typography.bodyFont).toBe(project.theme.typography.bodyFont);
  });

  it('merges settings patches', () => {
    const { project } = seed();
    const next = commands.updateSettings(project, { baseUrl: 'https://flarent.test' });
    expect(next.settings.baseUrl).toBe('https://flarent.test');
    expect(next.settings.siteName).toBe(project.settings.siteName);
  });
});
