import type { BuilderNode, Page, Project } from '@/types/project';
import { DEVICES } from '@/engine/responsive';
import { walkTree } from '@/engine/commands/tree';
import { styleMapToCssText } from '@/types/styles';
import { exportClassName } from '@/engine/renderer/NodeRenderer';
import { RUNTIME_CSS } from '@/engine/renderer/runtimeStyles';
import { themeToCssText } from '@/engine/theme';

/**
 * Turn every node's responsive styles into a real stylesheet.
 *
 * Breakpoints are emitted widest-first as `max-width` queries, which reproduces
 * the editor's inheritance model exactly through the normal CSS cascade, so no
 * value is ever duplicated across breakpoints.
 */
export function buildStylesheet(project: Project): string {
  const chunks: string[] = [themeToCssText(project.theme, ':root'), RUNTIME_CSS];

  for (const device of DEVICES) {
    const rules: string[] = [];
    for (const page of project.pages) {
      collectDeviceRules(page, device.id, rules);
    }
    if (rules.length === 0) continue;
    if (device.mediaMaxWidth === null) {
      chunks.push(rules.join('\n'));
    } else {
      chunks.push(`@media (max-width: ${device.mediaMaxWidth}px) {\n${indent(rules.join('\n'))}\n}`);
    }
  }
  return chunks.join('\n\n');
}

function collectDeviceRules(page: Page, device: string, rules: string[]): void {
  const visit = (node: BuilderNode) => {
    const selector = `.${exportClassName(node.id)}`;
    const styles = node.styles?.[device as keyof NonNullable<BuilderNode['styles']>];
    if (styles && Object.keys(styles).length > 0) {
      const body = styleMapToCssText(styles);
      if (body) rules.push(`${selector} {\n${body}\n}`);
    }
    if (node.hidden?.[device as 'desktop']) {
      rules.push(`${selector} {\n  display: none !important;\n}`);
    }
  };
  walkTree(page.nodes, (node) => {
    visit(node);
  });
}

function indent(text: string): string {
  return text
    .split('\n')
    .map((line) => (line ? `  ${line}` : line))
    .join('\n');
}
