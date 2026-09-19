import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { registerBuiltInComponents } from '@/engine/registry/components';
import { findNode } from '@/engine/commands/tree';
import { getProjectRepository } from '@/project/repository';
import { createEmptyProject } from '@/engine/schema/defaults';
import { useEditorStore } from './editorStore';

beforeAll(() => registerBuiltInComponents());

async function openFreshProject() {
  const project = createEmptyProject('History test');
  await getProjectRepository().create(project);
  await useEditorStore.getState().openProject(project.id);
  return project.id;
}

function nodes() {
  const state = useEditorStore.getState();
  const page = state.project!.pages.find((p) => p.id === state.currentPageId)!;
  return page.nodes;
}

describe('editor store', () => {
  beforeEach(async () => {
    useEditorStore.getState().closeProject();
    await openFreshProject();
  });

  it('loads a project and selects the home page', () => {
    const state = useEditorStore.getState();
    expect(state.loadState).toBe('ready');
    expect(state.currentPageId).toBe(state.project!.pages[0].id);
    expect(state.saveState).toBe('saved');
  });

  it('reports a clear error for a project that does not exist', async () => {
    await useEditorStore.getState().openProject('does-not-exist');
    expect(useEditorStore.getState().loadState).toBe('error');
    expect(useEditorStore.getState().loadError).toBeTruthy();
  });

  it('adds a component and selects it', () => {
    const id = useEditorStore.getState().addComponent('section', null, 0);
    expect(id).toBeTruthy();
    expect(nodes()).toHaveLength(1);
    expect(useEditorStore.getState().selectedId).toBe(id);
    expect(useEditorStore.getState().saveState).toBe('unsaved');
  });

  it('refuses an invalid placement', () => {
    const sectionId = useEditorStore.getState().addComponent('section', null, 0)!;
    const buttonId = useEditorStore.getState().addComponent('button', sectionId, 0)!;
    // A button holds no children.
    expect(useEditorStore.getState().addComponent('section', buttonId, 0)).toBeNull();
  });

  it('undoes and redoes a change', () => {
    const store = useEditorStore.getState();
    store.addComponent('section', null, 0);
    expect(nodes()).toHaveLength(1);

    useEditorStore.getState().undo();
    expect(nodes()).toHaveLength(0);

    useEditorStore.getState().redo();
    expect(nodes()).toHaveLength(1);
  });

  it('clears the redo stack once new work happens', () => {
    useEditorStore.getState().addComponent('section', null, 0);
    useEditorStore.getState().undo();
    expect(useEditorStore.getState().canRedo()).toBe(true);

    useEditorStore.getState().addComponent('hero', null, 0);
    expect(useEditorStore.getState().canRedo()).toBe(false);
  });

  it('collapses rapid inspector edits into one undo step', () => {
    const id = useEditorStore.getState().addComponent('heading', null, 0)!;
    const before = useEditorStore.getState().past.length;

    // Dragging a slider fires many updates with the same merge key.
    for (const size of [20, 22, 24, 26, 28]) {
      useEditorStore.getState().setNodeStyles(id, { fontSize: size }, `style:${id}:fontSize`);
    }

    expect(useEditorStore.getState().past.length).toBe(before + 1);

    useEditorStore.getState().undo();
    const node = findNode(nodes(), id);
    expect(node?.styles?.desktop?.fontSize).not.toBe(28);
  });

  it('starts a new undo step for a different property', () => {
    const id = useEditorStore.getState().addComponent('heading', null, 0)!;
    const before = useEditorStore.getState().past.length;

    useEditorStore.getState().setNodeStyles(id, { fontSize: 20 }, `style:${id}:fontSize`);
    useEditorStore.getState().setNodeStyles(id, { opacity: 0.5 }, `style:${id}:opacity`);

    expect(useEditorStore.getState().past.length).toBe(before + 2);
  });

  it('drops a selection that undo removed', () => {
    const id = useEditorStore.getState().addComponent('section', null, 0)!;
    expect(useEditorStore.getState().selectedId).toBe(id);

    useEditorStore.getState().undo();
    expect(useEditorStore.getState().selectedId).toBeNull();
  });

  it('copies and pastes a subtree with fresh ids', () => {
    const sectionId = useEditorStore.getState().addComponent('section', null, 0)!;
    useEditorStore.getState().copyNode(sectionId);
    useEditorStore.getState().select(null);
    useEditorStore.getState().pasteClipboard();

    const roots = nodes();
    expect(roots).toHaveLength(2);
    expect(roots[0].id).not.toBe(roots[1].id);
  });

  it('selects the parent after deleting a node', () => {
    const sectionId = useEditorStore.getState().addComponent('section', null, 0)!;
    const container = findNode(nodes(), sectionId)!.children![0];

    useEditorStore.getState().select(container.id);
    useEditorStore.getState().removeNode(container.id);
    expect(useEditorStore.getState().selectedId).toBe(sectionId);
  });

  it('persists changes and reloads them', async () => {
    const store = useEditorStore.getState();
    store.addComponent('section', null, 0);
    await useEditorStore.getState().saveNow();
    expect(useEditorStore.getState().saveState).toBe('saved');

    const projectId = useEditorStore.getState().project!.id;
    useEditorStore.getState().closeProject();
    await useEditorStore.getState().openProject(projectId);

    expect(nodes()).toHaveLength(1);
  });

  it('switches pages and clears the selection', () => {
    useEditorStore.getState().addComponent('section', null, 0);
    useEditorStore.getState().createPage('About');

    const state = useEditorStore.getState();
    expect(state.project!.pages).toHaveLength(2);
    expect(state.selectedId).toBeNull();
    expect(state.currentPageId).toBe(state.project!.pages[1].id);
  });
});
