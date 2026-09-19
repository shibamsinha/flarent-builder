import type { Project } from '@/types/project';
import type { ProfileInput, TemplateDefaults } from '@/onboarding/profile';

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  /** Short category label shown on the dashboard card. */
  tag: string;
  /** Two colours used to draw the template's preview tile. */
  accent: [string, string];
  /**
   * Industry-appropriate copy used wherever the user left an answer blank.
   * Also drives the placeholder text in the onboarding form, so people can see
   * the shape of a good answer before writing their own.
   */
  defaults: TemplateDefaults;
  /** Build a project for a specific business. */
  build: (profile: ProfileInput) => Project;
}
