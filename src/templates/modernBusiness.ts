import { n } from '@/engine/registry/build';
import { itemId } from '@/engine/registry/components/shared';
import { assembleProject, contactPage, footer, navbar, pageLink } from './kit';
import { blobArt, tileArt } from './imagery';
import type { TemplateDefinition } from './types';

const BRAND = 'Northgate Partners';
const PRIMARY = '#5b3df5';
const SECONDARY = '#8c6bff';

export const modernBusinessTemplate: TemplateDefinition = {
  id: 'modern-business',
  name: 'Modern Business',
  description: 'Confident consultancy site with services, proof and a clear enquiry path.',
  tag: 'Professional services',
  accent: [PRIMARY, SECONDARY],
  build: (projectName) =>
    assembleProject(
      {
        templateId: 'modern-business',
        siteName: BRAND,
        description: 'Strategy and operations consultancy for growing companies.',
        theme: {
          colors: {
            primary: PRIMARY,
            secondary: SECONDARY,
            accent: '#f6c344',
            background: '#ffffff',
            surface: '#f4f2ff',
            text: '#141026',
            muted: '#5f5a75',
            border: '#e5e1f7',
          },
          typography: { headingFont: 'Plus Jakarta Sans, sans-serif', bodyFont: 'Inter, sans-serif', baseSize: 16, scale: 1.25 },
          radius: { sm: 8, md: 14, lg: 22, pill: 999 },
          containerWidth: 1160,
        },
        pages: [
          { name: 'Home', nodes: home() },
          { name: 'Services', nodes: services() },
          { name: 'About', nodes: about() },
          {
            name: 'Contact',
            nodes: contactPage({
              brand: BRAND,
              intro: 'Tell us what you are working on. We reply to every enquiry within one working day.',
              address: '18 Cornhill, London EC3V 3ND',
              phone: '+44 20 7946 0122',
              email: 'hello@northgatepartners.com',
              whatsapp: '+442079460122',
            }),
          },
        ],
      },
      projectName,
    ),
};

