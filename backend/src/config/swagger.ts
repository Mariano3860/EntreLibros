import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';
import { fileURLToPath } from 'url';

const serverUrl =
  process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 4000}`;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EntreLibros API',
      version: '1.0.0',
    },
    servers: [{ url: serverUrl }],
  },
  apis: [
    path.join(__dirname, '../routes/*.ts'),
    path.join(__dirname, '../routes/*.js'),
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
