import type { Project } from '@/types/project';

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  /** Short category label shown on the dashboard card. */
  tag: string;
  /** Two colours used to draw the template's preview tile. */
  accent: [string, string];
  build: (projectName?: string) => Project;
}
