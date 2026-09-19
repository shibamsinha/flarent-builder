/**
 * Builds every template into `demo-export/<template>/` so the published output
 * can be opened and checked without going through the editor.
 *
 * Run with: npx vite-node scripts/build-demo-site.mts
 */
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { registerBuiltInComponents } from '@/engine/registry/components';
import { buildStaticSite } from '@/engine/export/staticExport';
import * as commands from '@/engine/commands';
import { TEMPLATES } from '@/templates';

registerBuiltInComponents();

const outRoot = join(process.cwd(), 'demo-export');
await rm(outRoot, { recursive: true, force: true });

for (const template of TEMPLATES) {
  let project = template.build({ businessName: template.name });
  project = commands.updateSettings(project, { baseUrl: `https://${template.id}.example.com` });

  const files = await buildStaticSite(project);
  const outDir = join(outRoot, template.id);

  for (const file of files) {
    const target = join(outDir, file.path);
    await mkdir(dirname(target), { recursive: true });
    if (file.blob) {
      await writeFile(target, Buffer.from(await file.blob.arrayBuffer()));
    } else {
      await writeFile(target, file.text ?? '', 'utf8');
    }
  }
  console.log(`${template.name.padEnd(18)} → ${files.length} files in demo-export/${template.id}`);
}

console.log('\nDone.');
