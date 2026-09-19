import { ChevronRight, House } from 'lucide-react';
import type { BuilderNode } from '@/types/project';
import { getComponent } from '@/engine/registry/registry';

export function Breadcrumb({
  path,
  selected,
  onSelect,
}: {
  path: BuilderNode[];
  selected: BuilderNode | null;
  onSelect: (id: string | null) => void;
}) {
  const label = (node: BuilderNode) => node.name || getComponent(node.type)?.label || node.type;

  return (
    <nav className="f-breadcrumb" aria-label="Selected element path">
      <button onClick={() => onSelect(null)} title="Page">
        <House size={12} style={{ verticalAlign: '-1px', marginRight: 4 }} />
        Page
      </button>
      {path.map((node) => (
        <span key={node.id} style={{ display: 'contents' }}>
          <ChevronRight size={12} />
          <button onClick={() => onSelect(node.id)}>{label(node)}</button>
        </span>
      ))}
      {selected ? (
        <>
          <ChevronRight size={12} />
          <button data-active="true">{label(selected)}</button>
        </>
      ) : null}
    </nav>
  );
}
