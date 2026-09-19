import { Blocks, Image, ListTree, PanelsTopLeft, Palette } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';
import type { LeftTab } from '@/store/uiStore';
import { ComponentsPanel } from './ComponentsPanel';
import { ThemePanel } from './ThemePanel';
import { LayersPanel } from '@/builder/layers/LayersPanel';
import { PagesPanel } from '@/builder/pages/PagesPanel';
import { AssetsPanel } from '@/builder/assets/AssetsPanel';

const TABS: { id: LeftTab; label: string; icon: typeof Blocks }[] = [
  { id: 'components', label: 'Components', icon: Blocks },
  { id: 'layers', label: 'Layers', icon: ListTree },
  { id: 'pages', label: 'Pages', icon: PanelsTopLeft },
  { id: 'assets', label: 'Assets', icon: Image },
  { id: 'theme', label: 'Theme', icon: Palette },
];

export function LeftPanel() {
  const tab = useUiStore((s) => s.leftTab);
  const setTab = useUiStore((s) => s.setLeftTab);

  return (
    <aside className="f-side f-side-left">
      <nav className="f-side-tabs">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} data-active={tab === id} onClick={() => setTab(id)} title={label} aria-label={label}>
            <Icon size={15} />
          </button>
        ))}
      </nav>

      {tab === 'components' ? <ComponentsPanel /> : null}
      {tab === 'layers' ? <LayersPanel /> : null}
      {tab === 'pages' ? <PagesPanel /> : null}
      {tab === 'assets' ? <AssetsPanel /> : null}
      {tab === 'theme' ? <ThemePanel /> : null}
    </aside>
  );
}
