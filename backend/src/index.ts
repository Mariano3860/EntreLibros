import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const envFile = process.env.DOTENV_CONFIG_PATH
  ? path.resolve(process.cwd(), process.env.DOTENV_CONFIG_PATH)
  : path.join(path.dirname(fileURLToPath(import.meta.url)), '../.env');
dotenv.config({ path: envFile });

const { default: app } = await import('./app.js');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
