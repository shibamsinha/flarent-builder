import {
  ChevronDown, CircleDollarSign, CircleHelp, GalleryHorizontal, Handshake, PanelBottom, PanelTop,
  Quote, Rocket, SquareStack, Sparkles, Star,
} from 'lucide-react';
import type { ComponentDefinition } from '@/engine/registry/types';
import { n } from '@/engine/registry/build';
import type { LinkValue, ListItem } from '@/types/props';
import { sanitizeMediaUrl } from '@/utils/sanitize';
import {
  anchorAttrs, bool, IconGlyph, itemId, link, list, num, PLACEHOLDER_IMAGE, str, STYLE_GROUPS,
} from './shared';

/* ------------------------------ navbar -------------------------------- */

const navbarDef: ComponentDefinition<{
  logoType: string;
  logoText: string;
  logoImage: string;
  logoHeight: number;
  source: string;
  customLinks: ListItem[];
  showCta: boolean;
  ctaLabel: string;
  ctaLink: LinkValue;
  sticky: boolean;
}> = {
  type: 'navbar',
  label: 'Navbar',
  icon: PanelTop,
  category: 'sections',
  description: 'Site header wired to your pages.',
  keywords: ['header', 'menu', 'navigation'],
  defaultProps: {
    logoType: 'text',
    logoText: 'Flarent',
    logoImage: '',
    logoHeight: 32,
    source: 'site',
    customLinks: [],
    showCta: true,
    ctaLabel: 'Contact us',
    ctaLink: { kind: 'none' },
    sticky: false,
  },
  defaultStyles: {
    desktop: {
      display: 'block',
      width: '100%',
      paddingTop: 18,
      paddingBottom: 18,
      paddingLeft: 24,
      paddingRight: 24,
      backgroundColor: 'var(--fl-color-background)',
      borderColor: 'var(--fl-color-border)',
    },
  },
  children: { kind: 'none' },
  allowedParents: ['__root__', 'section', 'container'],
  inspector: [
    {
      key: 'logoType',
      label: 'Logo',
      type: 'select',
      options: [
        { label: 'Text', value: 'text' },
        { label: 'Image', value: 'image' },
      ],
    },
    { key: 'logoText', label: 'Logo text', type: 'text', when: { key: 'logoType', equals: ['text'] } },
    { key: 'logoImage', label: 'Logo image', type: 'image', when: { key: 'logoType', equals: ['image'] } },
    { key: 'logoHeight', label: 'Logo height', type: 'number', min: 16, max: 96, unit: 'px', when: { key: 'logoType', equals: ['image'] } },
    {
      key: 'source',
      label: 'Menu items',
      type: 'select',
      help: 'Site navigation is managed in Pages → Navigation.',
      options: [
        { label: 'Site navigation', value: 'site' },
        { label: 'Custom links', value: 'custom' },
      ],
    },
    {
      key: 'customLinks',
      label: 'Links',
      type: 'list',
      itemLabelKey: 'label',
      when: { key: 'source', equals: ['custom'] },
      createItem: () => ({ id: itemId(), label: 'New link', link: { kind: 'none' } }),
      itemFields: [
        { key: 'label', label: 'Label', type: 'text' },
        { key: 'link', label: 'Links to', type: 'link' },
      ],
    },
    { key: 'showCta', label: 'Show button', type: 'toggle' },
    { key: 'ctaLabel', label: 'Button label', type: 'text', when: { key: 'showCta', equals: [true] } },
    { key: 'ctaLink', label: 'Button link', type: 'link', when: { key: 'showCta', equals: [true] } },
    { key: 'sticky', label: 'Stick to top', type: 'toggle' },
  ],
  styleGroups: STYLE_GROUPS.box,
  render: ({ props, attrs, env }) => {
    const items =
      str(props.source, 'site') === 'site'
        ? env.project.navigation.items.map((item) => ({
            id: item.id,
            label: item.label,
            link: {
              kind: item.pageId ? 'page' : 'url',
              pageId: item.pageId,
              url: item.url,
              newTab: item.newTab,
            } as LinkValue,
          }))
        : list<ListItem>(props.customLinks).map((item) => ({
            id: item.id,
            label: str(item.label, 'Link'),
            link: link(item.link),
          }));

    const logoSrc = sanitizeMediaUrl(env.resolveAssetUrl(str(props.logoImage)));
    const cta = anchorAttrs(env, link(props.ctaLink));
    const className = [attrs.className, 'fl-navbar', bool(props.sticky) ? 'fl-navbar-sticky' : '']
      .filter(Boolean)
      .join(' ');

    return (
      <header {...attrs} className={className}>
        <nav className="fl-navbar-inner">
          <span className="fl-navbar-logo">
            {str(props.logoType, 'text') === 'image' && logoSrc ? (
              <img src={logoSrc} alt={str(props.logoText, 'Logo')} style={{ height: num(props.logoHeight, 32) }} />
            ) : (
              str(props.logoText, 'Flarent')
            )}
          </span>
          <ul className="fl-navbar-links">
            {items.length === 0 ? (
              <li className="fl-navbar-empty">Add pages to build your menu</li>
            ) : (
              items.map((item) => {
                const anchor = anchorAttrs(env, item.link);
                const active =
                  item.link.kind === 'page' && item.link.pageId === env.currentPageId;
                return (
                  <li key={item.id}>
                    <a {...anchor} className={active ? 'fl-nav-link fl-nav-active' : 'fl-nav-link'}>
                      {item.label}
                    </a>
                  </li>
                );
              })
            )}
          </ul>
          {bool(props.showCta, true) ? (
            <a {...cta} className="fl-btn fl-btn-primary fl-btn-sm fl-navbar-cta">
              {str(props.ctaLabel, 'Contact')}
            </a>
          ) : null}
        </nav>
      </header>
    );
  },
};

