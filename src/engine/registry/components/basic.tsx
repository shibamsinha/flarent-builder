import { Heading, Image as ImageIcon, Link as LinkIcon, MousePointerClick, Sparkles, SquarePlay, Type } from 'lucide-react';
import type { ComponentDefinition } from '@/engine/registry/types';
import { Editable } from '@/engine/renderer/Editable';
import type { LinkValue } from '@/types/props';
import { sanitizeEmbedUrl, sanitizeMediaUrl } from '@/utils/sanitize';
import { anchorAttrs, bool, IconGlyph, link, num, PLACEHOLDER_IMAGE, str, STYLE_GROUPS } from './shared';

const headingDef: ComponentDefinition<{ text: string; level: string }> = {
  type: 'heading',
  label: 'Heading',
  icon: Heading,
  category: 'basic',
  description: 'Title text with a semantic heading level.',
  keywords: ['title', 'h1', 'h2'],
  defaultProps: { text: 'A headline that sells', level: 'h2' },
  defaultStyles: {
    desktop: {
      fontFamily: 'var(--fl-font-heading)',
      fontSize: 44,
      fontWeight: 700,
      lineHeight: 1.15,
      letterSpacing: '-0.02em',
      color: 'var(--fl-color-text)',
      marginTop: 0,
      marginBottom: 0,
    },
    tablet: { fontSize: 38 },
    mobile: { fontSize: 30 },
  },
  children: { kind: 'none' },
  inlineText: { propKey: 'text', rich: true },
  inspector: [
    { key: 'text', label: 'Text', type: 'richtext', rows: 3 },
    {
      key: 'level',
      label: 'Level',
      type: 'select',
      help: 'Use one H1 per page for good SEO.',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((v) => ({ label: v.toUpperCase(), value: v })),
    },
  ],
  styleGroups: STYLE_GROUPS.text,
  render: ({ node, props, attrs }) => {
    const level = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(props.level) ? props.level : 'h2';
    return (
      <Editable
        as={level as 'h2'}
        attrs={attrs}
        nodeId={node.id}
        propKey="text"
        value={str(props.text)}
        rich
      />
    );
  },
};

const textDef: ComponentDefinition<{ text: string }> = {
  type: 'text',
  label: 'Text',
  icon: Type,
  category: 'basic',
  description: 'Paragraph copy.',
  keywords: ['paragraph', 'body', 'copy'],
  defaultProps: {
    text: 'Write something meaningful about your business here. Keep it short, specific and easy to scan.',
  },
  defaultStyles: {
    desktop: {
      fontFamily: 'var(--fl-font-body)',
      fontSize: 17,
      lineHeight: 1.7,
      color: 'var(--fl-color-muted)',
      marginTop: 0,
      marginBottom: 0,
    },
    mobile: { fontSize: 16 },
  },
  children: { kind: 'none' },
  inlineText: { propKey: 'text', rich: true },
  inspector: [{ key: 'text', label: 'Text', type: 'richtext', rows: 5 }],
  styleGroups: STYLE_GROUPS.text,
  render: ({ node, props, attrs }) => (
    <Editable as="p" attrs={attrs} nodeId={node.id} propKey="text" value={str(props.text)} rich />
  ),
};

const imageDef: ComponentDefinition<{
  src: string;
  alt: string;
  link: LinkValue;
  lazy: boolean;
}> = {
  type: 'image',
  label: 'Image',
  icon: ImageIcon,
  category: 'basic',
  description: 'Picture from your asset library or a URL.',
  keywords: ['photo', 'picture', 'img'],
  defaultProps: { src: '', alt: '', link: { kind: 'none' }, lazy: true },
  defaultStyles: {
    desktop: {
      width: '100%',
      height: 'auto',
      objectFit: 'cover',
      borderRadius: 'var(--fl-radius-md)',
      display: 'block',
    },
  },
  children: { kind: 'none' },
  inspector: [
    { key: 'src', label: 'Image', type: 'image' },
    { key: 'alt', label: 'Alt text', type: 'text', help: 'Describes the image for screen readers and search engines.' },
    { key: 'link', label: 'Links to', type: 'link' },
    { key: 'lazy', label: 'Lazy load', type: 'toggle' },
  ],
  styleGroups: STYLE_GROUPS.media,
  render: ({ props, attrs, env }) => {
    const resolved = env.resolveAssetUrl(str(props.src)) ?? '';
    const src = sanitizeMediaUrl(resolved) || PLACEHOLDER_IMAGE;
    const image = (
      <img
        {...attrs}
        src={src}
        alt={str(props.alt)}
        loading={bool(props.lazy, true) ? 'lazy' : undefined}
        decoding="async"
      />
    );
    const anchor = anchorAttrs(env, link(props.link));
    if (!anchor.href) return image;
    return (
      <a {...anchor} className="fl-image-link">
        {image}
      </a>
    );
  },
};

