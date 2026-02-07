import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as express from 'express';
import { PayloadTooLargeExceptionFilter, EntityTooLargeFilter } from './common/filters/payload-too-large.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Disable body parsing - we'll handle it manually for webhooks
    bodyParser: false,
  });

  // MEDIUM-2: Request size limits to prevent DoS via large payloads
  const JSON_LIMIT = '1mb';
  const URLENCODED_LIMIT = '1mb';
  const RAW_LIMIT = '5mb';  // Larger for webhooks that may include file data

  // Custom body parser that preserves raw body for webhooks
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.originalUrl === '/webhooks/stripe') {
      // For Stripe webhooks, capture raw body with size limit
      let rawBody = '';
      let bodySize = 0;
      const maxSize = 5 * 1024 * 1024; // 5MB limit for webhooks

      req.setEncoding('utf8');
      req.on('data', (chunk) => {
        bodySize += chunk.length;
        if (bodySize > maxSize) {
          req.destroy();
          res.status(413).json({ error: 'Payload too large', maxSize: '5mb' });
          return;
        }
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
      // For all other routes, use standard JSON parsing with size limit
      express.json({ limit: JSON_LIMIT })(req, res, next);
    }
  });

  // URL-encoded body parser for non-webhook routes with size limit
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.originalUrl !== '/webhooks/stripe') {
      express.urlencoded({ limit: URLENCODED_LIMIT, extended: true })(req, res, next);
    } else {
      next();
    }
  });

  // Raw body parser for binary data (if needed) with size limit
  app.use(express.raw({ limit: RAW_LIMIT, type: 'application/octet-stream' }));

  // MEDIUM-1: Global validation pipe for input validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,              // Strip properties not in DTO
    forbidNonWhitelisted: true,   // Throw error on extra properties
    transform: true,              // Auto-transform payloads to DTO instances
    transformOptions: {
      enableImplicitConversion: true  // Convert primitive types automatically
    }
  }));

  // MEDIUM-2: Global exception filters for payload size errors
  app.useGlobalFilters(
    new PayloadTooLargeExceptionFilter(),
    new EntityTooLargeFilter(),
  );

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