/* ---------------------- composite section blocks ----------------------- */

/** Shared defaults for the "band" components (hero, features, cta, …). */
const bandStyles = {
  desktop: {
    display: 'block',
    width: '100%',
    paddingTop: 96,
    paddingBottom: 96,
    paddingLeft: 24,
    paddingRight: 24,
  },
  tablet: { paddingTop: 72, paddingBottom: 72 },
  mobile: { paddingTop: 56, paddingBottom: 56, paddingLeft: 20, paddingRight: 20 },
} as const;

const heroDef: ComponentDefinition<Record<string, never>> = {
  type: 'hero',
  label: 'Hero',
  icon: Rocket,
  category: 'sections',
  description: 'Opening statement with a headline, copy and buttons.',
  keywords: ['banner', 'header', 'intro'],
  defaultProps: {},
  defaultStyles: {
    ...bandStyles,
    desktop: { ...bandStyles.desktop, paddingTop: 120, paddingBottom: 120, backgroundColor: 'var(--fl-color-surface)' },
  },
  children: { kind: 'any', deny: ['column'] },
  allowedParents: ['__root__'],
  createChildren: () => [
    n('container', {}, { desktop: { gap: 28, alignItems: 'center', textAlign: 'center', maxWidth: 860 } }, [
      n('heading', { text: 'Build something people remember', level: 'h1' }, {
        desktop: { fontSize: 62, textAlign: 'center' },
        tablet: { fontSize: 48 },
        mobile: { fontSize: 34 },
      }),
      n('text', {
        text: 'A short, confident sentence that explains exactly what you do and who you do it for.',
      }, { desktop: { fontSize: 20, textAlign: 'center', maxWidth: 620 }, mobile: { fontSize: 17 } }),
      n('flex', {}, { desktop: { gap: 12, justifyContent: 'center', width: 'auto' }, mobile: { flexDirection: 'column' } }, [
        n('button', { label: 'Get started', variant: 'primary', size: 'lg' }),
        n('button', { label: 'See our work', variant: 'outline', size: 'lg' }),
      ]),
    ]),
  ],
  inspector: [],
  styleGroups: STYLE_GROUPS.box,
  render: ({ attrs, children }) => <section {...attrs}>{children}</section>,
};

