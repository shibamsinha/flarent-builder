import { create } from 'zustand';
import type {
  AssetMeta, BuilderNode, DeviceId, NavigationConfig, PageSeo, Project, SiteSettings,
} from '@/types/project';
import type { ThemePatch } from '@/engine/commands';
import type { StyleMap } from '@/types/styles';
import * as commands from '@/engine/commands';
import { cloneSubtree, findNode, locateNode } from '@/engine/commands/tree';
import { canContain, canMoveNode, findValidParent, ROOT_PARENT } from '@/engine/validation';
import { createNode } from '@/engine/registry/registry';
import { getProjectRepository } from '@/project/repository';
import { getAssetService } from '@/services/assets';
import { toAssetRef } from '@/types/props';

export type SaveState = 'saved' | 'saving' | 'unsaved' | 'error';
export type LoadState = 'idle' | 'loading' | 'ready' | 'error';

interface ApplyOptions {
  /**
   * Consecutive changes sharing a merge key collapse into one undo step, so
   * dragging a slider produces a single entry, not ninety.
   */
  mergeKey?: string;
  /** Skip history entirely (selection-only changes). */
  silent?: boolean;
}

const HISTORY_LIMIT = 80;
const MERGE_WINDOW_MS = 700;
const AUTOSAVE_DELAY_MS = 800;

interface EditorState {
  project: Project | null;
  loadState: LoadState;
  loadError: string | null;
  saveState: SaveState;
  saveError: string | null;

  currentPageId: string | null;
  selectedId: string | null;
  hoveredId: string | null;
  editingNodeId: string | null;
  device: DeviceId;
  clipboard: BuilderNode | null;

  past: Project[];
  future: Project[];

  /** assetId → object URL for the open project. */
  assetUrls: Record<string, string>;

  /* lifecycle */
  openProject: (id: string) => Promise<void>;
  closeProject: () => void;
  saveNow: () => Promise<void>;

  /* selection & view */
  select: (id: string | null) => void;
  hover: (id: string | null) => void;
  setDevice: (device: DeviceId) => void;
  setCurrentPage: (pageId: string) => void;
  beginEdit: (nodeId: string) => void;
  endEdit: () => void;

  /* node operations */
  addComponent: (type: string, parentId: string | null, index: number) => string | null;
  insertNode: (node: BuilderNode, parentId: string | null, index: number) => string | null;
  moveNode: (nodeId: string, parentId: string | null, index: number) => boolean;
  removeNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  copyNode: (nodeId: string) => void;
  pasteClipboard: () => void;
  setNodeProps: (nodeId: string, patch: Record<string, unknown>, mergeKey?: string) => void;
  setNodeStyles: (nodeId: string, patch: StyleMap, mergeKey?: string) => void;
  clearDeviceStyles: (nodeId: string) => void;
  setNodeHidden: (nodeId: string, device: DeviceId, hidden: boolean) => void;
  setNodeName: (nodeId: string, name: string) => void;
  setNodeLocked: (nodeId: string, locked: boolean) => void;
  setNodeAnimation: (nodeId: string, animation: BuilderNode['animation']) => void;
  commitText: (nodeId: string, propKey: string, value: string) => void;

  /* pages */
  createPage: (name: string) => void;
  updatePage: (pageId: string, patch: { name?: string; slug?: string; seo?: Partial<PageSeo> }) => void;
  deletePage: (pageId: string) => void;
  duplicatePage: (pageId: string) => void;
  setHomePage: (pageId: string) => void;
  reorderPages: (from: number, to: number) => void;

  /* site */
  setTheme: (patch: ThemePatch, mergeKey?: string) => void;
  setSettings: (patch: Partial<SiteSettings>) => void;
  setNavigation: (navigation: NavigationConfig) => void;
  renameProject: (name: string) => void;

  /* assets */
  uploadAsset: (file: File) => Promise<AssetMeta | null>;
  deleteAsset: (assetId: string) => Promise<void>;
  refreshAssetUrls: () => Promise<void>;

