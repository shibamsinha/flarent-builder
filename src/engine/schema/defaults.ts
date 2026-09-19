import type { Project, ThemeConfig } from '@/types/project';
import { SCHEMA_VERSION } from '@/types/project';
import { pageId, projectId } from '@/utils/id';

export const DEFAULT_THEME: ThemeConfig = {
  colors: {
    primary: '#7217b2',
    secondary: '#ac13eb',
    accent: '#f4b740',
    background: '#ffffff',
    surface: '#f7f5fb',
    text: '#17111f',
    muted: '#6b6479',
    border: '#e6e1ee',
  },
  typography: {
    headingFont: 'Plus Jakarta Sans, sans-serif',
    bodyFont: 'Inter, sans-serif',
    baseSize: 16,
    scale: 1.25,
  },
  radius: { sm: 8, md: 14, lg: 24, pill: 999 },
  containerWidth: 1180,
};

export function createEmptyProject(name = 'Untitled website'): Project {
  const now = Date.now();
  return {
    id: projectId(),
    name,
    schemaVersion: SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
    settings: {
      siteName: name,
      description: '',
      language: 'en',
      baseUrl: 'https://example.com',
      robotsAllow: true,
    },
    theme: structuredClone(DEFAULT_THEME),
    navigation: { items: [] },
    pages: [
      {
        id: pageId(),
        name: 'Home',
        slug: '',
        isHome: true,
        seo: { title: name },
        nodes: [],
      },
    ],
    assets: [],
  };
}