function home() {
  return [
    navbar({ brand: BRAND, ctaLabel: 'Book a call', ctaPage: 'Contact' }),
    n('hero', {}, { desktop: { backgroundColor: '#f4f2ff', paddingTop: 104, paddingBottom: 104 } }, [
      n('container', {}, { desktop: { maxWidth: 1160 } }, [
        n('columns', { count: 2, ratio: '3:2' }, { desktop: { gap: 56, alignItems: 'center' } }, [
          n('column', {}, { desktop: { gap: 24 } }, [
            n('text', { text: 'Strategy · Operations · Growth' }, {
              desktop: { color: PRIMARY, fontWeight: 600, fontSize: 14, letterSpacing: '0.12em', textTransform: 'uppercase' },
            }),
            n('heading', { text: 'Clear thinking for companies in their next chapter', level: 'h1' }, {
              desktop: { fontSize: 58, lineHeight: 1.08 },
              tablet: { fontSize: 44 },
              mobile: { fontSize: 33 },
            }),
            n('text', {
              text: 'We work alongside founders and leadership teams to turn a crowded list of priorities into a plan the business can actually deliver.',
            }, { desktop: { fontSize: 19, maxWidth: 520 } }),
            n('flex', {}, { desktop: { gap: 12, width: 'auto' }, mobile: { flexDirection: 'column' } }, [
              n('button', { label: 'Book an intro call', size: 'lg', link: pageLink('Contact') }),
              n('button', { label: 'See our services', variant: 'outline', size: 'lg', link: pageLink('Services') }),
            ]),
            n('flex', {}, { desktop: { gap: 28, marginTop: 12 }, mobile: { flexDirection: 'column', gap: 12 } }, [
              stat('120+', 'engagements delivered'),
              stat('14 yrs', 'average partner experience'),
              stat('92%', 'clients return'),
            ]),
          ]),
          n('column', {}, {}, [
            n('image', { src: blobArt({ from: PRIMARY, to: SECONDARY }), alt: 'Abstract brand artwork' }, {
              desktop: { height: 460, borderRadius: 24 },
              mobile: { height: 260 },
            }),
          ]),
        ]),
      ]),
    ]),
    n('section', {}, { desktop: { paddingTop: 72, paddingBottom: 72 } }, [
      n('container', {}, { desktop: { gap: 44 } }, [
        n('heading', { text: 'What we help with', level: 'h2' }, { desktop: { fontSize: 38, textAlign: 'center' } }),
        n('grid', { columns: 3 }, {}, [
          card('Compass', 'Strategy reviews', 'A structured look at where the business makes money, where it leaks, and what to do next quarter.'),
          card('Settings', 'Operating models', 'Roles, rhythms and reporting that let a growing team run without the founder in every decision.'),
          card('TrendingUp', 'Growth planning', 'Pricing, positioning and pipeline work grounded in your real numbers rather than benchmarks.'),
        ]),
      ]),
    ]),
    n('testimonials', {
      title: 'Clients on working with us',
      columns: 3,
      showRating: true,
      items: [
        { id: itemId(), quote: 'Six weeks in we had a plan the whole leadership team believed in. That had not happened in three years of trying.', name: 'Rachel Adeyemi', role: 'CEO, Verity Logistics', rating: 5, avatar: '' },
        { id: itemId(), quote: 'Direct, well prepared and genuinely useful. No forty-slide decks restating what we already knew.', name: 'Tom Brennan', role: 'Founder, Brennan Fabrication', rating: 5, avatar: '' },
        { id: itemId(), quote: 'They fixed our reporting in a fortnight. We finally trust the numbers we look at each Monday.', name: 'Priya Raman', role: 'COO, Kestrel Health', rating: 5, avatar: '' },
      ],
    }, { desktop: { backgroundColor: '#f4f2ff' } }),
    n('faq', {
      title: 'Questions we are asked most',
      items: [
        { id: itemId(), question: 'How long does a typical engagement run?', answer: 'Most begin with a four to six week review, followed by an optional support period while the plan is put in place.' },
        { id: itemId(), question: 'Do you work with smaller companies?', answer: 'Yes. Roughly half our work is with teams of ten to fifty people, where a small change in focus makes an outsized difference.' },
        { id: itemId(), question: 'How is the work priced?', answer: 'Fixed fee, agreed in writing before anything starts. No hourly billing and no change requests for questions.' },
      ],
    }),
    n('cta', {}, {}, [
      n('container', {}, { desktop: { alignItems: 'center', gap: 20, textAlign: 'center', maxWidth: 720 } }, [
        n('heading', { text: 'Start with a conversation', level: 'h2' }, {
          desktop: { color: '#fff', textAlign: 'center', fontSize: 40 }, mobile: { fontSize: 28 },
        }),
        n('text', { text: 'Thirty minutes, no pitch. We will tell you honestly whether we can help.' }, {
          desktop: { color: 'rgba(255,255,255,0.86)', textAlign: 'center', fontSize: 18 },
        }),
        n('button', { label: 'Book an intro call', variant: 'secondary', size: 'lg', link: pageLink('Contact') }),
      ]),
    ]),
    footer({
      brand: BRAND,
      tagline: 'Strategy and operations consultancy for companies in their next chapter.',
      email: 'hello@northgatepartners.com',
      phone: '+44 20 7946 0122',
      address: '18 Cornhill<br>London EC3V 3ND',
    }),
  ];
}

function services() {
  return [
    navbar({ brand: BRAND, ctaLabel: 'Book a call', ctaPage: 'Contact' }),
    n('section', {}, { desktop: { paddingTop: 80, paddingBottom: 40, backgroundColor: '#f4f2ff' } }, [
      n('container', {}, { desktop: { gap: 16, maxWidth: 780 } }, [
        n('heading', { text: 'Services', level: 'h1' }, { desktop: { fontSize: 52 }, mobile: { fontSize: 34 } }),
        n('text', { text: 'Three ways we work with leadership teams. Every engagement is scoped and priced before it begins.' }, {
          desktop: { fontSize: 19 },
        }),
      ]),
    ]),
    n('services', {}, { desktop: { backgroundColor: '#ffffff', paddingTop: 72 } }, [
      n('container', {}, { desktop: { gap: 44 } }, [
        n('grid', { columns: 3 }, {}, [
          serviceCard('Strategy review', 'A six-week diagnostic covering revenue, cost, capacity and competitive position, ending in a plan with owners and dates.', PRIMARY, SECONDARY),
          serviceCard('Operating model design', 'Rebuild how the company runs: decision rights, meeting rhythm, reporting and the handful of metrics that matter.', '#2f7df6', '#59a6ff'),
          serviceCard('Growth sprint', 'Focused work on pricing, packaging and pipeline, tested against your own data before anything is rolled out.', '#12a17a', '#4fd3a8'),
        ]),
      ]),
    ]),
    n('pricing', {
      title: 'Engagement options',
      subtitle: 'Fixed fees agreed up front. No hourly billing.',
      currency: '£',
      period: '',
      plans: [
        { id: itemId(), name: 'Diagnostic', price: '6,500', description: 'Two weeks, one clear read-out.', features: 'Leadership interviews\nData review\nFindings session\nPriority shortlist', ctaLabel: 'Enquire', ctaLink: pageLink('Contact'), featured: false },
        { id: itemId(), name: 'Full review', price: '18,000', description: 'Our most common engagement.', features: 'Everything in Diagnostic\nSix-week programme\nOperating plan\nBoard-ready pack\nThirty days of follow-up', ctaLabel: 'Enquire', ctaLink: pageLink('Contact'), featured: true },
        { id: itemId(), name: 'Embedded support', price: '4,800', description: 'Per month, minimum three months.', features: 'Two days a month on site\nStanding leadership session\nQuarterly reset\nDirect partner access', ctaLabel: 'Enquire', ctaLink: pageLink('Contact'), featured: false },
      ],
    }),
    footer({
      brand: BRAND,
      tagline: 'Strategy and operations consultancy for companies in their next chapter.',
      email: 'hello@northgatepartners.com',
      phone: '+44 20 7946 0122',
      address: '18 Cornhill<br>London EC3V 3ND',
    }),
  ];
}