  /* history */
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let lastMergeKey: string | null = null;
let lastMergeAt = 0;

export const useEditorStore = create<EditorState>((set, get) => {
  /** The single write path for the project document. */
  function apply(mutate: (project: Project) => Project, options: ApplyOptions = {}): boolean {
    const state = get();
    const current = state.project;
    if (!current) return false;

    const next = mutate(current);
    if (next === current) return false;

    if (options.silent) {
      set({ project: next });
      scheduleSave();
      return true;
    }

    const now = Date.now();
    const shouldMerge =
      !!options.mergeKey && options.mergeKey === lastMergeKey && now - lastMergeAt < MERGE_WINDOW_MS;

    const past = shouldMerge ? state.past : [...state.past, current].slice(-HISTORY_LIMIT);
    lastMergeKey = options.mergeKey ?? null;
    lastMergeAt = now;

    set({ project: next, past, future: [], saveState: 'unsaved' });
    scheduleSave();
    return true;
  }

  function scheduleSave(): void {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      void get().saveNow();
    }, AUTOSAVE_DELAY_MS);
  }

  /** Selection and editing state must never point at a node that is gone. */
  function reconcileSelection(project: Project): Partial<EditorState> {
    const patch: Partial<EditorState> = {};
    const pageExists = project.pages.some((page) => page.id === get().currentPageId);
    const pageId = pageExists ? get().currentPageId : project.pages[0]?.id ?? null;
    if (pageId !== get().currentPageId) patch.currentPageId = pageId;

    const page = project.pages.find((p) => p.id === pageId);
    const selected = get().selectedId;
    if (selected && (!page || !findNode(page.nodes, selected))) patch.selectedId = null;
    if (get().editingNodeId) patch.editingNodeId = null;
    return patch;
  }

  function currentPage(project: Project | null, pageId: string | null) {
    if (!project) return null;
    return project.pages.find((page) => page.id === pageId) ?? project.pages[0] ?? null;
  }