const videoDef: ComponentDefinition<{
  provider: string;
  url: string;
  autoplay: boolean;
  controls: boolean;
  loop: boolean;
}> = {
  type: 'video',
  label: 'Video',
  icon: SquarePlay,
  category: 'basic',
  description: 'YouTube, Vimeo or a hosted file.',
  keywords: ['youtube', 'vimeo', 'media'],
  defaultProps: {
    provider: 'youtube',
    url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    autoplay: false,
    controls: true,
    loop: false,
  },
  defaultStyles: {
    desktop: {
      width: '100%',
      aspectRatio: '16 / 9',
      borderRadius: 'var(--fl-radius-md)',
      overflow: 'hidden',
      display: 'block',
      backgroundColor: '#000000',
    },
  },
  children: { kind: 'none' },
  inspector: [
    {
      key: 'provider',
      label: 'Source',
      type: 'select',
      options: [
        { label: 'YouTube', value: 'youtube' },
        { label: 'Vimeo', value: 'vimeo' },
        { label: 'Video file', value: 'file' },
      ],
    },
    { key: 'url', label: 'Video URL', type: 'text', placeholder: 'https://…' },
    { key: 'controls', label: 'Show controls', type: 'toggle', when: { key: 'provider', equals: ['file'] } },
    { key: 'autoplay', label: 'Autoplay (muted)', type: 'toggle' },
    { key: 'loop', label: 'Loop', type: 'toggle' },
  ],
  styleGroups: STYLE_GROUPS.media,
  render: ({ props, attrs, env }) => {
    const provider = str(props.provider, 'youtube');
    const url = str(props.url);
    if (provider === 'file') {
      const src = sanitizeMediaUrl(env.resolveAssetUrl(url) ?? url);
      return (
        <video
          {...attrs}
          src={src}
          controls={bool(props.controls, true)}
          autoPlay={bool(props.autoplay)}
          muted={bool(props.autoplay)}
          loop={bool(props.loop)}
          playsInline
        />
      );
    }
    const embed = embedUrl(provider, url, bool(props.autoplay), bool(props.loop));
    if (!embed) {
      return (
        <div {...attrs} className={`${attrs.className} fl-media-fallback`}>
          Add a valid {provider === 'vimeo' ? 'Vimeo' : 'YouTube'} link
        </div>
      );
    }
    return (
      <iframe
        {...attrs}
        src={embed}
        title="Video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        frameBorder="0"
      />
    );
  },
};

function embedUrl(provider: string, raw: string, autoplay: boolean, loop: boolean): string | undefined {
  const safe = sanitizeEmbedUrl(raw);
  if (!safe) return undefined;
  const params = new URLSearchParams();
  if (autoplay) {
    params.set('autoplay', '1');
    params.set('muted', '1');
    params.set('mute', '1');
  }
  if (loop) params.set('loop', '1');
  const query = params.toString() ? `?${params.toString()}` : '';

  if (provider === 'youtube') {
    const id = youTubeId(safe);
    return id ? `https://www.youtube-nocookie.com/embed/${id}${query}` : undefined;
  }
  const vimeo = safe.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return vimeo ? `https://player.vimeo.com/video/${vimeo[1]}${query}` : undefined;
}

function youTubeId(url: string): string | undefined {
  const patterns = [/[?&]v=([\w-]{6,})/, /youtu\.be\/([\w-]{6,})/, /embed\/([\w-]{6,})/];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return undefined;
}

