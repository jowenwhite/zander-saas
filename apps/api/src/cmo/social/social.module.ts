import { Module } from '@nestjs/common';
import { SocialMediaService } from './social.service';
import { SocialPostsController } from './social.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { MetaModule } from '../../integrations/meta/meta.module';

@Module({
  imports: [PrismaModule, MetaModule],
  controllers: [SocialPostsController],
  providers: [SocialMediaService],
  exports: [SocialMediaService],
})
export class SocialModule {}
