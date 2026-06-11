import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Roles, RolesGuard } from '../../common/guards/roles.guard';
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
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private service: UsersService) {}

  // Gestão de contas é exclusiva de ADMIN — criar usuário define role e senha.
  @Post()
  @Roles('ADMIN')
  create(@Body() data: CreateUserDto): Promise<unknown> {
    return this.service.create(data);
  }

  // Listagem usada em selects (atribuir técnico, solicitante) — staff apenas.
  @Get()
  @Roles('ADMIN', 'TECHNICIAN')
  findAll(): Promise<unknown> {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'TECHNICIAN')
  findOne(@Param('id') id: string): Promise<unknown> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() data: UpdateUserDto): Promise<unknown> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @Roles('ADMIN')
  delete(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.service.delete(id);
  }
}
