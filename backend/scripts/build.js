import { execSync } from 'node:child_process';
import { rmSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

try {
  rmSync(path.join(projectRoot, 'dist'), { recursive: true, force: true });
} catch (err) {
  console.error('Failed to remove dist directory:', err.message);
}

execSync('tsc', { cwd: projectRoot, stdio: 'inherit' });

copyFileSync(
  path.join(projectRoot, 'openapi.json'),
  path.join(projectRoot, 'dist', 'openapi.json')
);
