import { Module } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';

@Module({
  controllers: [ProfilesController],
  providers: [ProfilesService, PrismaService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
