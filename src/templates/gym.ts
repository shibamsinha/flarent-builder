import { n } from '@/engine/registry/build';
import { itemId } from '@/engine/registry/components/shared';
import type { BrandProfile, ProfileInput, TemplateDefaults } from '@/onboarding/profile';
import { resolveProfile } from '@/onboarding/profile';
import { assembleForProfile, contactPage, footer, navbar, pageLink } from './kit';
import { bandArt, blobArt, tileArt } from './imagery';
import type { TemplateDefinition } from './types';

const PRIMARY = '#c8ff4d';
const INK = '#0d0f12';
const SURFACE = '#15181d';

const DEFAULTS: TemplateDefaults = {
  tagline: 'Coached strength and conditioning. No mirrors, no nonsense.',
  description:
    'Coached small-group training for people who want to lift properly, move well and still be doing it in twenty years.',
  email: 'train@example.com',
  phone: '+44 113 496 0180',
  whatsapp: '+441134960180',
  street: 'Unit 7, Dockside Works',
  city: 'Leeds LS10 1AA',
  hours: 'Mon-Fri 05:30-21:30\nSat-Sun 07:00-16:00',
  offerings: [
    { title: 'Strength', body: 'Barbell-led sessions built around the big lifts, coached in groups of twelve or fewer.' },
    { title: 'Conditioning', body: 'Thirty-five minutes of hard, well-programmed work. In, out, done properly.' },
    { title: 'One to one', body: 'Private coaching for a specific goal, an injury to work around, or a competition date.' },
  ],
};

export const gymTemplate: TemplateDefinition = {
  id: 'gym-fitness',
  name: 'Gym & Fitness',
  description: 'High-contrast dark site with classes, memberships and a strong join flow.',
  tag: 'Health & fitness',
  accent: [PRIMARY, '#7fd400'],
  defaults: DEFAULTS,
  build: (input: ProfileInput) => {
    const p = resolveProfile(input, DEFAULTS);
    return assembleForProfile(
      {
        templateId: 'gym-fitness',
        siteName: p.businessName,
        description: p.tagline,
        theme: {
          colors: {
            primary: PRIMARY,
            secondary: '#ffffff',
            accent: '#ff5c39',
            background: INK,
            surface: SURFACE,
            text: '#f4f6f8',
            muted: '#9aa3ad',
            border: '#242a31',
          },
          typography: { headingFont: 'Space Grotesk, sans-serif', bodyFont: 'Inter, sans-serif', baseSize: 16, scale: 1.28 },
          radius: { sm: 6, md: 10, lg: 14, pill: 999 },
          containerWidth: 1180,
        },
        pages: [
          { name: 'Home', nodes: home(p) },
          { name: 'Classes', nodes: classes(p) },
          { name: 'Membership', nodes: membership(p) },
          {
            name: 'Contact',
            nodes: contactPage({
              profile: p,
              intro: 'Want to try a session before you commit? Tell us when you can make it.',
              surface: SURFACE,
            }),
          },
        ],
      },
      p,
    );
  },
};

const footerNode = (p: BrandProfile) => footer({ profile: p, background: '#05070a' });