const featuresDef: ComponentDefinition<Record<string, never>> = {
  type: 'features',
  label: 'Features',
  icon: SquareStack,
  category: 'sections',
  description: 'Three-up grid of benefits.',
  keywords: ['benefits', 'why us', 'grid'],
  defaultProps: {},
  defaultStyles: bandStyles,
  children: { kind: 'any', deny: ['column'] },
  allowedParents: ['__root__'],
  createChildren: () => [
    n('container', {}, { desktop: { gap: 48, alignItems: 'center' } }, [
      n('container', {}, { desktop: { gap: 14, alignItems: 'center', maxWidth: 680, textAlign: 'center', paddingLeft: 0, paddingRight: 0 } }, [
        n('heading', { text: 'Everything you need', level: 'h2' }, { desktop: { textAlign: 'center' } }),
        n('text', { text: 'Clear, practical reasons a customer should choose you over anyone else.' }, {
          desktop: { textAlign: 'center' },
        }),
      ]),
      n('grid', { columns: 3 }, { desktop: { gap: 24 } }, [
        featureCard('Zap', 'Fast turnaround', 'We move quickly without cutting corners, so you launch on time.'),
        featureCard('ShieldCheck', 'Reliable quality', 'Consistent results you can plan around, backed by a real guarantee.'),
        featureCard('Handshake', 'Personal service', 'Talk to the same people every time. No call centres, no scripts.'),
      ]),
    ]),
  ],
  inspector: [],
  styleGroups: STYLE_GROUPS.box,
  render: ({ attrs, children }) => <section {...attrs}>{children}</section>,
};

function featureCard(icon: string, title: string, body: string) {
  return n('card', {}, {}, [
    n('icon', { name: icon, size: 28 }),
    n('heading', { text: title, level: 'h3' }, { desktop: { fontSize: 21 } }),
    n('text', { text: body }, { desktop: { fontSize: 16 } }),
  ]);
}

const servicesDef: ComponentDefinition<Record<string, never>> = {
  type: 'services',
  label: 'Services',
  icon: Sparkles,
  category: 'sections',
  description: 'Image-led grid of what you offer.',
  keywords: ['offering', 'work', 'menu'],
  defaultProps: {},
  defaultStyles: { ...bandStyles, desktop: { ...bandStyles.desktop, backgroundColor: 'var(--fl-color-surface)' } },
  children: { kind: 'any', deny: ['column'] },
  allowedParents: ['__root__'],
  createChildren: () => [
    n('container', {}, { desktop: { gap: 44 } }, [
      n('heading', { text: 'What we do', level: 'h2' }),
      n('grid', { columns: 3 }, {}, [
        serviceCard('Consultation', 'We start by understanding the outcome you actually need.'),
        serviceCard('Delivery', 'A clear plan, a fixed timeline and steady communication throughout.'),
        serviceCard('Aftercare', 'Support that continues long after the work is handed over.'),
      ]),
    ]),
  ],
  inspector: [],
  styleGroups: STYLE_GROUPS.box,
  render: ({ attrs, children }) => <section {...attrs}>{children}</section>,
};

function serviceCard(title: string, body: string) {
  return n('card', {}, { desktop: { paddingTop: 0, paddingLeft: 0, paddingRight: 0, paddingBottom: 24, overflow: 'hidden', gap: 18 } }, [
    n('image', { alt: title }, { desktop: { height: 200, borderRadius: 0 } }),
    n('heading', { text: title, level: 'h3' }, { desktop: { fontSize: 22, paddingLeft: 24, paddingRight: 24 } }),
    n('text', { text: body }, { desktop: { fontSize: 16, paddingLeft: 24, paddingRight: 24 } }),
  ]);
}

const ctaDef: ComponentDefinition<Record<string, never>> = {
  type: 'cta',
  label: 'Call to action',
  icon: Handshake,
  category: 'sections',
  description: 'Closing prompt that drives the next step.',
  keywords: ['banner', 'convert', 'contact'],
  defaultProps: {},
  defaultStyles: {
    ...bandStyles,
    desktop: { ...bandStyles.desktop, backgroundColor: 'var(--fl-color-primary)' },
  },
  children: { kind: 'any', deny: ['column'] },
  allowedParents: ['__root__'],
  createChildren: () => [
    n('container', {}, { desktop: { alignItems: 'center', gap: 20, textAlign: 'center', maxWidth: 720 } }, [
      n('heading', { text: 'Ready when you are', level: 'h2' }, {
        desktop: { color: '#ffffff', textAlign: 'center', fontSize: 40 },
        mobile: { fontSize: 28 },
      }),
      n('text', { text: 'Tell us what you need and we will come back to you within one working day.' }, {
        desktop: { color: 'rgba(255,255,255,0.86)', textAlign: 'center', fontSize: 18 },
      }),
      n('button', { label: 'Start a conversation', variant: 'secondary', size: 'lg' }),
    ]),
  ],
  inspector: [],
  styleGroups: STYLE_GROUPS.box,
  render: ({ attrs, children }) => <section {...attrs}>{children}</section>,
};

