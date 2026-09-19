import { n } from '@/engine/registry/build';
import { itemId } from '@/engine/registry/components/shared';
import { assembleProject, contactPage, footer, navbar, pageLink, urlLink } from './kit';
import { blobArt, tileArt } from './imagery';
import type { TemplateDefinition } from './types';

const BRAND = 'Cadence';
const PRIMARY = '#7217b2';
const SECONDARY = '#ac13eb';

export const saasTemplate: TemplateDefinition = {
  id: 'saas-startup',
  name: 'SaaS / Startup',
  description: 'Product marketing site with feature grid, pricing tiers and clear signup.',
  tag: 'Software',
  accent: [PRIMARY, SECONDARY],
  build: (projectName) =>
    assembleProject(
      {
        templateId: 'saas-startup',
        siteName: BRAND,
        description: 'Scheduling and capacity planning for service teams.',
        theme: {
          colors: {
            primary: PRIMARY,
            secondary: SECONDARY,
            accent: '#16c79a',
            background: '#ffffff',
            surface: '#f8f4fd',
            text: '#16101f',
            muted: '#655d73',
            border: '#eae3f4',
          },
          typography: { headingFont: 'Outfit, sans-serif', bodyFont: 'Inter, sans-serif', baseSize: 16, scale: 1.26 },
          radius: { sm: 8, md: 14, lg: 20, pill: 999 },
          containerWidth: 1140,
        },
        pages: [
          { name: 'Home', nodes: home() },
          { name: 'Features', nodes: features() },
          { name: 'Pricing', nodes: pricing() },
          {
            name: 'Contact',
            nodes: contactPage({
              brand: BRAND,
              intro: 'Questions about a rollout, security review or migration? Talk to a human.',
              address: '2nd Floor, 60 Grainger Street, Newcastle',
              phone: '+44 191 406 7720',
              email: 'hello@cadence.app',
              whatsapp: '+441914067720',
              surface: '#f8f4fd',
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
    tagline: 'Scheduling and capacity planning for service teams that run on people, not tickets.',
    email: 'hello@cadence.app',
    phone: '+44 191 406 7720',
    address: '60 Grainger Street<br>Newcastle NE1 5JG',
    hoursNote: 'Support Mon–Fri 08:00–19:00<br>Status page updated live',
    background: '#16101f',
  });

function home() {
  return [
    navbar({ brand: BRAND, ctaLabel: 'Start free trial', ctaPage: 'Pricing' }),
    n('hero', {}, {
      desktop: {
        paddingTop: 108,
        paddingBottom: 96,
        backgroundColor: '#f8f4fd',
        backgroundImage: `radial-gradient(900px 420px at 50% -8%, rgba(172,19,235,.22), transparent 70%)`,
      },
    }, [
      n('container', {}, { desktop: { alignItems: 'center', textAlign: 'center', gap: 26, maxWidth: 880 } }, [
        n('text', { text: 'New — capacity forecasting is live' }, {
          desktop: {
            color: PRIMARY, fontSize: 13, fontWeight: 600, backgroundColor: '#ffffff',
            paddingTop: 7, paddingBottom: 7, paddingLeft: 16, paddingRight: 16,
            borderRadius: 'var(--fl-radius-pill)', borderWidth: 1, borderStyle: 'solid',
            borderColor: 'var(--fl-color-border)', textAlign: 'center',
          },
        }),
        n('heading', { text: 'Know who is free, before you promise a date', level: 'h1' }, {
          desktop: { fontSize: 64, textAlign: 'center', lineHeight: 1.05 },
          tablet: { fontSize: 48 },
          mobile: { fontSize: 34 },
        }),
        n('text', { text: 'Cadence turns your team’s real availability into a plan you can commit to — so projects stop slipping and nobody ends up with three deadlines on the same Friday.' }, {
          desktop: { fontSize: 20, textAlign: 'center', maxWidth: 660 },
        }),
        n('flex', {}, { desktop: { gap: 12, justifyContent: 'center', width: 'auto' }, mobile: { flexDirection: 'column' } }, [
          n('button', { label: 'Start 14-day trial', size: 'lg', link: pageLink('Pricing') }),
          n('button', { label: 'Book a walkthrough', variant: 'outline', size: 'lg', link: pageLink('Contact') }),
        ]),
        n('text', { text: 'No card required · Set up in an afternoon · Cancel any time' }, {
          desktop: { fontSize: 14, textAlign: 'center' },
        }),
        n('image', { src: tileArt({ from: PRIMARY, to: SECONDARY, width: 1400, height: 800 }), alt: 'Cadence dashboard' }, {
          desktop: { height: 480, borderRadius: 20, marginTop: 20, boxShadow: '0 40px 80px -40px rgba(114,23,178,.55)' },
          mobile: { height: 220 },
        }),
      ]),
    ]),
    n('section', {}, { desktop: { paddingTop: 56, paddingBottom: 56 } }, [
      n('container', {}, { desktop: { gap: 22, alignItems: 'center' } }, [
        n('text', { text: 'Used by service teams at' }, {
          desktop: { fontSize: 13, letterSpacing: '0.16em', textTransform: 'uppercase', textAlign: 'center' },
        }),
        n('flex', {}, { desktop: { gap: 48, justifyContent: 'center', flexWrap: 'wrap' }, mobile: { flexDirection: 'row', gap: 24 } }, [
          logo('Halden'), logo('Pinewell'), logo('Orbit Care'), logo('Redgate Legal'), logo('Vantage'),
        ]),
      ]),
    ]),
    n('features', {}, { desktop: { backgroundColor: '#f8f4fd' } }, [
      n('container', {}, { desktop: { gap: 48 } }, [
        n('container', {}, { desktop: { gap: 14, alignItems: 'center', textAlign: 'center', maxWidth: 680, paddingLeft: 0, paddingRight: 0 } }, [
          n('heading', { text: 'Built for the way service work actually runs', level: 'h2' }, {
            desktop: { textAlign: 'center', fontSize: 40 }, mobile: { fontSize: 28 },
          }),
          n('text', { text: 'Not another ticket queue. Cadence models people, hours and commitments — the three things that decide whether a date is real.' }, {
            desktop: { textAlign: 'center' },
          }),
        ]),
        n('grid', { columns: 3 }, {}, [
          feature('Calendar', 'Live capacity', 'Every booking, holiday and recurring commitment in one view, updated as soon as anything moves.'),
          feature('ChartBar', 'Forecasting', 'See the next twelve weeks before you say yes. Cadence flags the week that breaks first.'),
          feature('Users', 'Skills matching', 'Assign by who can actually do the work, not just who has a gap in the calendar.'),
          feature('Zap', 'Two-way sync', 'Google and Outlook calendars sync both ways, so nobody has to update two systems.'),
          feature('ShieldCheck', 'Audit trail', 'Every change to a plan is recorded with who made it and why. Useful when a client asks.'),
          feature('Send', 'Client updates', 'Share a read-only plan link. Clients see progress without another status meeting.'),
        ]),
      ]),
    ]),
    n('testimonials', {
      title: 'Teams that stopped guessing',
      columns: 3,
      items: [
        { id: itemId(), quote: 'We cut slipped deadlines by two thirds in a quarter. The forecast view is the thing — we can see the crunch four weeks out.', name: 'Laura Finn', role: 'Ops Director, Halden', rating: 5, avatar: '' },
        { id: itemId(), quote: 'Set-up took one afternoon including the calendar sync. Our old tool took six weeks and never worked properly.', name: 'Idris Khan', role: 'Head of Delivery, Pinewell', rating: 5, avatar: '' },
        { id: itemId(), quote: 'The first tool the team actually opens on a Monday. That alone tells you something.', name: 'Grace Oyelaran', role: 'Studio Manager, Vantage', rating: 5, avatar: '' },
      ],
    }),
    n('cta', {}, {
      desktop: { backgroundImage: `linear-gradient(120deg, ${PRIMARY}, ${SECONDARY})`, backgroundColor: PRIMARY },
    }, [
      n('container', {}, { desktop: { alignItems: 'center', gap: 20, textAlign: 'center', maxWidth: 720 } }, [
        n('heading', { text: 'Try it on next week’s plan', level: 'h2' }, {
          desktop: { color: '#fff', textAlign: 'center', fontSize: 42 }, mobile: { fontSize: 29 },
        }),
        n('text', { text: 'Fourteen days, your real data, no card. If it does not change a decision in the first week, walk away.' }, {
          desktop: { color: 'rgba(255,255,255,0.86)', textAlign: 'center', fontSize: 18 },
        }),
        n('button', { label: 'Start free trial', variant: 'secondary', size: 'lg', link: pageLink('Pricing') }),
      ]),
    ]),
    footerNode(),
  ];
}

function logo(name: string) {
  return n('text', { text: name }, {
    desktop: { fontSize: 19, fontWeight: 700, color: '#b3a9c2', fontFamily: 'var(--fl-font-heading)' },
  });
}

function feature(icon: string, title: string, body: string) {
  return n('card', {}, { desktop: { gap: 12 } }, [
    n('icon', { name: icon, size: 24 }),
    n('heading', { text: title, level: 'h3' }, { desktop: { fontSize: 20 } }),
    n('text', { text: body }, { desktop: { fontSize: 15 } }),
  ]);
}

function features() {
  const row = (title: string, body: string, points: string[], art: string, reverse: boolean) => {
    const copy = n('column', {}, { desktop: { gap: 16 } }, [
      n('heading', { text: title, level: 'h2' }, { desktop: { fontSize: 36 }, mobile: { fontSize: 26 } }),
      n('text', { text: body }, { desktop: { fontSize: 18 } }),
      n('container', {}, { desktop: { gap: 10, maxWidth: 'none', marginLeft: 0, paddingLeft: 0, paddingRight: 0 } },
        points.map((point) =>
          n('flex', {}, { desktop: { gap: 10, alignItems: 'start' }, mobile: { flexDirection: 'row' } }, [
            n('icon', { name: 'CircleCheck', size: 20, color: 'var(--fl-color-accent)' }),
            n('text', { text: point }, { desktop: { fontSize: 16 } }),
          ]),
        ),
      ),
    ]);
    const image = n('column', {}, {}, [
      n('image', { src: art, alt: title }, { desktop: { height: 380, borderRadius: 18 } }),
    ]);
    return n('section', {}, { desktop: { paddingTop: 56, paddingBottom: 56 } }, [
      n('container', {}, {}, [
        n('columns', { count: 2 }, { desktop: { gap: 56, alignItems: 'center' } }, reverse ? [image, copy] : [copy, image]),
      ]),
    ]);
  };

  return [
    navbar({ brand: BRAND, ctaLabel: 'Start free trial', ctaPage: 'Pricing' }),
    n('section', {}, { desktop: { paddingTop: 80, paddingBottom: 32, backgroundColor: '#f8f4fd' } }, [
      n('container', {}, { desktop: { gap: 16, alignItems: 'center', textAlign: 'center', maxWidth: 740 } }, [
        n('heading', { text: 'Everything Cadence does', level: 'h1' }, {
          desktop: { fontSize: 54, textAlign: 'center' }, mobile: { fontSize: 34 },
        }),
        n('text', { text: 'Four capabilities, each built because a customer could not run their week without it.' }, {
          desktop: { fontSize: 18, textAlign: 'center' },
        }),
      ]),
    ]),
    row('Live capacity', 'One view of who is available, when, and for how long — across every team and location.', ['Holidays, part-time patterns and recurring commitments included', 'Filter by skill, team, location or client', 'Updates the moment anything changes'], tileArt({ from: PRIMARY, to: SECONDARY, width: 1100, height: 760 }), false),
    row('Twelve-week forecast', 'Look forward far enough to do something about it. Cadence highlights the first week that breaks.', ['Scenario planning for work you have not won yet', 'Flags over-allocation before it reaches a person', 'Export to CSV for finance'], blobArt({ from: '#16c79a', to: PRIMARY, width: 1100, height: 760 }), true),
    row('Two-way calendar sync', 'Google Workspace and Microsoft 365, synced both ways, so nobody maintains two calendars.', ['Set up per team in minutes', 'Respects private event visibility', 'Conflicts surfaced, never silently overwritten'], tileArt({ from: SECONDARY, to: '#16c79a', width: 1100, height: 760 }), false),
    row('Shared client plans', 'A read-only link clients can check themselves, instead of another status call.', ['Shows milestones, not internal detail', 'Revoke access at any time', 'Branded with your own logo and colours'], blobArt({ from: PRIMARY, to: '#16101f', width: 1100, height: 760 }), true),
    footerNode(),
  ];
}

function pricing() {
  return [
    navbar({ brand: BRAND, ctaLabel: 'Start free trial', ctaPage: 'Pricing' }),
    n('pricing', {
      title: 'Pricing that scales with the team',
      subtitle: 'Billed per active person, per month. Fourteen-day trial on every plan.',
      currency: '£',
      period: '/user/mo',
      plans: [
        { id: itemId(), name: 'Team', price: '12', description: 'For a single team finding its rhythm.', features: 'Up to 15 people\nLive capacity view\nCalendar sync\nEmail support', ctaLabel: 'Start free trial', ctaLink: urlLink('https://example.com/signup'), featured: false },
        { id: itemId(), name: 'Business', price: '22', description: 'For several teams that share people.', features: 'Unlimited people\nTwelve-week forecasting\nSkills matching\nShared client plans\nPriority support', ctaLabel: 'Start free trial', ctaLink: urlLink('https://example.com/signup'), featured: true },
        { id: itemId(), name: 'Enterprise', price: 'Talk to us', description: 'Security review, SSO and onboarding.', features: 'Everything in Business\nSAML single sign-on\nAudit export\nDedicated onboarding\n99.9% uptime SLA', ctaLabel: 'Contact sales', ctaLink: pageLink('Contact'), featured: false },
      ],
    }, { desktop: { paddingTop: 96, backgroundColor: '#ffffff' } }),
    n('faq', {
      title: 'Pricing questions',
      items: [
        { id: itemId(), question: 'What counts as an active person?', answer: 'Anyone who is scheduled in the month. Contractors on a single project are only billed for the months they appear in a plan.' },
        { id: itemId(), question: 'Can we change plan later?', answer: 'Yes, in either direction, and billing is prorated to the day.' },
        { id: itemId(), question: 'Do you offer annual billing?', answer: 'Annual billing saves two months and is available on Business and Enterprise.' },
        { id: itemId(), question: 'What happens after the trial?', answer: 'Nothing automatic. The account pauses until you choose a plan, and your data stays available for ninety days.' },
      ],
    }, { desktop: { backgroundColor: '#f8f4fd' } }),
    footerNode(),
  ];
}
