import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';

@Module({
  controllers: [AssetsController],
  providers: [AssetsService, PrismaService],
  exports: [AssetsService],
})
export class AssetsModule {}
