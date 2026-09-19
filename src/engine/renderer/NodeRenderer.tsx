import { memo, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { BuilderNode } from '@/types/project';
import { getComponent } from '@/engine/registry/registry';
import type { RootAttrs } from '@/engine/registry/types';
import { resolveStyles } from '@/engine/responsive';
import { styleMapToReactStyle } from '@/types/styles';
import { NodeErrorBoundary } from './NodeErrorBoundary';
import { useRenderEnv } from './context';

/** Per-node class used by the exported stylesheet. */
export function exportClassName(id: string): string {
  return `fl-n-${id}`;
}

interface NodeRendererProps {
  node: BuilderNode;
}

/**
 * The single rendering path for every surface in the product.
 *
 * Editor, preview and static export all call this component; the only
 * difference between them is the `RenderEnv` they provide. Editor affordances
 * (selection outlines, drop indicators) are drawn as overlays *above* the
 * canvas rather than injected here, which is why a node's DOM is byte-for-byte
 * the same in the editor as it is on the published site.
 */
export const NodeRenderer = memo(function NodeRenderer({ node }: NodeRendererProps) {
  const env = useRenderEnv();
  const definition = getComponent(node.type);

  const style = useMemo(
    () => styleMapToReactStyle(resolveStyles(node.styles, env.device)),
    [node.styles, env.device],
  );

  if (!definition) return <UnknownNode node={node} />;

  const hidden = node.hidden?.[env.device];
  if (hidden && env.mode !== 'editor') return null;

  const classes = ['fl-node', `fl-t-${node.type}`];
  if (hidden) classes.push('fl-hidden-here');
  if (node.animation && node.animation.type !== 'none' && env.mode !== 'editor') {
    classes.push('fl-anim');
  }

  // Editor and preview resolve styles for the simulated device and apply them
  // inline. Export writes the same values into a stylesheet with real media
  // queries, so the published site responds to the actual viewport.
  if (env.mode === 'export') classes.push(exportClassName(node.id));

  const attrs: RootAttrs = {
    className: classes.join(' '),
    style: env.mode === 'export' ? undefined : style,
    'data-fl-id': node.id,
    'data-fl-type': node.type,
  };

  if (node.animation && node.animation.type !== 'none' && env.mode !== 'editor') {
    attrs['data-fl-anim'] = node.animation.type;
    attrs.style = {
      ...(env.mode === 'export' ? {} : style),
      animationDuration: `${node.animation.duration}ms`,
      animationDelay: `${node.animation.delay}ms`,
    };
  }

  const childNodes = node.children ?? [];
  const children: ReactNode = childNodes.length
    ? childNodes.map((child) => <NodeRenderer key={child.id} node={child} />)
    : null;

  return (
    <NodeErrorBoundary nodeId={node.id} type={node.type}>
      {definition.render({
        node,
        props: node.props as never,
        attrs,
        children,
        childNodes,
        env,
        isEmpty: childNodes.length === 0,
      })}
    </NodeErrorBoundary>
  );
});

function UnknownNode({ node }: { node: BuilderNode }) {
  return (
    <div className="fl-node-error" data-fl-id={node.id} data-fl-type={node.type}>
      <strong>Unknown component</strong>
      <span>
        &ldquo;{node.type}&rdquo; is not available in this version of Flarent Builder. Its content is
        preserved and will render again once the component is restored.
      </span>
    </div>
  );
}
