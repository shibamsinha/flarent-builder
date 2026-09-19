import type { Page } from '@/types/project';
import { NodeRenderer } from './NodeRenderer';

interface PageRendererProps {
  page: Page;
  /** Shown when a page has no content yet (editor only). */
  emptyState?: React.ReactNode;
}

export function PageRenderer({ page, emptyState }: PageRendererProps) {
  if (page.nodes.length === 0 && emptyState) return <>{emptyState}</>;
  return (
    <>
      {page.nodes.map((node) => (
        <NodeRenderer key={node.id} node={node} />
      ))}
    </>
  );
}
