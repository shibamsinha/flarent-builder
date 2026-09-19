import { n } from '@/engine/registry/build';
import { itemId } from '@/engine/registry/components/shared';
import type { BrandProfile, ProfileInput, TemplateDefaults } from '@/onboarding/profile';
import { fullAddress, resolveProfile } from '@/onboarding/profile';
import { artColors, assembleForProfile, contactPage, footer, navbar, pageLink } from './kit';
import { bandArt, blobArt, tileArt } from './imagery';
import type { TemplateDefinition } from './types';

const PRIMARY = '#b4552d';
const SECONDARY = '#d98a4f';
const INK = '#241a14';

const DEFAULTS: TemplateDefaults = {
  tagline: 'Seasonal cooking over charcoal',
  description:
    'A short menu that changes with the season, cooked over charcoal and shared across the table.',
  email: 'bookings@example.com',
  phone: '+1 (555) 204 8811',
  whatsapp: '+15552048811',
  street: '42 Fisher Street',
  city: 'Old Town',
  hours: 'Tue-Thu 17:00-22:00\nFri-Sat 12:00-23:00\nSun 12:00-17:00',
  offerings: [
    { title: 'Charred aubergine', body: 'Smoked yoghurt, pomegranate, mint' },
    { title: 'Whole sea bream', body: 'Fennel, lemon, new potatoes' },
    { title: 'Lamb shoulder', body: 'Six hours, flatbread, pickled chilli' },
  ],
};

export const restaurantTemplate: TemplateDefinition = {
  id: 'restaurant',
  name: 'Restaurant',
  description: 'Warm, appetising site with a menu, gallery, hours and table enquiries.',
  tag: 'Food & drink',
  accent: [PRIMARY, SECONDARY],
  defaults: DEFAULTS,
  build: (input: ProfileInput) => {
    const p = resolveProfile(input, DEFAULTS);
    return assembleForProfile(
      {
        templateId: 'restaurant',
        siteName: p.businessName,
        description: p.tagline,
        theme: {
          colors: {
            primary: PRIMARY,
            secondary: '#2f5d50',
            accent: '#e0a458',
            background: '#fdf8f3',
            surface: '#f5e9dd',
            text: INK,
            muted: '#6d5a4c',
            border: '#e6d5c4',
          },
          typography: { headingFont: 'Playfair Display, serif', bodyFont: 'Inter, sans-serif', baseSize: 16, scale: 1.3 },
          radius: { sm: 6, md: 10, lg: 16, pill: 999 },
          containerWidth: 1120,
        },
        pages: [
          { name: 'Home', nodes: home(p) },
          { name: 'Menu', nodes: menu(p) },
          { name: 'About', nodes: about(p) },
          {
            name: 'Contact',
            nodes: contactPage({
              profile: p,
              intro: 'Booking a table, planning a party or just after a recommendation? Drop us a line.',
              surface: '#f5e9dd',
            }),
          },
        ],
      },
      p,
    );
  },
};

const footerNode = (p: BrandProfile) => footer({ profile: p, background: INK });

