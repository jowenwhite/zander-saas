import { Module } from '@nestjs/common';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { PrismaService } from '../../prisma.service';
import { S3Service } from '../../common/s3/s3.service';
import { StorageService } from '../../common/storage/storage.service';

@Module({
  controllers: [AssetsController],
  providers: [AssetsService, PrismaService, S3Service, StorageService],
  exports: [AssetsService],
})
export class AssetsModule {}
