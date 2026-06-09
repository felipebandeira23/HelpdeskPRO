import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { VaultService } from './vault.service';

interface CreateCredentialDto {
  name: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  ownerId: string;
}

interface UpdateCredentialDto {
  userId: string;
  name?: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
}

interface UserIdDto {
  userId: string;
}

@Controller('api/vault')
export class VaultController {
  constructor(private service: VaultService) {}

  @Post()
  create(@Body() data: CreateCredentialDto): Promise<unknown> {
    return this.service.create(data);
  }

  @Get('user/:userId')
  findAll(@Param('userId') userId: string): Promise<unknown[]> {
    return this.service.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Body() body: UserIdDto): Promise<unknown> {
    return this.service.findOne(id, body.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: UpdateCredentialDto,
  ): Promise<unknown> {
    const { userId, ...updateData } = data;
    return this.service.update(id, userId, updateData);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Body() body: UserIdDto): Promise<unknown> {
    return this.service.delete(id, body.userId);
  }
}
