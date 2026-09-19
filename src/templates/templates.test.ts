import { beforeAll, describe, expect, it } from 'vitest';
import type { BuilderNode, Project } from '@/types/project';
import { registerBuiltInComponents } from '@/engine/registry/components';
import { getComponent } from '@/engine/registry/registry';
import { collectIds, walkTree } from '@/engine/commands/tree';
import { canContain, ROOT_PARENT } from '@/engine/validation';
import { TEMPLATES } from './index';

beforeAll(() => registerBuiltInComponents());

describe.each(TEMPLATES.map((template) => [template.name, template] as const))(
  'template: %s',
  (_name, template) => {
    let project: Project;

    beforeAll(() => {
      project = template.build('My test site');
    });

    it('builds a usable project', () => {
      expect(project.pages.length).toBeGreaterThan(0);
      expect(project.pages.filter((page) => page.isHome)).toHaveLength(1);
      expect(project.name).toBe('My test site');
      expect(project.templateId).toBe(template.id);
    });

    it('only uses registered components', () => {
      for (const page of project.pages) {
        walkTree(page.nodes, (node: BuilderNode) => {
          expect(getComponent(node.type), `${node.type} is not registered`).toBeDefined();
        });
      }
    });

    it('produces a structurally valid tree', () => {
      for (const page of project.pages) {
        for (const root of page.nodes) {
          expect(canContain(ROOT_PARENT, root.type).allowed, `${root.type} at root`).toBe(true);
        }
        walkTree(page.nodes, (node) => {
          for (const child of node.children ?? []) {
            const check = canContain(node.type, child.type);
            expect(check.allowed, `${child.type} inside ${node.type}: ${check.reason}`).toBe(true);
          }
        });
      }
    });

    it('gives every node a unique id', () => {
      for (const page of project.pages) {
        const ids = collectIds(page.nodes);
        expect(new Set(ids).size).toBe(ids.length);
      }
    });

    it('uses unique page slugs with the home page at the root', () => {
      const slugs = project.pages.map((page) => page.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
      expect(project.pages.find((page) => page.isHome)?.slug).toBe('');
    });

    it('resolves every internal link to a real page', () => {
      const pageIds = new Set(project.pages.map((page) => page.id));
      const checkValue = (value: unknown) => {
        if (!value || typeof value !== 'object') return;
        if (Array.isArray(value)) {
          value.forEach(checkValue);
          return;
        }
        const record = value as Record<string, unknown>;
        if (record.kind === 'page' && typeof record.pageId === 'string') {
          expect(pageIds.has(record.pageId), `dangling page link ${record.pageId}`).toBe(true);
        }
        Object.values(record).forEach(checkValue);
      };

      for (const page of project.pages) {
        walkTree(page.nodes, (node) => checkValue(node.props));
      }
    });

    it('points navigation at pages that exist', () => {
      const pageIds = new Set(project.pages.map((page) => page.id));
      for (const item of project.navigation.items) {
        if (item.pageId) expect(pageIds.has(item.pageId)).toBe(true);
      }
    });
  },
);

describe('template catalogue', () => {
  it('ships the five starting templates plus a blank one', () => {
    expect(TEMPLATES.length).toBeGreaterThanOrEqual(6);
    const ids = TEMPLATES.map((t) => t.id);
    expect(ids).toContain('modern-business');
    expect(ids).toContain('restaurant');
    expect(ids).toContain('gym-fitness');
    expect(ids).toContain('interior-design');
    expect(ids).toContain('saas-startup');
    expect(ids).toContain('blank');
  });

  it('gives each template a distinct id', () => {
    const ids = TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('builds independent projects each time', () => {
    const a = TEMPLATES[0].build('A');
    const b = TEMPLATES[0].build('B');
    expect(a.id).not.toBe(b.id);
    expect(a.pages[0].id).not.toBe(b.pages[0].id);
  });
});
