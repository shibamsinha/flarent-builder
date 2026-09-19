import { n } from '@/engine/registry/build';
import { itemId } from '@/engine/registry/components/shared';
import { assembleProject, contactPage, footer, navbar, pageLink } from './kit';
import { bandArt, blobArt, tileArt } from './imagery';
import type { TemplateDefinition } from './types';

const BRAND = 'Marlowe Studio';
const PRIMARY = '#8a7355';
const INK = '#2a2622';

export const interiorTemplate: TemplateDefinition = {
  id: 'interior-design',
  name: 'Interior Design',
  description: 'Editorial, image-led studio site with a project portfolio and process.',
  tag: 'Design studio',
  accent: [PRIMARY, '#c4b29a'],
  build: (projectName) =>
    assembleProject(
      {
        templateId: 'interior-design',
        siteName: BRAND,
        description: 'Interior architecture and furnishing for homes that are actually lived in.',
        theme: {
          colors: {
            primary: PRIMARY,
            secondary: '#5c6b5d',
            accent: '#c4b29a',
            background: '#faf8f5',
            surface: '#efeae2',
            text: INK,
            muted: '#6f675e',
            border: '#e0d9ce',
          },
          typography: { headingFont: 'Lora, serif', bodyFont: 'DM Sans, sans-serif', baseSize: 16, scale: 1.24 },
          radius: { sm: 2, md: 4, lg: 6, pill: 999 },
          containerWidth: 1200,
        },
        pages: [
          { name: 'Home', nodes: home() },
          { name: 'Projects', nodes: projects() },
          { name: 'Studio', nodes: studio() },
          {
            name: 'Contact',
            nodes: contactPage({
              brand: BRAND,
              intro: 'We take on a small number of projects each year. Tell us about yours.',
              address: '3 Bellevue Mews, Bristol',
              phone: '+44 117 325 0044',
              email: 'studio@marlowe.design',
              whatsapp: '+441173250044',
              surface: '#efeae2',
            }),
          },
        ],
      },
      projectName,
    ),
};

const footerNode = () =>
  footer({
    brand: BRAND,
    tagline: 'Interior architecture and furnishing, Bristol and the south west.',
    email: 'studio@marlowe.design',
    phone: '+44 117 325 0044',
    address: '3 Bellevue Mews<br>Bristol BS8 2QF',
    hoursNote: 'Studio visits by appointment<br>Mon-Thu 09:00-17:00',
    background: INK,
  });

