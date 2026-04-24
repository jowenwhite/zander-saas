import { Module } from '@nestjs/common';
import { SocialMediaService } from './social.service';
import { SocialPostsController } from './social.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SocialPostsController],
  providers: [SocialMediaService],
  exports: [SocialMediaService],
})
export class SocialModule {}