function about() {
  return [
    navbar({ brand: BRAND, ctaLabel: 'Book a call', ctaPage: 'Contact' }),
    n('section', {}, { desktop: { paddingTop: 80, paddingBottom: 72 } }, [
      n('container', {}, {}, [
        n('columns', { count: 2, ratio: '2:1' }, { desktop: { gap: 56, alignItems: 'center' } }, [
          n('column', {}, { desktop: { gap: 20 } }, [
            n('heading', { text: 'Small firm. Senior people. Straight answers.', level: 'h1' }, {
              desktop: { fontSize: 46 }, mobile: { fontSize: 31 },
            }),
            n('text', { text: 'Northgate was founded in 2014 by three operators who had spent their careers inside growing companies rather than advising from outside them. That is still how we staff every engagement: the people you meet are the people who do the work.' }, { desktop: { fontSize: 18 } }),
            n('text', { text: 'We take on a small number of clients at a time. It keeps the quality high and means we can say no to work we are not right for.' }, { desktop: { fontSize: 18 } }),
          ]),
          n('column', {}, {}, [
            n('image', { src: tileArt({ from: PRIMARY, to: SECONDARY }), alt: 'Our studio' }, { desktop: { height: 420, borderRadius: 22 } }),
          ]),
        ]),
      ]),
    ]),
    n('features', {}, { desktop: { backgroundColor: '#f4f2ff' } }, [
      n('container', {}, { desktop: { gap: 44 } }, [
        n('heading', { text: 'How we work', level: 'h2' }, { desktop: { textAlign: 'center', fontSize: 36 } }),
        n('grid', { columns: 3 }, {}, [
          card('Eye', 'We look before we advise', 'Every engagement starts with your numbers and your people, not a framework from a previous client.'),
          card('Handshake', 'We commit to a fee', 'Agreed in writing before work begins. If the scope changes, we say so rather than invoice for it.'),
          card('Target', 'We leave something usable', 'A plan with owners and dates that survives contact with a normal working week.'),
        ]),
      ]),
    ]),
    footer({
      brand: BRAND,
      tagline: 'Strategy and operations consultancy for companies in their next chapter.',
      email: 'hello@northgatepartners.com',
      phone: '+44 20 7946 0122',
      address: '18 Cornhill<br>London EC3V 3ND',
    }),
  ];
}

function stat(value: string, label: string) {
  return n('container', {}, { desktop: { gap: 2, width: 'auto', maxWidth: 'none', marginLeft: 0, marginRight: 0 } }, [
    n('heading', { text: value, level: 'h3' }, { desktop: { fontSize: 28, color: PRIMARY } }),
    n('text', { text: label }, { desktop: { fontSize: 14 } }),
  ]);
}

function card(icon: string, title: string, body: string) {
  return n('card', {}, { desktop: { gap: 14 } }, [
    n('icon', { name: icon, size: 26 }),
    n('heading', { text: title, level: 'h3' }, { desktop: { fontSize: 21 } }),
    n('text', { text: body }, { desktop: { fontSize: 16 } }),
  ]);
}

function serviceCard(title: string, body: string, from: string, to: string) {
  return n('card', {}, {
    desktop: { paddingTop: 0, paddingLeft: 0, paddingRight: 0, paddingBottom: 26, overflow: 'hidden', gap: 16 },
  }, [
    n('image', { src: tileArt({ from, to }), alt: title }, { desktop: { height: 180, borderRadius: 0 } }),
    n('heading', { text: title, level: 'h3' }, { desktop: { fontSize: 22, paddingLeft: 26, paddingRight: 26 } }),
    n('text', { text: body }, { desktop: { fontSize: 16, paddingLeft: 26, paddingRight: 26 } }),
  ]);
}