function home(p: BrandProfile) {
  return [
    navbar({ brand: p.businessName, ctaLabel: 'Book a table', ctaPage: 'Contact', background: '#fdf8f3' }),
    n('hero', {}, {
      desktop: {
        paddingTop: 150,
        paddingBottom: 150,
        backgroundColor: INK,
        backgroundImage: `linear-gradient(rgba(36,26,20,.62), rgba(36,26,20,.72)), url("${blobArt({ ...artColors(p, PRIMARY, '#7a3a1c'), tint: '#f6d9b8' })}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      },
      mobile: { paddingTop: 96, paddingBottom: 96 },
    }, [
      n('container', {}, { desktop: { alignItems: 'center', textAlign: 'center', gap: 22, maxWidth: 760 } }, [
        n('text', { text: `${p.city} · ${p.tagline}` }, {
          desktop: { color: '#e6c9a8', letterSpacing: '0.18em', textTransform: 'uppercase', fontSize: 13, textAlign: 'center' },
        }),
        n('heading', { text: 'Slow food, open fire, generous plates', level: 'h1' }, {
          desktop: { color: '#fff', fontSize: 64, textAlign: 'center', lineHeight: 1.08 },
          tablet: { fontSize: 48 },
          mobile: { fontSize: 34 },
        }),
        n('text', { text: p.description }, {
          desktop: { color: 'rgba(255,255,255,0.8)', fontSize: 19, textAlign: 'center', maxWidth: 560 },
        }),
        n('flex', {}, { desktop: { gap: 12, justifyContent: 'center', width: 'auto' }, mobile: { flexDirection: 'column' } }, [
          n('button', { label: 'Book a table', size: 'lg', link: pageLink('Contact') }),
          n('button', { label: 'View the menu', variant: 'secondary', size: 'lg', link: pageLink('Menu') }),
        ]),
      ]),
    ]),
    n('section', {}, { desktop: { paddingTop: 88, paddingBottom: 88 } }, [
      n('container', {}, {}, [
        n('columns', { count: 2 }, { desktop: { gap: 56, alignItems: 'center' } }, [
          n('column', {}, {}, [
            n('image', { src: tileArt({ from: '#2f5d50', to: '#84a898' }), alt: 'The dining room' }, {
              desktop: { height: 440, borderRadius: 16 },
            }),
          ]),
          n('column', {}, { desktop: { gap: 20 } }, [
            n('heading', { text: 'Cooked over charcoal, eaten together', level: 'h2' }, {
              desktop: { fontSize: 42 }, mobile: { fontSize: 30 },
            }),
            n('text', { text: 'Everything comes off one fire. Vegetables from the market that morning, fish landed on the coast, bread baked in house twice a day.' }, {
              desktop: { fontSize: 18 },
            }),
            n('text', { text: 'We keep the menu short on purpose. Fewer dishes, cooked properly, changed when the season turns.' }, {
              desktop: { fontSize: 18 },
            }),
            n('button', { label: 'Read our story', variant: 'outline', link: pageLink('About') }),
          ]),
        ]),
      ]),
    ]),
    n('section', {}, { desktop: { paddingTop: 80, paddingBottom: 80, backgroundColor: '#f5e9dd' } }, [
      n('container', {}, { desktop: { gap: 40 } }, [
        n('heading', { text: 'From tonight’s menu', level: 'h2' }, { desktop: { textAlign: 'center', fontSize: 40 } }),
        n('grid', { columns: 3 }, {}, [
          dish(p.offerings[0].title, p.offerings[0].body, '12'),
          dish(p.offerings[1].title, p.offerings[1].body, '28'),
          dish(p.offerings[2].title, p.offerings[2].body, '32'),
        ]),
        n('button', { label: 'See the full menu', link: pageLink('Menu'), size: 'lg' }, {
          desktop: { marginLeft: 'auto', marginRight: 'auto' },
        }),
      ]),
    ]),
    n('gallery', {
      title: 'The room',
      columns: 3,
      gap: 12,
      ratio: '4 / 3',
      items: [
        { id: itemId(), src: tileArt({ from: PRIMARY, to: SECONDARY }), alt: 'Open kitchen' },
        { id: itemId(), src: bandArt({ from: '#2f5d50', to: '#84a898', width: 900, height: 700 }), alt: 'Dining room' },
        { id: itemId(), src: tileArt({ from: '#e0a458', to: '#b4552d' }), alt: 'Charcoal grill' },
        { id: itemId(), src: bandArt({ from: '#7a3a1c', to: '#d98a4f', width: 900, height: 700 }), alt: 'Bread service' },
        { id: itemId(), src: tileArt({ from: '#84a898', to: '#2f5d50' }), alt: 'Terrace' },
        { id: itemId(), src: blobArt({ from: '#b4552d', to: '#e0a458', width: 900, height: 700 }), alt: 'Dessert' },
      ],
    }),
    n('testimonials', {
      title: 'What guests say',
      columns: 3,
      items: [
        { id: itemId(), quote: 'The lamb is worth the trip on its own. We have been back four times this year.', name: 'Elena Marsh', role: 'Regular since 2019', rating: 5, avatar: '' },
        { id: itemId(), quote: 'Unfussy, generous and genuinely warm service. Exactly what a neighbourhood restaurant should be.', name: 'Jon Alvarez', role: 'Old Town', rating: 5, avatar: '' },
        { id: itemId(), quote: 'They looked after a table of twelve without a single thing going wrong. Rare.', name: 'Naomi Clarke', role: 'Birthday party', rating: 5, avatar: '' },
      ],
    }, { desktop: { backgroundColor: '#f5e9dd' } }),
    n('section', {}, { desktop: { paddingTop: 80, paddingBottom: 80 } }, [
      n('container', {}, {}, [
        n('columns', { count: 2 }, { desktop: { gap: 44, alignItems: 'start' } }, [
          n('column', {}, {}, [n('businessHours', {
            title: 'Opening hours',
            rows: [
              { id: itemId(), day: 'Monday', hours: '', closed: true },
              { id: itemId(), day: 'Tuesday', hours: '17:00 - 22:00', closed: false },
              { id: itemId(), day: 'Wednesday', hours: '17:00 - 22:00', closed: false },
              { id: itemId(), day: 'Thursday', hours: '17:00 - 22:00', closed: false },
              { id: itemId(), day: 'Friday', hours: '12:00 - 23:00', closed: false },
              { id: itemId(), day: 'Saturday', hours: '12:00 - 23:00', closed: false },
              { id: itemId(), day: 'Sunday', hours: '12:00 - 17:00', closed: false },
            ],
          }, { desktop: { backgroundColor: '#f5e9dd' } })]),
          n('column', {}, {}, [n('map', { address: fullAddress(p), height: 340 })]),
        ]),
      ]),
    ]),
    n('cta', {}, { desktop: { backgroundColor: INK } }, [
      n('container', {}, { desktop: { alignItems: 'center', gap: 18, textAlign: 'center', maxWidth: 680 } }, [
        n('heading', { text: 'Tables go quickly at the weekend', level: 'h2' }, {
          desktop: { color: '#fff', textAlign: 'center', fontSize: 40 }, mobile: { fontSize: 28 },
        }),
        n('text', { text: 'Reserve online, or message us and we will find you a table.' }, {
          desktop: { color: 'rgba(255,255,255,0.78)', textAlign: 'center', fontSize: 18 },
        }),
        n('flex', {}, { desktop: { gap: 12, justifyContent: 'center', width: 'auto' }, mobile: { flexDirection: 'column' } }, [
          n('button', { label: 'Book a table', size: 'lg', link: pageLink('Contact') }),
          n('whatsapp', {
            phone: p.whatsapp,
            label: 'Message us',
            message: `Hi ${p.businessName}, I would like to book a table.`,
            size: 'lg',
          }),
        ]),
      ]),
    ]),
    footerNode(p),
  ];
}

function menu(p: BrandProfile) {
  return [
    navbar({ brand: p.businessName, ctaLabel: 'Book a table', ctaPage: 'Contact', background: '#fdf8f3' }),
    n('section', {}, { desktop: { paddingTop: 80, paddingBottom: 40, backgroundColor: '#f5e9dd' } }, [
      n('container', {}, { desktop: { gap: 14, alignItems: 'center', textAlign: 'center', maxWidth: 700 } }, [
        n('heading', { text: 'The menu', level: 'h1' }, { desktop: { fontSize: 56, textAlign: 'center' }, mobile: { fontSize: 36 } }),
        n('text', { text: 'Changed every few weeks as the season turns. Ask us about wine, the list is short and all of it is open by the glass.' }, {
          desktop: { fontSize: 18, textAlign: 'center' },
        }),
      ]),
    ]),
    n('section', {}, { desktop: { paddingTop: 64, paddingBottom: 88 } }, [
      n('container', {}, { desktop: { gap: 52, maxWidth: 820 } }, [
        menuGroup('To start', [
          ['Warm flatbread, olive oil', '6'],
          ['Charred aubergine, smoked yoghurt', '12'],
          ['Grilled octopus, white beans', '15'],
          ['Tomatoes, basil, aged sherry vinegar', '10'],
        ]),
        menuGroup('From the fire', [
          ['Whole sea bream, fennel, lemon', '28'],
          ['Lamb shoulder, six hours, flatbread', '32'],
          ['Half chicken, garlic, oregano', '24'],
          ['Grilled hispi cabbage, almond, chilli', '16'],
        ]),
        menuGroup('To finish', [
          ['Olive oil cake, crème fraîche', '9'],
          ['Burnt cheesecake', '10'],
          ['Affogato', '7'],
        ]),
      ]),
    ]),
    footerNode(p),
  ];
}

function menuGroup(title: string, rows: [string, string][]) {
  return n('container', {}, { desktop: { gap: 16, maxWidth: 'none', paddingLeft: 0, paddingRight: 0 } }, [
    n('heading', { text: title, level: 'h2' }, {
      desktop: { fontSize: 15, letterSpacing: '0.18em', textTransform: 'uppercase', color: PRIMARY },
    }),
    n('divider', {}),
    ...rows.map(([name, price]) =>
      n('flex', {}, { desktop: { justifyContent: 'space-between', alignItems: 'baseline', gap: 16 }, mobile: { flexDirection: 'row' } }, [
        n('text', { text: name }, { desktop: { fontSize: 18, color: 'var(--fl-color-text)' } }),
        n('text', { text: price }, { desktop: { fontSize: 18, fontWeight: 600, color: PRIMARY } }),
      ]),
    ),
  ]);
}

function dish(name: string, description: string, price: string) {
  return n('card', {}, { desktop: { gap: 8, backgroundColor: '#fdf8f3' } }, [
    n('heading', { text: name, level: 'h3' }, { desktop: { fontSize: 22 } }),
    n('text', { text: description }, { desktop: { fontSize: 16 } }),
    n('text', { text: `£${price}` }, { desktop: { fontSize: 17, fontWeight: 600, color: PRIMARY, marginTop: 6 } }),
  ]);
}

function about(p: BrandProfile) {
  return [
    navbar({ brand: p.businessName, ctaLabel: 'Book a table', ctaPage: 'Contact', background: '#fdf8f3' }),
    n('section', {}, { desktop: { paddingTop: 88, paddingBottom: 72 } }, [
      n('container', {}, {}, [
        n('columns', { count: 2, ratio: '1:2' }, { desktop: { gap: 52, alignItems: 'center' } }, [
          n('column', {}, {}, [
            n('image', { src: bandArt({ from: PRIMARY, to: '#7a3a1c' }), alt: 'Our head chef' }, {
              desktop: { height: 460, borderRadius: 16 },
            }),
          ]),
          n('column', {}, { desktop: { gap: 20 } }, [
            n('heading', { text: `Our story in ${p.city}`, level: 'h1' }, {
              desktop: { fontSize: 46 }, mobile: { fontSize: 32 },
            }),
            n('text', { text: `${p.businessName} started as a six-table room with one grill and a very short menu. Not much has changed except the number of tables.` }, { desktop: { fontSize: 18 } }),
            n('text', { text: 'We buy from the same four suppliers we started with, cook what they bring, and write the menu that afternoon. If something runs out, it runs out.' }, { desktop: { fontSize: 18 } }),
            n('text', { text: 'Everyone who works here eats together before service. It is the best way we know to keep the food honest.' }, { desktop: { fontSize: 18 } }),
          ]),
        ]),
      ]),
    ]),
    footerNode(p),
  ];
}
