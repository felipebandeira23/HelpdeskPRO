import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RatingsService } from './ratings.service';
import { RatingsController } from './ratings.controller';

@Module({
  controllers: [RatingsController],
  providers: [RatingsService, PrismaService],
  exports: [RatingsService],
})
export class RatingsModule {}