function home(p: BrandProfile) {
  return [
    navbar({ brand: p.businessName, ctaLabel: 'Join now', ctaPage: 'Membership', background: INK, text: '#f4f6f8' }),
    n('hero', {}, {
      desktop: {
        paddingTop: 140,
        paddingBottom: 140,
        backgroundColor: INK,
        backgroundImage: `linear-gradient(rgba(13,15,18,.78), rgba(13,15,18,.9)), url("${blobArt({ from: '#2b3138', to: '#0d0f12', tint: PRIMARY })}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      },
      mobile: { paddingTop: 92, paddingBottom: 92 },
    }, [
      n('container', {}, { desktop: { gap: 24, maxWidth: 900 } }, [
        n('text', { text: `${p.city} · ${p.street}` }, {
          desktop: { color: PRIMARY, letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: 13, fontWeight: 600 },
        }),
        n('heading', { text: 'Get strong. Stay strong.', level: 'h1' }, {
          desktop: { fontSize: 78, lineHeight: 1, letterSpacing: '-0.03em', textTransform: 'uppercase', color: '#fff' },
          tablet: { fontSize: 58 },
          mobile: { fontSize: 40 },
        }),
        n('text', { text: p.description }, {
          desktop: { fontSize: 20, maxWidth: 580, color: '#c3cbd4' },
        }),
        n('flex', {}, { desktop: { gap: 12, width: 'auto', marginTop: 8 }, mobile: { flexDirection: 'column' } }, [
          n('button', { label: 'Book a free session', size: 'lg', link: pageLink('Contact') }),
          n('button', { label: 'See the timetable', variant: 'outline', size: 'lg', link: pageLink('Classes') }, {
            desktop: { color: '#fff', borderColor: '#39414a' },
          }),
        ]),
      ]),
    ]),
    n('section', {}, { desktop: { paddingTop: 0, paddingBottom: 0, backgroundColor: PRIMARY } }, [
      n('container', {}, { desktop: { paddingTop: 28, paddingBottom: 28 } }, [
        n('flex', {}, { desktop: { justifyContent: 'space-between', gap: 24 }, mobile: { flexDirection: 'column', gap: 14 } }, [
          ticker('7 days a week'),
          ticker('Max 12 per class'),
          ticker('No joining fee'),
          ticker('Cancel anytime'),
        ]),
      ]),
    ]),
    n('features', {}, { desktop: { backgroundColor: INK, paddingTop: 96 } }, [
      n('container', {}, { desktop: { gap: 48 } }, [
        n('heading', { text: 'Three ways to train', level: 'h2' }, {
          desktop: { fontSize: 44, textTransform: 'uppercase', color: '#fff', textAlign: 'center' },
          mobile: { fontSize: 30 },
        }),
        n('grid', { columns: 3 }, {}, [
          trainCard('Dumbbell', p.offerings[0].title, p.offerings[0].body),
          trainCard('HeartPulse', p.offerings[1].title, p.offerings[1].body),
          trainCard('UserCheck', p.offerings[2].title, p.offerings[2].body),
        ]),
      ]),
    ]),
    n('gallery', {
      title: 'Inside the gym',
      columns: 4,
      gap: 10,
      ratio: '1 / 1',
      items: [
        { id: itemId(), src: tileArt({ from: '#1c2128', to: '#0d0f12', tint: PRIMARY }), alt: 'Rig' },
        { id: itemId(), src: bandArt({ from: '#242a31', to: '#0d0f12', tint: PRIMARY, width: 800, height: 800 }), alt: 'Platform' },
        { id: itemId(), src: tileArt({ from: '#0d0f12', to: '#2b3138', tint: PRIMARY }), alt: 'Conditioning floor' },
        { id: itemId(), src: blobArt({ from: '#1c2128', to: '#0d0f12', tint: PRIMARY, width: 800, height: 800 }), alt: 'Dumbbells' },
      ],
    }, { desktop: { backgroundColor: SURFACE } }),
    n('testimonials', {
      title: 'Members',
      columns: 3,
      items: [
        { id: itemId(), quote: 'First gym where someone actually watched my technique. Deadlift went up 40kg in a year and my back stopped hurting.', name: 'Callum Reid', role: 'Member, 3 years', rating: 5, avatar: '' },
        { id: itemId(), quote: 'Small classes, real coaching, zero attitude. I dreaded gyms before this one.', name: 'Ama Boateng', role: 'Member, 18 months', rating: 5, avatar: '' },
        { id: itemId(), quote: 'The 6am crowd is what keeps me turning up. Proper community.', name: 'Steve Marlow', role: 'Member, 5 years', rating: 5, avatar: '' },
      ],
    }, { desktop: { backgroundColor: INK } }),
    n('cta', {}, { desktop: { backgroundColor: PRIMARY } }, [
      n('container', {}, { desktop: { alignItems: 'center', gap: 18, textAlign: 'center', maxWidth: 720 } }, [
        n('heading', { text: 'First session is free', level: 'h2' }, {
          desktop: { color: INK, textAlign: 'center', fontSize: 46, textTransform: 'uppercase' },
          mobile: { fontSize: 30 },
        }),
        n('text', { text: 'Come in, train with a coach, see if it suits you. No card, no contract, no sales pitch.' }, {
          desktop: { color: 'rgba(13,15,18,0.75)', textAlign: 'center', fontSize: 18 },
        }),
        n('button', { label: 'Claim your session', size: 'lg', link: pageLink('Contact') }, {
          desktop: { backgroundColor: INK, color: PRIMARY },
        }),
      ]),
    ]),
    footerNode(p),
  ];
}

function ticker(text: string) {
  return n('text', { text }, {
    desktop: { color: INK, fontWeight: 700, fontSize: 16, letterSpacing: '0.08em', textTransform: 'uppercase' },
  });
}

function trainCard(icon: string, title: string, body: string) {
  return n('card', {}, {
    desktop: { backgroundColor: SURFACE, borderColor: '#242a31', gap: 14, paddingTop: 32, paddingBottom: 32 },
  }, [
    n('icon', { name: icon, size: 30, color: PRIMARY }),
    n('heading', { text: title, level: 'h3' }, {
      desktop: { fontSize: 24, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.02em' },
    }),
    n('text', { text: body }, { desktop: { fontSize: 16, color: '#9aa3ad' } }),
  ]);
}

function classes(p: BrandProfile) {
  const slot = (time: string, name: string, coach: string) =>
    n('flex', {}, {
      desktop: { justifyContent: 'space-between', alignItems: 'center', gap: 16, paddingTop: 14, paddingBottom: 14, borderColor: '#242a31' },
    }, [
      n('text', { text: time }, { desktop: { fontWeight: 700, color: PRIMARY, fontSize: 16, width: 110 } }),
      n('text', { text: name }, { desktop: { color: '#fff', fontSize: 17, flexGrow: 1 } }),
      n('text', { text: coach }, { desktop: { fontSize: 14 } }),
    ]);

  const day = (name: string, slots: [string, string, string][]) =>
    n('card', {}, { desktop: { backgroundColor: SURFACE, borderColor: '#242a31', gap: 4 } }, [
      n('heading', { text: name, level: 'h3' }, {
        desktop: { fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#9aa3ad', marginBottom: 8 },
      }),
      ...slots.map(([time, title, coach]) => slot(time, title, coach)),
    ]);

  return [
    navbar({ brand: p.businessName, ctaLabel: 'Join now', ctaPage: 'Membership', background: INK, text: '#f4f6f8' }),
    n('section', {}, { desktop: { paddingTop: 80, paddingBottom: 40, backgroundColor: SURFACE } }, [
      n('container', {}, { desktop: { gap: 14, maxWidth: 780 } }, [
        n('heading', { text: 'Timetable', level: 'h1' }, {
          desktop: { fontSize: 58, textTransform: 'uppercase', color: '#fff' }, mobile: { fontSize: 36 },
        }),
        n('text', { text: 'Every class is coached and capped at twelve. Book through the app or just turn up, we will always find you a rack.' }, {
          desktop: { fontSize: 18 },
        }),
      ]),
    ]),
    n('section', {}, { desktop: { paddingTop: 56, paddingBottom: 88 } }, [
      n('container', {}, { desktop: { gap: 20 } }, [
        n('grid', { columns: 2 }, { desktop: { gap: 20 } }, [
          day('Monday / Wednesday / Friday', [
            ['05:30', 'Strength: lower', 'Priya'],
            ['07:00', 'Conditioning 35', 'Dan'],
            ['12:15', 'Lunch lift', 'Priya'],
            ['18:00', 'Strength: upper', 'Marcus'],
            ['19:15', 'Conditioning 35', 'Dan'],
          ]),
          day('Tuesday / Thursday', [
            ['06:00', 'Full body', 'Marcus'],
            ['09:30', 'Beginners strength', 'Amara'],
            ['17:30', 'Olympic lifting', 'Marcus'],
            ['18:45', 'Engine room', 'Dan'],
          ]),
          day('Saturday', [
            ['08:00', 'Team session', 'Everyone'],
            ['09:30', 'Beginners strength', 'Amara'],
            ['11:00', 'Open gym', 'Coached floor'],
          ]),
          day('Sunday', [
            ['09:00', 'Mobility & recovery', 'Amara'],
            ['10:30', 'Open gym', 'Coached floor'],
          ]),
        ]),
      ]),
    ]),
    footerNode(p),
  ];
}

function membership(p: BrandProfile) {
  return [
    navbar({ brand: p.businessName, ctaLabel: 'Join now', ctaPage: 'Membership', background: INK, text: '#f4f6f8' }),
    n('pricing', {
      title: 'Membership',
      subtitle: 'No joining fee. Cancel with thirty days’ notice, any time.',
      currency: '£',
      period: '/month',
      plans: [
        { id: itemId(), name: 'Off-peak', price: '39', description: 'Weekdays before 16:00.', features: 'All off-peak classes\nOpen gym access\nProgramme review each quarter', ctaLabel: 'Choose off-peak', ctaLink: pageLink('Contact'), featured: false },
        { id: itemId(), name: 'Full', price: '59', description: 'Everything, any time.', features: 'All classes, all week\nOpen gym access\nMonthly programme review\nBring a guest each month\nNutrition guidance', ctaLabel: 'Choose full', ctaLink: pageLink('Contact'), featured: true },
        { id: itemId(), name: 'Coached', price: '160', description: 'One to one, four sessions.', features: 'Four private sessions\nFull membership included\nIndividual programme\nDirect coach contact', ctaLabel: 'Choose coached', ctaLink: pageLink('Contact'), featured: false },
      ],
    }, { desktop: { backgroundColor: SURFACE, paddingTop: 96 } }),
    n('faq', {
      title: 'Before you join',
      items: [
        { id: itemId(), question: 'I have never lifted before. Is that a problem?', answer: 'No. Beginners strength runs three times a week and every new member gets a technique session before joining the main timetable.' },
        { id: itemId(), question: 'Is there a contract?', answer: 'A rolling monthly membership with thirty days’ notice. No joining fee and no minimum term.' },
        { id: itemId(), question: 'Can I freeze my membership?', answer: 'Yes, up to two months a year for travel, injury or work. Just let us know.' },
        { id: itemId(), question: 'Is there parking?', answer: 'Free on-site parking for members, plus secure bike storage inside the unit.' },
      ],
    }, { desktop: { backgroundColor: INK } }),
    footerNode(p),
  ];
}