const buttonDef: ComponentDefinition<{
  label: string;
  link: LinkValue;
  variant: string;
  size: string;
  icon: string;
  iconPosition: string;
}> = {
  type: 'button',
  label: 'Button',
  icon: MousePointerClick,
  category: 'basic',
  description: 'Call-to-action button.',
  keywords: ['cta', 'action', 'link'],
  defaultProps: {
    label: 'Get started',
    link: { kind: 'none' },
    variant: 'primary',
    size: 'md',
    icon: '',
    iconPosition: 'right',
  },
  defaultStyles: { desktop: {} },
  children: { kind: 'none' },
  inlineText: { propKey: 'label', rich: false },
  inspector: [
    { key: 'label', label: 'Label', type: 'text' },
    { key: 'link', label: 'Links to', type: 'link' },
    {
      key: 'variant',
      label: 'Style',
      type: 'select',
      options: [
        { label: 'Primary', value: 'primary' },
        { label: 'Secondary', value: 'secondary' },
        { label: 'Outline', value: 'outline' },
        { label: 'Ghost', value: 'ghost' },
        { label: 'Text link', value: 'text' },
      ],
    },
    {
      key: 'size',
      label: 'Size',
      type: 'select',
      options: [
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
      ],
    },
    { key: 'icon', label: 'Icon', type: 'icon' },
    {
      key: 'iconPosition',
      label: 'Icon position',
      type: 'select',
      when: { key: 'icon', notEmpty: true },
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Right', value: 'right' },
      ],
    },
  ],
  styleGroups: ['size', 'spacing', 'typography', 'background', 'border', 'effects'],
  render: ({ node, props, attrs, env }) => {
    const anchor = anchorAttrs(env, link(props.link));
    const className = [
      attrs.className,
      'fl-btn',
      `fl-btn-${str(props.variant, 'primary')}`,
      `fl-btn-${str(props.size, 'md')}`,
    ].join(' ');
    const icon = str(props.icon);
    const glyph = icon ? <IconGlyph name={icon} size={18} /> : null;
    const content = (
      <>
        {glyph && str(props.iconPosition, 'right') === 'left' ? glyph : null}
        <Editable
          as="span"
          nodeId={node.id}
          propKey="label"
          value={str(props.label, 'Button')}
          rich={false}
        />
        {glyph && str(props.iconPosition, 'right') !== 'left' ? glyph : null}
      </>
    );
    if (anchor.href) {
      return (
        <a {...attrs} {...anchor} className={className}>
          {content}
        </a>
      );
    }
    return (
      <button {...attrs} type="button" className={className}>
        {content}
      </button>
    );
  },
};

const iconDef: ComponentDefinition<{
  name: string;
  size: number;
  color: string;
  strokeWidth: number;
  link: LinkValue;
}> = {
  type: 'icon',
  label: 'Icon',
  icon: Sparkles,
  category: 'basic',
  description: 'A single icon from the Flarent set.',
  keywords: ['glyph', 'symbol'],
  defaultProps: {
    name: 'Sparkles',
    size: 32,
    color: 'var(--fl-color-primary)',
    strokeWidth: 2,
    link: { kind: 'none' },
  },
  defaultStyles: { desktop: { display: 'inline-flex' } },
  children: { kind: 'none' },
  inspector: [
    { key: 'name', label: 'Icon', type: 'icon' },
    { key: 'size', label: 'Size', type: 'number', min: 12, max: 160, unit: 'px' },
    { key: 'color', label: 'Colour', type: 'color' },
    { key: 'strokeWidth', label: 'Stroke', type: 'number', min: 1, max: 4, step: 0.25 },
    { key: 'link', label: 'Links to', type: 'link' },
  ],
  styleGroups: ['spacing', 'background', 'border', 'effects'],
  render: ({ props, attrs, env }) => {
    const glyph = (
      <IconGlyph
        name={str(props.name, 'Sparkles')}
        size={num(props.size, 32)}
        color={str(props.color, 'currentColor')}
        strokeWidth={num(props.strokeWidth, 2)}
      />
    );
    const anchor = anchorAttrs(env, link(props.link));
    if (anchor.href) {
      return (
        <a {...attrs} {...anchor}>
          {glyph}
        </a>
      );
    }
    return <span {...attrs}>{glyph}</span>;
  },
};

const linkDef: ComponentDefinition<{ text: string; link: LinkValue }> = {
  type: 'link',
  label: 'Link',
  icon: LinkIcon,
  category: 'basic',
  description: 'Inline text link.',
  keywords: ['anchor', 'href'],
  defaultProps: { text: 'Learn more', link: { kind: 'none' } },
  defaultStyles: {
    desktop: {
      color: 'var(--fl-color-primary)',
      fontFamily: 'var(--fl-font-body)',
      fontSize: 16,
      fontWeight: 600,
      textDecoration: 'none',
      display: 'inline-block',
    },
  },
  children: { kind: 'none' },
  inlineText: { propKey: 'text', rich: false },
  inspector: [
    { key: 'text', label: 'Text', type: 'text' },
    { key: 'link', label: 'Links to', type: 'link' },
  ],
  styleGroups: STYLE_GROUPS.text,
  render: ({ node, props, attrs, env }) => {
    const anchor = anchorAttrs(env, link(props.link));
    return (
      <a {...attrs} {...anchor}>
        <Editable
          as="span"
          nodeId={node.id}
          propKey="text"
          value={str(props.text, 'Link')}
          rich={false}
        />
      </a>
    );
  },
};

export const basicComponents = [
  headingDef, textDef, imageDef, videoDef, buttonDef, iconDef, linkDef,
] as unknown as ComponentDefinition<never>[];
