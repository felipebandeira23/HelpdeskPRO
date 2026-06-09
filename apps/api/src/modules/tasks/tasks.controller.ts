import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Prisma, Task } from '@prisma/client';

@Controller('api/tasks')
export class TasksController {
  constructor(private service: TasksService) {}

  @Post()
  create(@Body() data: Prisma.TaskCreateInput): Promise<Task> {
    return this.service.create(data);
  }

  @Get()
  findAll(): Promise<Task[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Task> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: Prisma.TaskUpdateInput,
  ): Promise<Task> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.service.delete(id);
  }
}
