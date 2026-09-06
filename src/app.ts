import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import apiRouter from './routes/api.routes';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Strict rate limiting on authentication routes
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minutes
  max: 10, // Limit each IP to 10 authentication requests per windowMs
  message: { error: 'Too many authentication attempts. Try again in 15 minutes.' },
});

app.use('/api/v1/auth/login', authRateLimiter);
app.use('/api/v1/auth/register', authRateLimiter);

// Swagger Setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'KnowledgeHub API Documentation',
      version: '1.0.0',
      description: 'RESTful API for KnowledgeHub Question & Answer Platform',
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  // Updated apis path to scan both routes and controllers for swagger comments
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// API Routes
app.use('/api/v1', apiRouter);

// Centralized Error Handling Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  return res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`KnowledgeHub Server running on port ${PORT}`);
  console.log(`Swagger documentation accessible at http://localhost:${PORT}/docs`);
});