import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as express from 'express';
import {
  GlobalExceptionFilter,
  ValidationExceptionFilter,
  PayloadTooLargeExceptionFilter,
  ThrottleExceptionFilter,
} from './common/filters';
import { AuditLogInterceptor } from './common/interceptors';
import { AuditLogService } from './common/services/audit-log.service';

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

  // MEDIUM-2 & MEDIUM-3: Global exception filters
  // Order matters: GlobalExceptionFilter catches unhandled exceptions last (fallback)
  // Specific filters (Validation, PayloadTooLarge, Throttle) catch their types first
  app.useGlobalFilters(
    new GlobalExceptionFilter(),      // Catch-all fallback (registered first = catches last)
    new ValidationExceptionFilter(),  // 400 validation errors
    new PayloadTooLargeExceptionFilter(), // 413 payload errors
    new ThrottleExceptionFilter(),    // 429 rate limit errors
  );

  // MEDIUM-4: Global audit log interceptor
  // Logs all mutating operations (POST, PUT, PATCH, DELETE) automatically
  const auditLogService = app.get(AuditLogService);
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new AuditLogInterceptor(auditLogService, reflector));

  // LOW-1: CORS Configuration with domain whitelist
  // Production origins only - dev origins added conditionally below
  const allowedOrigins = [
    'https://app.zanderos.com',
    'https://www.zanderos.com',
    'https://zanderos.com',
    'https://api.zanderos.com',
    'https://zander.mcfapp.com',
    'https://api.zander.mcfapp.com',
  ];

  // Add development origins only in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push(
      'http://localhost:3002',
      'http://localhost:3000',
      'http://127.0.0.1:3002',
      'http://127.0.0.1:3000',
    );
  }

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'X-CSRF-Token',
    ],
    exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page'],
    credentials: true,
    maxAge: 86400, // 24 hours - cache preflight requests
  });

  await app.listen(3001);
  console.log('🚀 API running on http://localhost:3001');
}
bootstrap();
