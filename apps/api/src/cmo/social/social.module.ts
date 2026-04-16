import { Module } from '@nestjs/common';
import { SocialMediaService } from './social.service';

@Module({
  providers: [SocialMediaService],
  exports: [SocialMediaService],
})
export class SocialModule {}
