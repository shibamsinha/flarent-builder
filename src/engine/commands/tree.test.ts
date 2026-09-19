import { describe, expect, it } from 'vitest';
import type { BuilderNode } from '@/types/project';
import {
  cloneSubtree, collectIds, countNodes, findNode, insertNodeInTree, isDescendant, locateNode,
  nodePath, removeNodeFromTree, updateNodeInTree,
} from './tree';

function node(id: string, children?: BuilderNode[]): BuilderNode {
  return { id, type: 'container', props: {}, children };
}

const tree: BuilderNode[] = [
  node('a', [node('a1'), node('a2', [node('a2a')])]),
  node('b'),
];

describe('tree navigation', () => {
  it('finds nodes at any depth', () => {
    expect(findNode(tree, 'a2a')?.id).toBe('a2a');
    expect(findNode(tree, 'missing')).toBeNull();
  });

  it('locates a node with its parent and index', () => {
    const found = locateNode(tree, 'a2');
    expect(found?.parent?.id).toBe('a');
    expect(found?.index).toBe(1);
  });

  it('returns the ancestor path', () => {
    expect(nodePath(tree, 'a2a').map((n) => n.id)).toEqual(['a', 'a2']);
    expect(nodePath(tree, 'b')).toEqual([]);
  });

  it('detects descendants including self', () => {
    expect(isDescendant(tree[0], 'a2a')).toBe(true);
    expect(isDescendant(tree[0], 'a')).toBe(true);
    expect(isDescendant(tree[0], 'b')).toBe(false);
  });

  it('counts every node', () => {
    expect(countNodes(tree)).toBe(5);
  });
});

describe('tree mutation', () => {
  it('inserts at the requested index', () => {
    const next = insertNodeInTree(tree, 'a', 1, node('new'));
    expect(next[0].children?.map((c) => c.id)).toEqual(['a1', 'new', 'a2']);
    // The original tree is untouched.
    expect(tree[0].children?.map((c) => c.id)).toEqual(['a1', 'a2']);
  });

  it('clamps an out-of-range index instead of dropping the node', () => {
    const next = insertNodeInTree(tree, 'a', 99, node('new'));
    expect(next[0].children?.map((c) => c.id)).toEqual(['a1', 'a2', 'new']);
  });

  it('inserts at the root when no parent is given', () => {
    const next = insertNodeInTree(tree, null, 0, node('top'));
    expect(next.map((c) => c.id)).toEqual(['top', 'a', 'b']);
  });

  it('removes a nested node and reports it', () => {
    const { nodes, removed } = removeNodeFromTree(tree, 'a2a');
    expect(removed?.id).toBe('a2a');
    expect(findNode(nodes, 'a2a')).toBeNull();
  });

  it('keeps untouched branches referentially identical', () => {
    const next = updateNodeInTree(tree, 'a1', (n) => ({ ...n, name: 'renamed' }));
    expect(next[1]).toBe(tree[1]);
    expect(next[0]).not.toBe(tree[0]);
    expect(findNode(next, 'a1')?.name).toBe('renamed');
  });

  it('returns the same array when nothing matched', () => {
    expect(updateNodeInTree(tree, 'nope', (n) => n)).toBe(tree);
  });
});

describe('cloneSubtree', () => {
  it('assigns new ids to every node in the subtree', () => {
    const source = findNode(tree, 'a')!;
    const copy = cloneSubtree(source);
    const originalIds = new Set(collectIds([source]));
    const copyIds = collectIds([copy]);

    expect(copyIds).toHaveLength(originalIds.size);
    for (const id of copyIds) expect(originalIds.has(id)).toBe(false);
  });

  it('deep-copies props so edits do not leak back', () => {
    const source: BuilderNode = {
      id: 'x',
      type: 'text',
      props: { items: [{ id: 'i1', label: 'one' }] },
      styles: { desktop: { fontSize: 20 } },
    };
    const copy = cloneSubtree(source);
    (copy.props.items as { label: string }[])[0].label = 'changed';
    copy.styles!.desktop!.fontSize = 40;

    expect((source.props.items as { label: string }[])[0].label).toBe('one');
    expect(source.styles!.desktop!.fontSize).toBe(20);
  });
});
