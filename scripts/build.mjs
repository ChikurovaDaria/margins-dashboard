import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const dist = join(root, 'dist');
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
['index.html', 'main.js', 'js', 'styles'].forEach((entry) => {
  cpSync(join(root, entry), join(dist, entry), { recursive: true });
});
console.log('Сборка готова: dist/');
