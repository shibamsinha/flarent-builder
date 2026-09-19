import { registerComponents } from '@/engine/registry/registry';
import { layoutComponents } from './layout';
import { basicComponents } from './basic';
import { sectionComponents } from './sections';
import { businessComponents } from './business';

let registered = false;

/**
 * The single place components enter the system. Adding a component to Flarent
 * Builder means writing one definition file and adding it here — nothing else
 * in the application needs to change.
 */
export function registerBuiltInComponents(): void {
  if (registered) return;
  registered = true;
  registerComponents([
    ...layoutComponents,
    ...basicComponents,
    ...sectionComponents,
    ...businessComponents,
  ]);
}
