import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TVModeService } from './tvmode.service';
import { TVModeController } from './tvmode.controller';

@Module({
  controllers: [TVModeController],
  providers: [TVModeService, PrismaService],
  exports: [TVModeService],
})
export class TVModeModule {}
