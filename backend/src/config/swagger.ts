import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EntreLibros API',
      version: '1.0.0',
    },
    servers: [{ url: 'http://localhost:4000' }],
  },
  apis: ['src/routes/*.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
