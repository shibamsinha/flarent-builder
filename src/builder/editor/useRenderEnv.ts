import { useMemo } from 'react';
import type { DeviceId, Project } from '@/types/project';
import type { LinkValue } from '@/types/props';
import { assetRefId, isAssetRef } from '@/types/props';
import type { RenderEnv, RenderMode } from '@/engine/registry/types';
import { sanitizeMediaUrl, sanitizeUrl } from '@/utils/sanitize';

interface Options {
  project: Project;
  device: DeviceId;
  mode: RenderMode;
  currentPageId: string | undefined;
  assetUrls: Record<string, string>;
  navigate?: (pageId: string) => void;
}

/**
 * Build the environment the renderer needs. The editor and the preview differ
 * only in this object — never in the components themselves.
 */
export function useRenderEnv({
  project,
  device,
  mode,
  currentPageId,
  assetUrls,
  navigate,
}: Options): RenderEnv {
  return useMemo<RenderEnv>(
    () => ({
      mode,
      device,
      project,
      currentPageId,
      navigate,
      resolveAssetUrl: (ref) => {
        if (!ref) return undefined;
        if (isAssetRef(ref)) return assetUrls[assetRefId(ref)];
        return sanitizeMediaUrl(ref);
      },
      resolveHref: (link) => resolveEditorHref(link, project),
    }),
    [mode, device, project, currentPageId, navigate, assetUrls],
  );
}

function resolveEditorHref(link: LinkValue | undefined, project: Project): string | undefined {
  if (!link || link.kind === 'none') return undefined;
  switch (link.kind) {
    case 'page': {
      const page = project.pages.find((p) => p.id === link.pageId);
      if (!page) return undefined;
      return page.isHome ? '/' : `/${page.slug}`;
    }
    case 'url':
      return sanitizeUrl(link.url);
    case 'anchor':
      return link.anchor ? `#${link.anchor.replace(/^#/, '')}` : undefined;
    case 'email':
      return link.value ? `mailto:${link.value}` : undefined;
    case 'phone':
      return link.value ? `tel:${link.value.replace(/[^\d+]/g, '')}` : undefined;
    default:
      return undefined;
  }
}
