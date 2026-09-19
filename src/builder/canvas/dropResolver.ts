import type { BuilderNode } from '@/types/project';
import { isDescendant, locateNode } from '@/engine/commands/tree';
import { canContain, ROOT_PARENT } from '@/engine/validation';

export interface DropIndicator {
  /** Overlay-relative box. */
  x: number;
  y: number;
  width: number;
  height: number;
  kind: 'line' | 'box' | 'invalid';
}

export interface DropPlan {
  parentId: string | null;
  index: number;
  indicator: DropIndicator;
  /** Human-readable target, shown in the canvas status pill. */
  label: string;
  valid: boolean;
  reason?: string;
}

export interface ResolveArgs {
  nodes: BuilderNode[];
  /** Type of the component being dragged. */
  dragType: string;
  /** Set when an existing node is being moved. */
  movingId?: string | null;
  pointer: { x: number; y: number };
  /** Element the page is rendered into. */
  pageRoot: HTMLElement;
  /** Element the indicator is positioned against. */
  overlayRoot: HTMLElement;
  /** Canvas zoom, divided back out of measured rects. */
  scale: number;
  typeLabel: (type: string) => string;
}

const LINE_THICKNESS = 3;
const MAX_EDGE_ZONE = 16;

/**
 * Work out where a dragged component would land.
 *
 * Structure comes from the project tree and geometry from the DOM, so the
 * result is always a position that actually exists in the document, so a drop
 * can never lose a component.
 */
export function resolveDrop(args: ResolveArgs): DropPlan {
  const { nodes, pointer, pageRoot, movingId } = args;
  const movingNode = movingId ? locateNode(nodes, movingId)?.node ?? null : null;

  const hit = deepestNodeElement(pointer, pageRoot);
  let cursor: string | null = hit?.getAttribute('data-fl-id') ?? null;

  while (cursor) {
    const location = locateNode(nodes, cursor);
    const element = elementFor(pageRoot, cursor);
    if (!location || !element) {
      cursor = location?.parent?.id ?? null;
      continue;
    }

    const parentId = location.parent?.id ?? null;
    const parentType = parentId ? location.parent!.type : ROOT_PARENT;
    const insideBlocked = movingNode ? isDescendant(movingNode, cursor) : false;
    const siblingBlocked = movingNode && parentId ? isDescendant(movingNode, parentId) : false;

    const canGoInside = !insideBlocked && canContain(location.node.type, args.dragType).allowed;
    const canGoBeside = !siblingBlocked && canContain(parentType, args.dragType).allowed;

    if (canGoInside) {
      const children = location.node.children ?? [];
      const rect = element.getBoundingClientRect();
      const horizontal = isHorizontalFlow(element, children, pageRoot);
      const edge = edgePosition(pointer, rect, horizontal);

      // Hovering the very edge of a container means "put it next to me",
      // which is how a user adds a section above an existing one.
      if (edge && canGoBeside && children.length > 0) {
        return siblingPlan(args, location, element, edge);
      }
      if (children.length === 0) {
        return {
          parentId: cursor,
          index: 0,
          valid: true,
          label: `Inside ${args.typeLabel(location.node.type)}`,
          indicator: boxIndicator(rect, args.overlayRoot, args.scale),
        };
      }
      return childInsertPlan(args, location.node, cursor, element);
    }

    if (canGoBeside) {
      const rect = element.getBoundingClientRect();
      const horizontal = isHorizontalFlow(
        elementFor(pageRoot, parentId ?? '') ?? pageRoot,
        location.parent?.children ?? nodes,
        pageRoot,
      );
      const side = pointerSide(pointer, rect, horizontal);
      return siblingPlan(args, location, element, side);
    }

    cursor = parentId;
  }

  return rootPlan(args);
}

/* --------------------------------- helpers ------------------------------ */

function deepestNodeElement(
  pointer: { x: number; y: number },
  pageRoot: HTMLElement,
): HTMLElement | null {
  const stack = document.elementsFromPoint(pointer.x, pointer.y);
  for (const element of stack) {
    if (!(element instanceof HTMLElement)) continue;
    if (!pageRoot.contains(element)) continue;
    const owner = element.closest('[data-fl-id]');
    if (owner instanceof HTMLElement && pageRoot.contains(owner)) return owner;
  }
  return null;
}

function elementFor(pageRoot: HTMLElement, id: string): HTMLElement | null {
  if (!id) return null;
  return pageRoot.querySelector<HTMLElement>(`[data-fl-id="${CSS.escape(id)}"]`);
}

function isHorizontalFlow(
  container: HTMLElement,
  children: BuilderNode[],
  pageRoot: HTMLElement,
): boolean {
  if (children.length >= 2) {
    const first = elementFor(pageRoot, children[0].id)?.getBoundingClientRect();
    const second = elementFor(pageRoot, children[1].id)?.getBoundingClientRect();
    if (first && second) {
      const verticalGap = Math.abs(second.top - first.top);
      const horizontalGap = Math.abs(second.left - first.left);
      return horizontalGap > verticalGap;
    }
  }
  const style = getComputedStyle(container);
  if (style.display.includes('grid')) {
    return (style.gridTemplateColumns.split(' ').filter(Boolean).length || 1) > 1;
  }
  return style.display.includes('flex') && style.flexDirection.startsWith('row');
}

