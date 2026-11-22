// The Masquerade Ball — steal the Crown of Aurelia.
// The entrypoint: copies game/ and screenshots/ into the output directory and
// writes dossier.json with buildDossier from vendor/makefun-game.ts, so the
// entry hands in exactly what the repository holds, byte for byte.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildDossier } from './vendor/makefun-game.ts';

const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';
const rootDir = new URL('.', import.meta.url).pathname;

// Fail loudly, before touching the output, when the entry is incomplete:
// a half-written output directory would grade worse than no output at all.
for (const needed of ['game', 'screenshots']) {
  if (!existsSync(join(rootDir, needed))) {
    throw new Error('missing ' + needed + '/ beside main.ts: the entry is incomplete');
  }
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
cpSync(join(rootDir, 'game'), join(outDir, 'game'), { recursive: true });
cpSync(join(rootDir, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log('wrote dossier.json (' + dossier.length + ' bytes) to ' + outDir);
