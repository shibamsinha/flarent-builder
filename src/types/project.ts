/**
 * Flarent Builder: the Project schema.
 *
 * Everything a website is made of lives in this structure. It is plain,
 * serialisable JSON: the editor, the preview and the static export all read
 * the exact same document.
 */

import type { StyleMap } from './styles';

/** Bumped whenever the shape below changes. See project/migrations. */
export const SCHEMA_VERSION = 1;

export type DeviceId = 'desktop' | 'tablet' | 'mobile';

/** Per-breakpoint style overrides. Desktop is the base; others inherit from it. */
export type ResponsiveStyles = Partial<Record<DeviceId, StyleMap>>;

export interface NodeAnimation {
  /** Registered animation preset id, e.g. 'fade-up'. 'none' disables. */
  type: 'none' | 'fade' | 'fade-up' | 'fade-down' | 'zoom-in' | 'slide-left' | 'slide-right';
  /** milliseconds */
  duration: number;
  /** milliseconds */
  delay: number;
}

/**
 * A single element in the component tree.
 *
 * `type` is resolved against the component registry at render time. Unknown
 * types render as a recoverable error placeholder rather than crashing.
 */
export interface BuilderNode {
  id: string;
  type: string;
  /** Optional user-facing name shown in the Layers panel. */
  name?: string;
  props: Record<string, unknown>;
  styles?: ResponsiveStyles;
  /** Hide this node on specific breakpoints. */
  hidden?: Partial<Record<DeviceId, boolean>>;
  animation?: NodeAnimation;
  /** Locked nodes cannot be selected/dragged on the canvas. */
  locked?: boolean;
  children?: BuilderNode[];
}

export interface PageSeo {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
  noIndex?: boolean;
}

export interface Page {
  id: string;
  name: string;
  /** URL segment without slashes. The home page uses ''. */
  slug: string;
  isHome?: boolean;
  seo: PageSeo;
  nodes: BuilderNode[];
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
}

export interface ThemeTypography {
  headingFont: string;
  bodyFont: string;
  baseSize: number;
  scale: number;
}

export interface ThemeRadius {
  sm: number;
  md: number;
  lg: number;
  pill: number;
}

export interface ThemeConfig {
  colors: ThemeColors;
  typography: ThemeTypography;
  radius: ThemeRadius;
  /** Max content width used by Container-like components. */
  containerWidth: number;
}

export interface SiteSettings {
  siteName: string;
  description: string;
  language: string;
  faviconAssetId?: string;
  socialImageAssetId?: string;
  /** Used for canonical URLs and sitemap generation. */
  baseUrl: string;
  robotsAllow: boolean;
  /**
   * Optional HTTPS endpoint that exported contact forms POST to. When empty,
   * an exported form stores submissions in the visitor's browser instead.
   */
  formEndpoint?: string;
}

export interface NavItem {
  id: string;
  label: string;
  /** Internal link target. Takes precedence over `url`. */
  pageId?: string;
  /** External link. */
  url?: string;
  newTab?: boolean;
}

export interface NavigationConfig {
  items: NavItem[];
}

export interface AssetMeta {
  id: string;
  filename: string;
  mimeType: string;
  width: number;
  height: number;
  /** bytes */
  size: number;
  createdAt: number;
}

export interface Project {
  id: string;
  name: string;
  schemaVersion: number;
  createdAt: number;
  updatedAt: number;
  /** Template the project was created from, for reference only. */
  templateId?: string;
  settings: SiteSettings;
  theme: ThemeConfig;
  navigation: NavigationConfig;
  pages: Page[];
  assets: AssetMeta[];
}

/** Lightweight record used by the dashboard listing. */
export interface ProjectSummary {
  id: string;
  name: string;
  updatedAt: number;
  createdAt: number;
  pageCount: number;
  templateId?: string;
}
