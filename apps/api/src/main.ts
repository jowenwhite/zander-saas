import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Disable body parsing - we'll handle it manually for webhooks
    bodyParser: false,
  });

  // Custom body parser that preserves raw body for webhooks
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.originalUrl === '/webhooks/stripe') {
      // For Stripe webhooks, capture raw body
      let rawBody = '';
      req.setEncoding('utf8');
      req.on('data', (chunk) => {
        rawBody += chunk;
      });
      req.on('end', () => {
        (req as any).rawBody = rawBody;
        try {
          req.body = JSON.parse(rawBody);
        } catch (e) {
          req.body = {};
        }
        next();
      });
    } else {
      // For all other routes, use standard JSON parsing
      express.json()(req, res, next);
    }
  });

  // URL-encoded body parser for non-webhook routes
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.originalUrl !== '/webhooks/stripe') {
      express.urlencoded({ extended: true })(req, res, next);
    } else {
      next();
    }
  });

  // MEDIUM-1: Global validation pipe for input validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,              // Strip properties not in DTO
    forbidNonWhitelisted: true,   // Throw error on extra properties
    transform: true,              // Auto-transform payloads to DTO instances
    transformOptions: {
      enableImplicitConversion: true  // Convert primitive types automatically
    }
  }));

  // Enable CORS for frontend (local and Cloudflare)
  app.enableCors({
    origin: [
      'http://localhost:3002',
      'https://zander.mcfapp.com',
      'https://api.zander.mcfapp.com',
      'https://app.zanderos.com',
      'https://api.zanderos.com'
    ],
    credentials: true,
  });

  await app.listen(3001);
  console.log('🚀 API running on http://localhost:3001');
}
bootstrap();
