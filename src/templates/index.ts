import type { Project } from '@/types/project';
import { createEmptyProject } from '@/engine/schema/defaults';
import { n } from '@/engine/registry/build';
import type { TemplateDefinition } from './types';
import { modernBusinessTemplate } from './modernBusiness';
import { restaurantTemplate } from './restaurant';
import { gymTemplate } from './gym';
import { interiorTemplate } from './interior';
import { saasTemplate } from './saas';

/** A deliberately minimal starting point for people who want to build their own. */
export const blankTemplate: TemplateDefinition = {
  id: 'blank',
  name: 'Blank',
  description: 'An empty page with a navbar and footer, ready for your own layout.',
  tag: 'Start from scratch',
  accent: ['#7217b2', '#ac13eb'],
  build: (projectName) => {
    const project: Project = createEmptyProject(projectName || 'My website');
    project.templateId = 'blank';
    const home = project.pages[0];
    home.nodes = [
      n('navbar', { logoText: projectName || 'My website', showCta: false }),
      n('section', {}, {}, [
        n('container', {}, { desktop: { alignItems: 'center', textAlign: 'center', gap: 18 } }, [
          n('heading', { text: 'Your headline goes here', level: 'h1' }, {
            desktop: { fontSize: 54, textAlign: 'center' }, mobile: { fontSize: 32 },
          }),
          n('text', { text: 'Drag components from the left panel to start building your page.' }, {
            desktop: { fontSize: 18, textAlign: 'center' },
          }),
          n('button', { label: 'Get started' }),
        ]),
      ]),
      n('footer', {}),
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
