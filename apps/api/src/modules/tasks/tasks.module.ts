import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';

@Module({
  controllers: [TasksController],
  providers: [TasksService, PrismaService],
  exports: [TasksService],
})
export class TasksModule {}
