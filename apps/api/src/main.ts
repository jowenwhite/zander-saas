import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend
  app.enableCors({
    origin: 'http://localhost:3002',
    credentials: true,
  });

  // GraphQL Playground configuration
  await app.listen(3001);
  console.log('🚀 API running on http://localhost:3001');
}
bootstrap();