  return {
    project: null,
    loadState: 'idle',
    loadError: null,
    saveState: 'saved',
    saveError: null,
    currentPageId: null,
    selectedId: null,
    hoveredId: null,
    editingNodeId: null,
    device: 'desktop',
    clipboard: null,
    past: [],
    future: [],
    assetUrls: {},

    /* ---------------------------- lifecycle --------------------------- */

    async openProject(id) {
      set({ loadState: 'loading', loadError: null });
      try {
        const project = await getProjectRepository().get(id);
        if (!project) {
          set({ loadState: 'error', loadError: 'This website no longer exists.' });
          return;
        }
        const home = project.pages.find((page) => page.isHome) ?? project.pages[0];
        set({
          project,
          loadState: 'ready',
          currentPageId: home?.id ?? null,
          selectedId: null,
          hoveredId: null,
          editingNodeId: null,
          past: [],
          future: [],
          saveState: 'saved',
          saveError: null,
        });
        await get().refreshAssetUrls();
      } catch (error) {
        set({
          loadState: 'error',
          loadError: error instanceof Error ? error.message : 'This website could not be opened.',
        });
      }
    },

    closeProject() {
      if (saveTimer) clearTimeout(saveTimer);
      getAssetService().releaseAll();
      set({
        project: null,
        loadState: 'idle',
        currentPageId: null,
        selectedId: null,
        hoveredId: null,
        editingNodeId: null,
        past: [],
        future: [],
        assetUrls: {},
        saveState: 'saved',
      });
    },

    async saveNow() {
      const project = get().project;
      if (!project) return;
      if (saveTimer) {
        clearTimeout(saveTimer);
        saveTimer = null;
      }
      set({ saveState: 'saving' });
      try {
        await getProjectRepository().update(project);
        // Another edit may have landed while the write was in flight.
        set((state) => (state.project === project ? { saveState: 'saved', saveError: null } : {}));
      } catch (error) {
        set({
          saveState: 'error',
          saveError: error instanceof Error ? error.message : 'Could not save your changes.',
        });
      }
    },

    /* -------------------------- selection ----------------------------- */

    select(id) {
      if (get().selectedId === id) return;
      set({ selectedId: id, editingNodeId: null });
    },
    hover(id) {
      if (get().hoveredId === id) return;
      set({ hoveredId: id });
    },
    setDevice(device) {
      set({ device, editingNodeId: null });
    },
    setCurrentPage(pageId) {
      set({ currentPageId: pageId, selectedId: null, hoveredId: null, editingNodeId: null });
    },
    beginEdit(nodeId) {
      set({ editingNodeId: nodeId, selectedId: nodeId });
    },
    endEdit() {
      set({ editingNodeId: null });
    },

    /* --------------------------- nodes -------------------------------- */

    addComponent(type, parentId, index) {
      const { project, currentPageId } = get();
      const page = currentPage(project, currentPageId);
      if (!project || !page) return null;

      const parentType = parentId
        ? locateNode(page.nodes, parentId)?.node.type ?? ROOT_PARENT
        : ROOT_PARENT;
      if (!canContain(parentType, type).allowed) return null;

      const node = createNode(type);
      const ok = apply((p) => commands.addNode(p, { pageId: page.id, node, parentId, index }));
      if (!ok) return null;
      set({ selectedId: node.id });
      return node.id;
    },

    insertNode(node, parentId, index) {
      const { project, currentPageId } = get();
      const page = currentPage(project, currentPageId);
      if (!project || !page) return null;
      const target = findValidParent(page.nodes, parentId, node.type);
      if (!target) return null;
      const resolvedIndex = target.parentId === parentId ? index : target.index;
      const ok = apply((p) =>
        commands.addNode(p, { pageId: page.id, node, parentId: target.parentId, index: resolvedIndex }),
      );
      if (!ok) return null;
      set({ selectedId: node.id });
      return node.id;
    },

    moveNode(nodeId, parentId, index) {
      const { project, currentPageId } = get();
      const page = currentPage(project, currentPageId);
      if (!project || !page) return false;
      if (!canMoveNode(page.nodes, nodeId, parentId).allowed) return false;
      return apply((p) => commands.moveNode(p, { pageId: page.id, nodeId, parentId, index }));
    },

    removeNode(nodeId) {
      const { project, currentPageId, selectedId } = get();
      const page = currentPage(project, currentPageId);
      if (!project || !page) return;
      const location = locateNode(page.nodes, nodeId);
      apply((p) => commands.removeNode(p, page.id, nodeId));
      if (selectedId === nodeId) {
        set({ selectedId: location?.parent?.id ?? null, editingNodeId: null });
      }
    },

    duplicateNode(nodeId) {
      const { project, currentPageId } = get();
      const page = currentPage(project, currentPageId);
      if (!project || !page) return;
      let newId: string | null = null;
      apply((p) => {
        const result = commands.duplicateNode(p, page.id, nodeId);
        newId = result.newNodeId;
        return result.project;
      });
      if (newId) set({ selectedId: newId });
    },

    copyNode(nodeId) {
      const { project, currentPageId } = get();
      const page = currentPage(project, currentPageId);
      if (!page) return;
      const node = findNode(page.nodes, nodeId);
      if (node) set({ clipboard: cloneSubtree(node) });
    },

    pasteClipboard() {
      const { clipboard, selectedId } = get();
      if (!clipboard) return;
      const copy = cloneSubtree(clipboard);
      get().insertNode(copy, selectedId, Number.MAX_SAFE_INTEGER);
    },

    setNodeProps(nodeId, patch, mergeKey) {
      const page = currentPage(get().project, get().currentPageId);
      if (!page) return;
      apply((p) => commands.updateNodeProps(p, page.id, nodeId, patch), { mergeKey });
    },

    setNodeStyles(nodeId, patch, mergeKey) {
      const { device } = get();
      const page = currentPage(get().project, get().currentPageId);
      if (!page) return;
      apply((p) => commands.updateNodeStyles(p, page.id, nodeId, device, patch), { mergeKey });
    },

    clearDeviceStyles(nodeId) {
      const { device } = get();
      const page = currentPage(get().project, get().currentPageId);
      if (!page) return;
      apply((p) => commands.clearDeviceStyles(p, page.id, nodeId, device));
    },

    setNodeHidden(nodeId, device, hidden) {
      const page = currentPage(get().project, get().currentPageId);
      if (!page) return;
      apply((p) => commands.setNodeHidden(p, page.id, nodeId, device, hidden));
    },

    setNodeName(nodeId, name) {
      const page = currentPage(get().project, get().currentPageId);
      if (!page) return;
      apply((p) => commands.setNodeName(p, page.id, nodeId, name));
    },

    setNodeLocked(nodeId, locked) {
      const page = currentPage(get().project, get().currentPageId);
      if (!page) return;
      apply((p) => commands.setNodeLocked(p, page.id, nodeId, locked));
    },

    setNodeAnimation(nodeId, animation) {
      const page = currentPage(get().project, get().currentPageId);
      if (!page) return;
      apply((p) => commands.setNodeAnimation(p, page.id, nodeId, animation));
    },

    commitText(nodeId, propKey, value) {
      const page = currentPage(get().project, get().currentPageId);
      if (!page) return;
      const node = findNode(page.nodes, nodeId);
      if (!node || node.props[propKey] === value) return;
      apply((p) => commands.updateNodeProps(p, page.id, nodeId, { [propKey]: value }));
    },

    /* ---------------------------- pages ------------------------------- */

    createPage(name) {
      let createdId: string | null = null;
      apply((p) => {
        const result = commands.createPage(p, { name });
        createdId = result.page.id;
        return result.project;
      });
      if (createdId) set({ currentPageId: createdId, selectedId: null });
    },

    updatePage(pageId, patch) {
      apply((p) => commands.updatePage(p, pageId, patch), { mergeKey: `page:${pageId}` });
    },

    deletePage(pageId) {
      apply((p) => {
        const next = commands.deletePage(p, pageId);
        if (next !== p) {
          const patch = reconcileSelection(next);
          if (Object.keys(patch).length) setTimeout(() => set(patch), 0);
        }
        return next;
      });
      const project = get().project;
      if (project && !project.pages.some((page) => page.id === get().currentPageId)) {
        set({ currentPageId: project.pages[0]?.id ?? null, selectedId: null });
      }
    },

    duplicatePage(pageId) {
      let createdId: string | null = null;
      apply((p) => {
        const result = commands.duplicatePage(p, pageId);
        createdId = result.page?.id ?? null;
        return result.project;
      });
      if (createdId) set({ currentPageId: createdId, selectedId: null });
    },

    setHomePage(pageId) {
      apply((p) => commands.setHomePage(p, pageId));
    },

    reorderPages(from, to) {
      apply((p) => commands.reorderPages(p, from, to));
    },

    /* ----------------------------- site ------------------------------- */

    setTheme(patch, mergeKey) {
      apply((p) => commands.updateTheme(p, patch), { mergeKey });
    },
    setSettings(patch) {
      apply((p) => commands.updateSettings(p, patch), { mergeKey: 'settings' });
    },
    setNavigation(navigation) {
      apply((p) => commands.updateNavigation(p, navigation));
    },
    renameProject(name) {
      apply((p) => commands.renameProject(p, name), { mergeKey: 'project-name' });
    },

    /* ---------------------------- assets ------------------------------ */

    async uploadAsset(file) {
      const project = get().project;
      if (!project) return null;
      const meta = await getAssetService().upload(project.id, file);
      apply((p) => commands.addAsset(p, meta));
      const url = await getAssetService().getUrl(project.id, meta.id);
      if (url) set((state) => ({ assetUrls: { ...state.assetUrls, [meta.id]: url } }));
      return meta;
    },

    async deleteAsset(assetId) {
      const project = get().project;
      if (!project) return;
      await getAssetService().delete(project.id, assetId);
      apply((p) => commands.removeAsset(p, assetId));
      set((state) => {
        const next = { ...state.assetUrls };
        delete next[assetId];
        return { assetUrls: next };
      });
    },

    async refreshAssetUrls() {
      const project = get().project;
      if (!project) return;
      const service = getAssetService();
      const urls: Record<string, string> = {};
      for (const asset of project.assets) {
        const url = await service.getUrl(project.id, asset.id);
        if (url) urls[asset.id] = url;
      }
      set({ assetUrls: urls });
    },

    /* --------------------------- history ------------------------------ */

    undo() {
      const { past, project, future } = get();
      if (!project || past.length === 0) return;
      const previous = past[past.length - 1];
      lastMergeKey = null;
      set({
        project: previous,
        past: past.slice(0, -1),
        future: [project, ...future].slice(0, HISTORY_LIMIT),
        saveState: 'unsaved',
        ...reconcileSelection(previous),
      });
      scheduleSave();
    },

    redo() {
      const { future, project, past } = get();
      if (!project || future.length === 0) return;
      const next = future[0];
      lastMergeKey = null;
      set({
        project: next,
        past: [...past, project].slice(-HISTORY_LIMIT),
        future: future.slice(1),
        saveState: 'unsaved',
        ...reconcileSelection(next),
      });
      scheduleSave();
    },

    canUndo: () => get().past.length > 0,
    canRedo: () => get().future.length > 0,
  };
});

/* ------------------------------ selectors ------------------------------ */

export function useCurrentPage() {
  return useEditorStore((state) => {
    const { project, currentPageId } = state;
    if (!project) return null;
    return project.pages.find((page) => page.id === currentPageId) ?? project.pages[0] ?? null;
  });
}

export function useSelectedNode(): BuilderNode | null {
  return useEditorStore((state) => {
    const { project, currentPageId, selectedId } = state;
    if (!project || !selectedId) return null;
    const page = project.pages.find((p) => p.id === currentPageId) ?? project.pages[0];
    if (!page) return null;
    return findNode(page.nodes, selectedId);
  });
}

export { toAssetRef };
