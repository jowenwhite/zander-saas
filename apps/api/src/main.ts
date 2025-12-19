import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend (local and Cloudflare)
  app.enableCors({
    origin: [
      'http://localhost:3002',
      'https://zander.mcfapp.com',
      'https://api.zander.mcfapp.com'
    ],
    credentials: true,
  });
  
  await app.listen(3001);
  console.log('🚀 API running on http://localhost:3001');
}
bootstrap();
