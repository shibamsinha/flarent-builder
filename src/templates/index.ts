import type { Project } from '@/types/project';
import type { ProfileInput, TemplateDefaults } from '@/onboarding/profile';
import { resolveProfile } from '@/onboarding/profile';
import { createEmptyProject } from '@/engine/schema/defaults';
import { n } from '@/engine/registry/build';
import { footer, navbar } from './kit';
import type { TemplateDefinition } from './types';
import { modernBusinessTemplate } from './modernBusiness';
import { restaurantTemplate } from './restaurant';
import { gymTemplate } from './gym';
import { interiorTemplate } from './interior';
import { saasTemplate } from './saas';

const BLANK_DEFAULTS: TemplateDefaults = {
  tagline: 'A short line about what you do.',
  description: 'Drag components from the left panel to start building your page.',
  email: 'hello@example.com',
  phone: '',
  whatsapp: '',
  street: '',
  city: '',
  hours: 'Mon-Fri 9:00-17:00',
  offerings: [
    { title: 'What you offer', body: 'Describe the first thing you want people to know about.' },
    { title: 'Second thing', body: 'Another reason a customer should choose you.' },
    { title: 'Third thing', body: 'One more, then stop. Three is usually enough.' },
  ],
};

/** A deliberately minimal starting point for people who want to build their own. */
export const blankTemplate: TemplateDefinition = {
  id: 'blank',
  name: 'Blank',
  description: 'An empty page with a navbar and footer, ready for your own layout.',
  tag: 'Start from scratch',
  accent: ['#7217b2', '#ac13eb'],
  defaults: BLANK_DEFAULTS,
  build: (input: ProfileInput) => {
    const p = resolveProfile(input, BLANK_DEFAULTS);
    const project: Project = createEmptyProject(p.businessName);
    project.templateId = 'blank';
    project.settings.description = p.tagline;
    if (p.primaryColor) project.theme.colors.primary = p.primaryColor;

    const home = project.pages[0];
    // Even the blank start uses the real details: the stock Footer component
    // ships generic placeholder copy, which is exactly what onboarding exists
    // to avoid.
    home.nodes = [
      navbar({ brand: p.businessName, sticky: false }),
      n('section', {}, {}, [
        n('container', {}, { desktop: { alignItems: 'center', textAlign: 'center', gap: 18 } }, [
          n('heading', { text: p.businessName, level: 'h1' }, {
            desktop: { fontSize: 54, textAlign: 'center' }, mobile: { fontSize: 32 },
          }),
          n('text', { text: p.tagline }, { desktop: { fontSize: 18, textAlign: 'center' } }),
          n('button', { label: 'Get started' }),
        ]),
      ]),
      footer({ profile: p }),
    ];
    project.navigation = { items: [{ id: 'nav-home', label: 'Home', pageId: home.id }] };
    return project;
  },
};

export const TEMPLATES: TemplateDefinition[] = [
  modernBusinessTemplate,
  restaurantTemplate,
  gymTemplate,
  interiorTemplate,
  saasTemplate,
  blankTemplate,
];

export function getTemplate(id: string): TemplateDefinition | undefined {
  return TEMPLATES.find((template) => template.id === id);
}

export type { TemplateDefinition };