const footerDef: ComponentDefinition<Record<string, never>> = {
  type: 'footer',
  label: 'Footer',
  icon: PanelBottom,
  category: 'sections',
  description: 'Closing band with contact details and links.',
  keywords: ['bottom', 'legal', 'contact'],
  defaultProps: {},
  defaultStyles: {
    ...bandStyles,
    desktop: {
      ...bandStyles.desktop,
      paddingTop: 64,
      paddingBottom: 40,
      backgroundColor: 'var(--fl-color-text)',
    },
  },
  children: { kind: 'any', deny: ['column'] },
  allowedParents: ['__root__'],
  createChildren: () => [
    n('container', {}, { desktop: { gap: 32 } }, [
      n('columns', { count: 3 }, { desktop: { gap: 40 } }, [
        n('column', {}, {}, [
          n('heading', { text: 'Flarent', level: 'h3' }, { desktop: { color: '#ffffff', fontSize: 22 } }),
          n('text', { text: 'Helping local businesses look as good online as they do in person.' }, {
            desktop: { color: 'rgba(255,255,255,0.66)', fontSize: 15 },
          }),
        ]),
        n('column', {}, {}, [
          n('heading', { text: 'Contact', level: 'h4' }, { desktop: { color: '#ffffff', fontSize: 16 } }),
          n('text', { text: 'hello@example.com<br>+1 (555) 010-2030' }, {
            desktop: { color: 'rgba(255,255,255,0.66)', fontSize: 15 },
          }),
        ]),
        n('column', {}, {}, [
          n('heading', { text: 'Visit', level: 'h4' }, { desktop: { color: '#ffffff', fontSize: 16 } }),
          n('text', { text: '128 High Street<br>Open Mon-Sat' }, {
            desktop: { color: 'rgba(255,255,255,0.66)', fontSize: 15 },
          }),
        ]),
      ]),
      n('divider', { color: 'rgba(255,255,255,0.14)' }),
      n('text', { text: '© 2026 Flarent. All rights reserved.' }, {
        desktop: { color: 'rgba(255,255,255,0.5)', fontSize: 14, textAlign: 'center' },
      }),
    ]),
  ],
  inspector: [],
  styleGroups: STYLE_GROUPS.box,
  render: ({ attrs, children }) => <footer {...attrs}>{children}</footer>,
};

const cardDef: ComponentDefinition<Record<string, never>> = {
  type: 'card',
  label: 'Card',
  icon: SquareStack,
  category: 'layout',
  description: 'Surface panel for grouped content.',
  keywords: ['panel', 'tile', 'box'],
  defaultProps: {},
  defaultStyles: {
    desktop: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      paddingTop: 28,
      paddingRight: 28,
      paddingBottom: 28,
      paddingLeft: 28,
      backgroundColor: 'var(--fl-color-background)',
      borderRadius: 'var(--fl-radius-lg)',
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: 'var(--fl-color-border)',
    },
  },
  children: { kind: 'any', deny: ['column'] },
  inspector: [],
  styleGroups: STYLE_GROUPS.box,
  render: ({ attrs, children, isEmpty, env }) => (
    <div {...attrs}>
      {isEmpty && env.mode === 'editor' ? (
        <div className="fl-empty-slot">Drop elements into this card</div>
      ) : (
        children
      )}
    </div>
  ),
};

/* --------------------- data-driven section blocks ---------------------- */

