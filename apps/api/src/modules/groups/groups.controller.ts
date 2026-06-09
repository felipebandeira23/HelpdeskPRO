import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { Prisma, Group, GroupMember } from '@prisma/client';

@Controller('api/groups')
export class GroupsController {
  constructor(private service: GroupsService) {}

  @Post()
  create(@Body() data: Prisma.GroupCreateInput): Promise<Group> {
    return this.service.create(data);
  }

  @Get()
  findAll(): Promise<Group[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Group> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: Prisma.GroupUpdateInput,
  ): Promise<Group> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.service.delete(id);
  }

  @Post(':id/members')
  addMember(
    @Param('id') id: string,
    @Body() body: { userId: string },
  ): Promise<GroupMember> {
    return this.service.addMember(id, body.userId);
  }

  @Delete(':id/members/:userId')
  removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ): Promise<{ success: boolean }> {
    return this.service.removeMember(id, userId);
  }
}
