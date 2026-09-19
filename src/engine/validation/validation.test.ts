import { beforeAll, describe, expect, it } from 'vitest';
import type { BuilderNode } from '@/types/project';
import { registerBuiltInComponents } from '@/engine/registry/components';
import { createNode } from '@/engine/registry/registry';
import { canContain, canMoveNode, findValidParent, isContainerType, ROOT_PARENT } from './index';

beforeAll(() => registerBuiltInComponents());

describe('nesting rules', () => {
  it('lets sections sit at the top level', () => {
    expect(canContain(ROOT_PARENT, 'section').allowed).toBe(true);
    expect(canContain(ROOT_PARENT, 'hero').allowed).toBe(true);
  });

  it('refuses internal components at the top level', () => {
    const result = canContain(ROOT_PARENT, 'column');
    expect(result.allowed).toBe(false);
    expect(result.reason).toBeTruthy();
  });

  it('refuses children inside leaf components', () => {
    expect(canContain('button', 'section').allowed).toBe(false);
    expect(canContain('heading', 'text').allowed).toBe(false);
  });

  it('restricts Columns to column children', () => {
    expect(canContain('columns', 'column').allowed).toBe(true);
    expect(canContain('columns', 'heading').allowed).toBe(false);
  });

  it('allows normal content inside containers', () => {
    expect(canContain('container', 'heading').allowed).toBe(true);
    expect(canContain('card', 'button').allowed).toBe(true);
  });

  it('knows which types accept children', () => {
    expect(isContainerType('section')).toBe(true);
    expect(isContainerType('image')).toBe(false);
  });

  it('rejects unknown component types', () => {
    expect(canContain('container', 'nonsense').allowed).toBe(false);
  });
});

describe('move validation', () => {
  function sample(): BuilderNode[] {
    const child = createNode('heading');
    const container = createNode('container', { children: [child] });
    const section = createNode('section', { children: [container] });
    return [section];
  }

  it('stops a node being dropped inside itself', () => {
    const nodes = sample();
    const section = nodes[0];
    const container = section.children![0];
    const result = canMoveNode(nodes, section.id, container.id);
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/inside itself/i);
  });

  it('allows a valid move', () => {
    const nodes = sample();
    const container = nodes[0].children![0];
    const heading = container.children![0];
    expect(canMoveNode(nodes, heading.id, nodes[0].id).allowed).toBe(true);
  });

  it('rejects a move onto a component that takes no children', () => {
    const nodes = sample();
    const container = nodes[0].children![0];
    const heading = container.children![0];
    const button = createNode('button');
    container.children!.push(button);
    expect(canMoveNode(nodes, heading.id, button.id).allowed).toBe(false);
  });
});

describe('findValidParent', () => {
  it('walks up until a container accepts the component', () => {
    const heading = createNode('heading');
    const container = createNode('container', { children: [heading] });
    const section = createNode('section', { children: [container] });
    const nodes = [section];

    // A heading cannot go inside another heading, so it lands in the container.
    const target = findValidParent(nodes, heading.id, 'text');
    expect(target?.parentId).toBe(container.id);
  });

  it('falls back to the page root', () => {
    const target = findValidParent([], null, 'section');
    expect(target).toEqual({ parentId: null, index: 0 });
  });

  it('returns null when nothing can hold the component', () => {
    expect(findValidParent([], null, 'column')).toBeNull();
  });
});
