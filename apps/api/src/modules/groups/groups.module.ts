import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';

@Module({
  controllers: [GroupsController],
  providers: [GroupsService, PrismaService],
  exports: [GroupsService],
})
export class GroupsModule {}
