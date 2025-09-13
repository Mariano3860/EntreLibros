import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env.test');
const examplePath = path.resolve('.env.test.example');

if (!fs.existsSync(envPath) && fs.existsSync(examplePath)) {
  fs.copyFileSync(examplePath, envPath);
}
