import fs from 'fs';
import path from 'path';

const openapiPath = path.resolve(process.cwd(), 'openapi.json');
const openapiSpec = JSON.parse(fs.readFileSync(openapiPath, 'utf-8'));

const serverUrl =
  process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 4000}`;
openapiSpec.servers = [{ url: serverUrl }];

export default openapiSpec;
