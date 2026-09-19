import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader, Monitor, Smartphone, Tablet, TriangleAlert } from 'lucide-react';
import type { DeviceId, Project } from '@/types/project';
import { Segmented } from '@/components/ui';
import { getDevice } from '@/engine/responsive';
import { PageRenderer } from '@/engine/renderer/PageRenderer';
import { RenderEnvContext } from '@/engine/renderer/context';
import { themeToCssVars } from '@/engine/theme';
import { getProjectRepository } from '@/project/repository';
import { getAssetService } from '@/services/assets';
import { useRenderEnv } from '@/builder/editor/useRenderEnv';

/**
 * Preview renders the site through the same renderer the canvas uses, with the
 * editor affordances simply absent: no leftover outlines, no drop hints.
 */
export function PreviewRoute() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pageId, setPageId] = useState<string | null>(null);
  const [device, setDevice] = useState<DeviceId>('desktop');
  const [assetUrls, setAssetUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!projectId) return;
      try {
        const loaded = await getProjectRepository().get(projectId);
        if (cancelled) return;
        if (!loaded) {
          setError('This website no longer exists.');
          return;
        }
        setProject(loaded);
        setPageId(loaded.pages.find((page) => page.isHome)?.id ?? loaded.pages[0]?.id ?? null);

        const service = getAssetService();
        const urls: Record<string, string> = {};
        for (const asset of loaded.assets) {
          const url = await service.getUrl(loaded.id, asset.id);
          if (url) urls[asset.id] = url;
        }
        if (!cancelled) setAssetUrls(urls);
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : 'This website could not be opened.');
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const page = useMemo(
    () => project?.pages.find((item) => item.id === pageId) ?? project?.pages[0] ?? null,
    [project, pageId],
  );

  const env = useRenderEnv({
    project: project!,
    device,
    mode: 'preview',
    currentPageId: page?.id,
    assetUrls,
    navigate: (target) => {
      setPageId(target);
      window.scrollTo({ top: 0 });
      document.querySelector('.f-preview-stage')?.scrollTo({ top: 0 });
    },
  });

  if (error) {
    return (
      <div className="f-center">
        <div className="f-state">
          <TriangleAlert size={26} style={{ color: 'var(--f-danger)' }} />
          <h2>Preview unavailable</h2>
          <p>{error}</p>
          <Link className="f-btn f-btn-secondary" to="/dashboard">
            <ArrowLeft size={15} /> Back to my websites
          </Link>
        </div>
      </div>
    );
  }

  if (!project || !page) {
    return (
      <div className="f-center">
        <div className="f-state">
          <Loader size={22} className="f-spin" style={{ color: 'var(--f-brand)' }} />
          <p>Loading preview…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="f-preview">
      <header className="f-preview-bar">
        <Link className="f-btn f-btn-ghost f-btn-icon" to={`/edit/${project.id}`} title="Back to editor">
          <ArrowLeft size={16} />
        </Link>
        <span className="f-logo">
          <span className="f-logo-mark">F</span>
          {project.name}
        </span>

        <nav style={{ display: 'flex', gap: 2, marginLeft: 12, overflowX: 'auto' }}>
          {project.pages.map((item) => (
            <button
              key={item.id}
              className={item.id === page.id ? 'f-btn f-btn-ghost f-btn-sm' : 'f-btn f-btn-ghost f-btn-sm'}
              style={item.id === page.id ? { background: 'var(--f-brand-soft)', color: 'var(--f-brand)' } : undefined}
              onClick={() => setPageId(item.id)}
            >
              {item.name}
            </button>
          ))}
        </nav>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Segmented
            value={device}
            onChange={setDevice}
            options={[
              { value: 'desktop', label: <Monitor size={14} />, title: 'Desktop' },
              { value: 'tablet', label: <Tablet size={14} />, title: 'Tablet' },
              { value: 'mobile', label: <Smartphone size={14} />, title: 'Mobile' },
            ]}
          />
          <Link className="f-btn f-btn-secondary f-btn-sm" to={`/edit/${project.id}`}>
            Back to editing
          </Link>
        </div>
      </header>

      <div className="f-preview-stage f-scroll">
        <div
          className="f-preview-frame fl-root"
          style={{
            width: getDevice(device).canvasWidth,
            maxWidth: '100%',
            ...(themeToCssVars(project.theme) as React.CSSProperties),
          }}
        >
          <RenderEnvContext.Provider value={env}>
            <PageRenderer page={page} />
          </RenderEnvContext.Provider>
        </div>
      </div>
    </div>
  );
}