function home() {
  return [
    navbar({ brand: BRAND, ctaLabel: 'Enquire', ctaPage: 'Contact', background: '#faf8f5' }),
    n('hero', {}, { desktop: { backgroundColor: '#faf8f5', paddingTop: 88, paddingBottom: 0 } }, [
      n('container', {}, { desktop: { gap: 44, maxWidth: 1200 } }, [
        n('container', {}, { desktop: { gap: 20, maxWidth: 820, paddingLeft: 0, paddingRight: 0, marginLeft: 0 } }, [
          n('heading', { text: 'Rooms that feel settled the day you move back in', level: 'h1' }, {
            desktop: { fontSize: 62, lineHeight: 1.06, fontWeight: 500 },
            tablet: { fontSize: 46 },
            mobile: { fontSize: 32 },
          }),
          n('text', { text: 'Marlowe Studio designs whole-house interiors for period properties and new builds across the south west, from structural planning through to the last lamp.' }, {
            desktop: { fontSize: 19, maxWidth: 620 },
          }),
          n('flex', {}, { desktop: { gap: 14, width: 'auto' }, mobile: { flexDirection: 'column' } }, [
            n('button', { label: 'View projects', size: 'lg', link: pageLink('Projects') }),
            n('button', { label: 'Start an enquiry', variant: 'text', size: 'lg', link: pageLink('Contact') }),
          ]),
        ]),
        n('image', { src: blobArt({ from: PRIMARY, to: '#c4b29a', tint: '#faf8f5', width: 1600, height: 760 }), alt: 'Recent project' }, {
          desktop: { height: 560, borderRadius: 6 },
          mobile: { height: 280 },
        }),
      ]),
    ]),
    n('section', {}, { desktop: { paddingTop: 96, paddingBottom: 96 } }, [
      n('container', {}, {}, [
        n('columns', { count: 2, ratio: '1:2' }, { desktop: { gap: 64, alignItems: 'start' } }, [
          n('column', {}, {}, [
            n('heading', { text: 'How we work', level: 'h2' }, {
              desktop: { fontSize: 15, letterSpacing: '0.2em', textTransform: 'uppercase', color: PRIMARY, fontWeight: 600, fontFamily: 'var(--fl-font-body)' },
            }),
          ]),
          n('column', {}, { desktop: { gap: 36 } }, [
            step('01', 'Survey and brief', 'We spend a full day in the house understanding how you use it, what frustrates you and what you want to keep.'),
            step('02', 'Concept and layout', 'Plans, elevations and a material palette. Enough to see the finished room before anything is committed.'),
            step('03', 'Detailed design', 'Joinery drawings, lighting plans, finishes schedule and a fixed cost for every item.'),
            step('04', 'Delivery', 'We manage trades, deliveries and installation, and we are there on the day everything lands.'),
          ]),
        ]),
      ]),
    ]),
    n('gallery', {
      title: 'Selected work',
      columns: 3,
      gap: 14,
      ratio: '3 / 4',
      items: [
        { id: itemId(), src: bandArt({ from: PRIMARY, to: '#c4b29a' }), alt: 'Clifton townhouse' },
        { id: itemId(), src: bandArt({ from: '#5c6b5d', to: '#9db09c' }), alt: 'Coastal new build' },
        { id: itemId(), src: bandArt({ from: '#2a2622', to: '#8a7355' }), alt: 'Georgian rectory' },
      ],
    }, { desktop: { backgroundColor: '#efeae2' } }),
    n('testimonials', {
      title: 'Clients',
      columns: 2,
      showRating: false,
      items: [
        { id: itemId(), quote: 'They understood the house better than we did after fifteen years of living in it. Every decision felt obvious once they had drawn it.', name: 'Helen & Robert Kay', role: 'Clifton townhouse', rating: 5, avatar: '' },
        { id: itemId(), quote: 'Calm, organised and completely on top of the trades. The budget did not move once.', name: 'Aisha Rahman', role: 'Coastal new build', rating: 5, avatar: '' },
      ],
    }),
    n('cta', {}, { desktop: { backgroundColor: INK } }, [
      n('container', {}, { desktop: { alignItems: 'center', gap: 20, textAlign: 'center', maxWidth: 680 } }, [
        n('heading', { text: 'Four projects a year', level: 'h2' }, {
          desktop: { color: '#faf8f5', textAlign: 'center', fontSize: 42, fontWeight: 500 }, mobile: { fontSize: 30 },
        }),
        n('text', { text: 'That is all we take on, so every house gets the studio’s full attention. We are currently booking for next season.' }, {
          desktop: { color: 'rgba(250,248,245,0.74)', textAlign: 'center', fontSize: 18 },
        }),
        n('button', { label: 'Start an enquiry', variant: 'secondary', size: 'lg', link: pageLink('Contact') }),
      ]),
    ]),
    footerNode(),
  ];
}

function step(number: string, title: string, body: string) {
  return n('flex', {}, { desktop: { gap: 24, alignItems: 'start' }, mobile: { flexDirection: 'row' } }, [
    n('text', { text: number }, {
      desktop: { color: PRIMARY, fontSize: 15, fontWeight: 600, letterSpacing: '0.1em', width: 44 },
    }),
    n('container', {}, { desktop: { gap: 8, maxWidth: 'none', marginLeft: 0, paddingLeft: 0, paddingRight: 0 } }, [
      n('heading', { text: title, level: 'h3' }, { desktop: { fontSize: 24, fontWeight: 500 } }),
      n('text', { text: body }, { desktop: { fontSize: 17 } }),
    ]),
  ]);
}