const testimonialsDef: ComponentDefinition<{
  title: string;
  items: ListItem[];
  columns: number;
  showRating: boolean;
}> = {
  type: 'testimonials',
  label: 'Testimonials',
  icon: Quote,
  category: 'sections',
  description: 'What your customers say.',
  keywords: ['reviews', 'quotes', 'social proof'],
  defaultProps: {
    title: 'Loved by our customers',
    columns: 3,
    showRating: true,
    items: [
      { id: itemId(), quote: 'Genuinely the easiest company we have worked with. Everything arrived exactly as promised.', name: 'Sara Whitfield', role: 'Owner, Northside Cafe', rating: 5, avatar: '' },
      { id: itemId(), quote: 'They understood the brief immediately and the result speaks for itself.', name: 'Daniel Okafor', role: 'Director, Okafor Interiors', rating: 5, avatar: '' },
      { id: itemId(), quote: 'Fast, clear and no surprises on the invoice. We have already booked them again.', name: 'Meera Patel', role: 'Operations, Lumen Studio', rating: 5, avatar: '' },
    ],
  },
  defaultStyles: bandStyles,
  children: { kind: 'none' },
  allowedParents: ['__root__', 'section', 'container', 'column'],
  inspector: [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'columns', label: 'Columns', type: 'number', min: 1, max: 4 },
    { key: 'showRating', label: 'Show star rating', type: 'toggle' },
    {
      key: 'items',
      label: 'Testimonials',
      type: 'list',
      itemLabelKey: 'name',
      addLabel: 'Add testimonial',
      createItem: () => ({ id: itemId(), quote: 'A short, specific quote.', name: 'Customer name', role: 'Company', rating: 5, avatar: '' }),
      itemFields: [
        { key: 'quote', label: 'Quote', type: 'textarea', rows: 3 },
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'role', label: 'Role / company', type: 'text' },
        { key: 'rating', label: 'Rating', type: 'number', min: 1, max: 5 },
        { key: 'avatar', label: 'Photo', type: 'image' },
      ],
    },
  ],
  styleGroups: STYLE_GROUPS.box,
  render: ({ props, attrs, env }) => {
    const items = list<ListItem>(props.items);
    return (
      <section {...attrs}>
        <div className="fl-band">
          {str(props.title) ? <h2 className="fl-band-title">{str(props.title)}</h2> : null}
          <div className="fl-auto-grid" style={{ '--fl-cols': num(props.columns, 3) } as React.CSSProperties}>
            {items.map((item) => {
              const avatar = sanitizeMediaUrl(env.resolveAssetUrl(str(item.avatar)));
              return (
                <figure key={item.id} className="fl-testimonial">
                  {bool(props.showRating, true) ? (
                    <div className="fl-stars" aria-label={`${num(item.rating, 5)} out of 5`}>
                      {Array.from({ length: Math.min(Math.max(num(item.rating, 5), 1), 5) }).map((_, i) => (
                        <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
                      ))}
                    </div>
                  ) : null}
                  <blockquote>{str(item.quote)}</blockquote>
                  <figcaption>
                    {avatar ? <img src={avatar} alt="" className="fl-avatar" /> : null}
                    <span>
                      <strong>{str(item.name)}</strong>
                      <em>{str(item.role)}</em>
                    </span>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </div>
      </section>
    );
  },
};

const pricingDef: ComponentDefinition<{
  title: string;
  subtitle: string;
  currency: string;
  period: string;
  plans: ListItem[];
}> = {
  type: 'pricing',
  label: 'Pricing',
  icon: CircleDollarSign,
  category: 'sections',
  description: 'Plan comparison with features and buttons.',
  keywords: ['plans', 'packages', 'price'],
  defaultProps: {
    title: 'Simple pricing',
    subtitle: 'No contracts. Cancel whenever you like.',
    currency: '$',
    period: '/month',
    plans: [
      { id: itemId(), name: 'Starter', price: '29', description: 'For getting going.', features: 'One page\nHosting included\nEmail support', ctaLabel: 'Choose Starter', ctaLink: { kind: 'none' }, featured: false },
      { id: itemId(), name: 'Growth', price: '79', description: 'Our most popular plan.', features: 'Up to five pages\nHosting included\nPriority support\nMonthly updates', ctaLabel: 'Choose Growth', ctaLink: { kind: 'none' }, featured: true },
      { id: itemId(), name: 'Complete', price: '149', description: 'Everything, handled.', features: 'Unlimited pages\nHosting included\nPriority support\nContent updates\nQuarterly review', ctaLabel: 'Choose Complete', ctaLink: { kind: 'none' }, featured: false },
    ],
  },
  defaultStyles: { ...bandStyles, desktop: { ...bandStyles.desktop, backgroundColor: 'var(--fl-color-surface)' } },
  children: { kind: 'none' },
  allowedParents: ['__root__', 'section', 'container'],
  inspector: [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'subtitle', label: 'Subtitle', type: 'text' },
    { key: 'currency', label: 'Currency symbol', type: 'text' },
    { key: 'period', label: 'Billing period', type: 'text', placeholder: '/month' },
    {
      key: 'plans',
      label: 'Plans',
      type: 'list',
      itemLabelKey: 'name',
      addLabel: 'Add plan',
      max: 4,
      createItem: () => ({ id: itemId(), name: 'New plan', price: '0', description: '', features: 'First feature\nSecond feature', ctaLabel: 'Choose plan', ctaLink: { kind: 'none' }, featured: false }),
      itemFields: [
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'price', label: 'Price', type: 'text' },
        { key: 'description', label: 'Description', type: 'text' },
        { key: 'features', label: 'Features', type: 'textarea', rows: 5, help: 'One feature per line.' },
        { key: 'ctaLabel', label: 'Button label', type: 'text' },
        { key: 'ctaLink', label: 'Button link', type: 'link' },
        { key: 'featured', label: 'Highlight this plan', type: 'toggle' },
      ],
    },
  ],
  styleGroups: STYLE_GROUPS.box,
  render: ({ props, attrs, env }) => (
    <section {...attrs}>
      <div className="fl-band">
        <div className="fl-band-head">
          {str(props.title) ? <h2 className="fl-band-title">{str(props.title)}</h2> : null}
          {str(props.subtitle) ? <p className="fl-band-sub">{str(props.subtitle)}</p> : null}
        </div>
        <div className="fl-auto-grid" style={{ '--fl-cols': Math.min(list(props.plans).length || 3, 4) } as React.CSSProperties}>
          {list<ListItem>(props.plans).map((plan) => {
            const anchor = anchorAttrs(env, link(plan.ctaLink));
            return (
              <div key={plan.id} className={bool(plan.featured) ? 'fl-plan fl-plan-featured' : 'fl-plan'}>
                {bool(plan.featured) ? <span className="fl-plan-badge">Most popular</span> : null}
                <h3>{str(plan.name)}</h3>
                {str(plan.description) ? <p className="fl-plan-desc">{str(plan.description)}</p> : null}
                <p className="fl-plan-price">
                  <span className="fl-plan-currency">{str(props.currency, '$')}</span>
                  {str(plan.price)}
                  <span className="fl-plan-period">{str(props.period)}</span>
                </p>
                <ul className="fl-plan-features">
                  {str(plan.features)
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean)
                    .map((line, i) => (
                      <li key={i}>
                        <IconGlyph name="Check" size={16} />
                        {line}
                      </li>
                    ))}
                </ul>
                <a
                  {...anchor}
                  className={`fl-btn ${bool(plan.featured) ? 'fl-btn-primary' : 'fl-btn-outline'} fl-btn-md fl-plan-cta`}
                >
                  {str(plan.ctaLabel, 'Choose plan')}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  ),
};

const faqDef: ComponentDefinition<{ title: string; items: ListItem[]; openFirst: boolean }> = {
  type: 'faq',
  label: 'FAQ',
  icon: CircleHelp,
  category: 'sections',
  description: 'Answers to the questions you get asked most.',
  keywords: ['questions', 'accordion', 'help'],
  defaultProps: {
    title: 'Frequently asked questions',
    openFirst: true,
    items: [
      { id: itemId(), question: 'How quickly can you start?', answer: 'Most projects begin within a week of the first conversation. Urgent work can usually be accommodated.' },
      { id: itemId(), question: 'What does it cost?', answer: 'Every quote is fixed and agreed before any work begins, so there are never surprises on the invoice.' },
      { id: itemId(), question: 'Do you offer support afterwards?', answer: 'Yes. Every project includes thirty days of aftercare, and ongoing support is available monthly.' },
    ],
  },
  defaultStyles: bandStyles,
  children: { kind: 'none' },
  allowedParents: ['__root__', 'section', 'container', 'column'],
  inspector: [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'openFirst', label: 'Open first answer', type: 'toggle' },
    {
      key: 'items',
      label: 'Questions',
      type: 'list',
      itemLabelKey: 'question',
      addLabel: 'Add question',
      createItem: () => ({ id: itemId(), question: 'New question', answer: 'The answer goes here.' }),
      itemFields: [
        { key: 'question', label: 'Question', type: 'text' },
        { key: 'answer', label: 'Answer', type: 'textarea', rows: 4 },
      ],
    },
  ],
  styleGroups: STYLE_GROUPS.box,
  render: ({ props, attrs, env }) => (
    <section {...attrs}>
      <div className="fl-band fl-band-narrow">
        {str(props.title) ? <h2 className="fl-band-title">{str(props.title)}</h2> : null}
        <div className="fl-faq">
          {list<ListItem>(props.items).map((item, index) => (
            <details
              key={item.id}
              className="fl-faq-item"
              open={env.mode === 'editor' ? true : bool(props.openFirst, true) && index === 0}
            >
              <summary>
                {str(item.question)}
                <ChevronDown size={18} aria-hidden />
              </summary>
              <p>{str(item.answer)}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  ),
};

const galleryDef: ComponentDefinition<{
  title: string;
  items: ListItem[];
  columns: number;
  gap: number;
  ratio: string;
}> = {
  type: 'gallery',
  label: 'Gallery',
  icon: GalleryHorizontal,
  category: 'sections',
  description: 'Grid of photographs.',
  keywords: ['photos', 'portfolio', 'images'],
  defaultProps: {
    title: 'Our work',
    columns: 3,
    gap: 16,
    ratio: '4 / 3',
    items: [
      { id: itemId(), src: '', alt: 'Gallery image' },
      { id: itemId(), src: '', alt: 'Gallery image' },
      { id: itemId(), src: '', alt: 'Gallery image' },
      { id: itemId(), src: '', alt: 'Gallery image' },
      { id: itemId(), src: '', alt: 'Gallery image' },
      { id: itemId(), src: '', alt: 'Gallery image' },
    ],
  },
  defaultStyles: bandStyles,
  children: { kind: 'none' },
  allowedParents: ['__root__', 'section', 'container', 'column'],
  inspector: [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'columns', label: 'Columns', type: 'number', min: 1, max: 6 },
    { key: 'gap', label: 'Gap', type: 'number', min: 0, max: 64, unit: 'px' },
    {
      key: 'ratio',
      label: 'Image shape',
      type: 'select',
      options: [
        { label: 'Landscape 4:3', value: '4 / 3' },
        { label: 'Square', value: '1 / 1' },
        { label: 'Portrait 3:4', value: '3 / 4' },
        { label: 'Wide 16:9', value: '16 / 9' },
      ],
    },
    {
      key: 'items',
      label: 'Images',
      type: 'list',
      itemLabelKey: 'alt',
      addLabel: 'Add image',
      createItem: () => ({ id: itemId(), src: '', alt: 'Gallery image' }),
      itemFields: [
        { key: 'src', label: 'Image', type: 'image' },
        { key: 'alt', label: 'Alt text', type: 'text' },
      ],
    },
  ],
  styleGroups: STYLE_GROUPS.box,
  render: ({ props, attrs, env }) => (
    <section {...attrs}>
      <div className="fl-band">
        {str(props.title) ? <h2 className="fl-band-title">{str(props.title)}</h2> : null}
        <div
          className="fl-auto-grid"
          style={{ '--fl-cols': num(props.columns, 3), gap: num(props.gap, 16) } as React.CSSProperties}
        >
          {list<ListItem>(props.items).map((item) => (
            <img
              key={item.id}
              className="fl-gallery-img"
              style={{ aspectRatio: str(props.ratio, '4 / 3') }}
              src={sanitizeMediaUrl(env.resolveAssetUrl(str(item.src))) || PLACEHOLDER_IMAGE}
              alt={str(item.alt)}
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </section>
  ),
};

export const sectionComponents = [
  navbarDef, heroDef, featuresDef, servicesDef, testimonialsDef, pricingDef, faqDef, galleryDef,
  ctaDef, footerDef, cardDef,
] as unknown as ComponentDefinition<never>[];