function edgePosition(
  pointer: { x: number; y: number },
  rect: DOMRect,
  horizontal: boolean,
): 'before' | 'after' | null {
  const size = horizontal ? rect.width : rect.height;
  const zone = Math.min(MAX_EDGE_ZONE, size * 0.22);
  if (horizontal) {
    if (pointer.x - rect.left <= zone) return 'before';
    if (rect.right - pointer.x <= zone) return 'after';
    return null;
  }
  if (pointer.y - rect.top <= zone) return 'before';
  if (rect.bottom - pointer.y <= zone) return 'after';
  return null;
}

function pointerSide(
  pointer: { x: number; y: number },
  rect: DOMRect,
  horizontal: boolean,
): 'before' | 'after' {
  if (horizontal) return pointer.x < rect.left + rect.width / 2 ? 'before' : 'after';
  return pointer.y < rect.top + rect.height / 2 ? 'before' : 'after';
}

function siblingPlan(
  args: ResolveArgs,
  location: NonNullable<ReturnType<typeof locateNode>>,
  element: HTMLElement,
  side: 'before' | 'after',
): DropPlan {
  const parentId = location.parent?.id ?? null;
  const rect = element.getBoundingClientRect();
  const siblings = location.parent?.children ?? args.nodes;
  const horizontal = isHorizontalFlow(
    (parentId ? elementFor(args.pageRoot, parentId) : args.pageRoot) ?? args.pageRoot,
    siblings,
    args.pageRoot,
  );
  return {
    parentId,
    index: side === 'before' ? location.index : location.index + 1,
    valid: true,
    label: `${side === 'before' ? 'Before' : 'After'} ${args.typeLabel(location.node.type)}`,
    indicator: lineIndicator(rect, args.overlayRoot, horizontal, side, args.scale),
  };
}

function childInsertPlan(
  args: ResolveArgs,
  parent: BuilderNode,
  parentId: string,
  parentElement: HTMLElement,
): DropPlan {
  const children = parent.children ?? [];
  const horizontal = isHorizontalFlow(parentElement, children, args.pageRoot);
  const rects = children.map((child) => ({
    child,
    rect: elementFor(args.pageRoot, child.id)?.getBoundingClientRect() ?? null,
  }));

  let index = children.length;
  for (let i = 0; i < rects.length; i += 1) {
    const rect = rects[i].rect;
    if (!rect) continue;
    const middle = horizontal ? rect.left + rect.width / 2 : rect.top + rect.height / 2;
    const value = horizontal ? args.pointer.x : args.pointer.y;
    if (value < middle) {
      index = i;
      break;
    }
  }

  const anchor = index < rects.length ? rects[index] : rects[rects.length - 1];
  const side: 'before' | 'after' = index < rects.length ? 'before' : 'after';
  const indicator = anchor?.rect
    ? lineIndicator(anchor.rect, args.overlayRoot, horizontal, side, args.scale)
    : boxIndicator(parentElement.getBoundingClientRect(), args.overlayRoot, args.scale);

  return {
    parentId,
    index,
    valid: true,
    label: `Inside ${args.typeLabel(parent.type)}`,
    indicator,
  };
}

function rootPlan(args: ResolveArgs): DropPlan {
  const allowed = canContain(ROOT_PARENT, args.dragType);
  const pageRect = args.pageRoot.getBoundingClientRect();

  if (!allowed.allowed) {
    return {
      parentId: null,
      index: 0,
      valid: false,
      reason: allowed.reason,
      label: allowed.reason ?? 'Cannot drop here',
      indicator: { ...toLocal(pageRect, args.overlayRoot, args.scale), kind: 'invalid' },
    };
  }

  let index = args.nodes.length;
  let anchorRect: DOMRect | null = null;
  let side: 'before' | 'after' = 'after';

  for (let i = 0; i < args.nodes.length; i += 1) {
    const rect = elementFor(args.pageRoot, args.nodes[i].id)?.getBoundingClientRect();
    if (!rect) continue;
    anchorRect = rect;
    if (args.pointer.y < rect.top + rect.height / 2) {
      index = i;
      side = 'before';
      break;
    }
  }

  return {
    parentId: null,
    index,
    valid: true,
    label: index >= args.nodes.length ? 'At the end of the page' : 'Between sections',
    indicator: anchorRect
      ? lineIndicator(anchorRect, args.overlayRoot, false, side, args.scale)
      : { x: 12, y: 12, width: pageRect.width / args.scale - 24, height: LINE_THICKNESS, kind: 'line' },
  };
}

function toLocal(rect: DOMRect, overlayRoot: HTMLElement, scale: number) {
  const base = overlayRoot.getBoundingClientRect();
  return {
    x: (rect.left - base.left) / scale,
    y: (rect.top - base.top) / scale,
    width: rect.width / scale,
    height: rect.height / scale,
  };
}

function lineIndicator(
  rect: DOMRect,
  overlayRoot: HTMLElement,
  horizontal: boolean,
  side: 'before' | 'after',
  scale: number,
): DropIndicator {
  const local = toLocal(rect, overlayRoot, scale);
  if (horizontal) {
    return {
      x: (side === 'before' ? local.x : local.x + local.width) - LINE_THICKNESS / 2,
      y: local.y,
      width: LINE_THICKNESS,
      height: local.height,
      kind: 'line',
    };
  }
  return {
    x: local.x,
    y: (side === 'before' ? local.y : local.y + local.height) - LINE_THICKNESS / 2,
    width: local.width,
    height: LINE_THICKNESS,
    kind: 'line',
  };
}

function boxIndicator(rect: DOMRect, overlayRoot: HTMLElement, scale: number): DropIndicator {
  return { ...toLocal(rect, overlayRoot, scale), kind: 'box' };
}
