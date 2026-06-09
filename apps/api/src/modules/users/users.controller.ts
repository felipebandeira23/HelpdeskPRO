import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRole } from '@prisma/client';

interface CreateUserDto {
  email: string;
  name: string;
  password: string;
  role?: UserRole;
  active?: boolean;
}

interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  active?: boolean;
}

@Controller('api/users')
export class UsersController {
  constructor(private service: UsersService) {}

  @Post()
  create(@Body() data: CreateUserDto): Promise<unknown> {
    return this.service.create(data);
  }

  @Get()
  findAll(): Promise<unknown> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<unknown> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateUserDto): Promise<unknown> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.service.delete(id);
  }
}