function projects() {
  const project = (title: string, place: string, body: string, art: string, reverse: boolean) =>
    n('section', {}, { desktop: { paddingTop: 56, paddingBottom: 56 } }, [
      n('container', {}, {}, [
        n('columns', { count: 2, ratio: reverse ? '1:2' : '2:1' }, { desktop: { gap: 52, alignItems: 'center' } },
          reverse
            ? [
                n('column', {}, { desktop: { gap: 14 } }, [
                  n('text', { text: place }, { desktop: { color: PRIMARY, fontSize: 13, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600 } }),
                  n('heading', { text: title, level: 'h2' }, { desktop: { fontSize: 38, fontWeight: 500 } }),
                  n('text', { text: body }, { desktop: { fontSize: 17 } }),
                ]),
                n('column', {}, {}, [n('image', { src: art, alt: title }, { desktop: { height: 460, borderRadius: 6 } })]),
              ]
            : [
                n('column', {}, {}, [n('image', { src: art, alt: title }, { desktop: { height: 460, borderRadius: 6 } })]),
                n('column', {}, { desktop: { gap: 14 } }, [
                  n('text', { text: place }, { desktop: { color: PRIMARY, fontSize: 13, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600 } }),
                  n('heading', { text: title, level: 'h2' }, { desktop: { fontSize: 38, fontWeight: 500 } }),
                  n('text', { text: body }, { desktop: { fontSize: 17 } }),
                ]),
              ],
        ),
      ]),
    ]);

  return [
    navbar({ brand: BRAND, ctaLabel: 'Enquire', ctaPage: 'Contact', background: '#faf8f5' }),
    n('section', {}, { desktop: { paddingTop: 80, paddingBottom: 24 } }, [
      n('container', {}, { desktop: { gap: 16, maxWidth: 760 } }, [
        n('heading', { text: 'Projects', level: 'h1' }, { desktop: { fontSize: 56, fontWeight: 500 }, mobile: { fontSize: 36 } }),
        n('text', { text: 'A selection of recent whole-house projects. Full case studies are available on request.' }, {
          desktop: { fontSize: 18 },
        }),
      ]),
    ]),
    project('A Georgian rectory, reordered', 'Somerset', 'Six months of structural work opened the rear of the house to the garden. New joinery throughout, a kitchen built around a single long table, and a palette taken from the original shutters.', tileArt({ from: PRIMARY, to: '#c4b29a', width: 1100, height: 850 }), false),
    project('Coastal new build', 'North Devon', 'A family home designed for salt air and wet dogs. Hard-wearing surfaces, deep storage at every entrance, and windows placed to hold the view without losing wall space.', tileArt({ from: '#5c6b5d', to: '#9db09c', width: 1100, height: 850 }), true),
    project('Clifton townhouse', 'Bristol', 'Five floors brought back into use, including a basement kitchen that now gets more light than the ground floor. Original cornicing retained and matched where it had been lost.', tileArt({ from: INK, to: PRIMARY, width: 1100, height: 850 }), false),
    footerNode(),
  ];
}

function studio() {
  return [
    navbar({ brand: BRAND, ctaLabel: 'Enquire', ctaPage: 'Contact', background: '#faf8f5' }),
    n('section', {}, { desktop: { paddingTop: 88, paddingBottom: 72 } }, [
      n('container', {}, {}, [
        n('columns', { count: 2 }, { desktop: { gap: 60, alignItems: 'center' } }, [
          n('column', {}, { desktop: { gap: 20 } }, [
            n('heading', { text: 'A studio of four, in a mews in Bristol', level: 'h1' }, {
              desktop: { fontSize: 44, fontWeight: 500 }, mobile: { fontSize: 30 },
            }),
            n('text', { text: 'Marlowe Studio was founded in 2016 by Esme Marlowe after a decade in interior architecture. We are deliberately small: every project is run by the person you first meet.' }, { desktop: { fontSize: 18 } }),
            n('text', { text: 'We work mostly on period houses, where the answer is usually to remove something rather than add it. We draw everything, we specify everything, and we are on site the day it arrives.' }, { desktop: { fontSize: 18 } }),
          ]),
          n('column', {}, {}, [
            n('image', { src: bandArt({ from: PRIMARY, to: INK }), alt: 'The studio' }, { desktop: { height: 500, borderRadius: 6 } }),
          ]),
        ]),
      ]),
    ]),
    n('features', {}, { desktop: { backgroundColor: '#efeae2' } }, [
      n('container', {}, { desktop: { gap: 44 } }, [
        n('heading', { text: 'What is included', level: 'h2' }, { desktop: { textAlign: 'center', fontSize: 36, fontWeight: 500 } }),
        n('grid', { columns: 3 }, {}, [
          plain('Ruler', 'Measured survey', 'Full drawings of the house as it stands, so nothing is a surprise later.'),
          plain('Palette', 'Material palette', 'Physical samples of every finish, assembled in your own light before anything is ordered.'),
          plain('Clipboard', 'Cost schedule', 'A line-by-line budget you own, with our fee stated separately and never taken as a percentage.'),
        ]),
      ]),
    ]),
    footerNode(),
  ];
}

function plain(icon: string, title: string, body: string) {
  return n('card', {}, { desktop: { borderWidth: 0, backgroundColor: 'transparent', paddingLeft: 0, paddingRight: 0, gap: 12 } }, [
    n('icon', { name: icon, size: 24 }),
    n('heading', { text: title, level: 'h3' }, { desktop: { fontSize: 21, fontWeight: 500 } }),
    n('text', { text: body }, { desktop: { fontSize: 16 } }),
  ]);
}
