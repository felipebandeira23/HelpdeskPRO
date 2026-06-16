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
import { UsersService } from './users.service';

interface CreateUserDto {
  email: string;
  name: string;
  password: string;
  profileId?: string;
  active?: boolean;
}

interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  profileId?: string;
  active?: boolean;
}

@Controller('api/users')
export class UsersController {
  constructor(private service: UsersService) {}

  // Gestão de contas é exclusiva de ADMIN — criar usuário define role e senha.
  @Post()
  create(@Body() data: CreateUserDto): Promise<unknown> {
    return this.service.create(data);
  }

  // Listagem usada em selects (atribuir técnico, solicitante) — staff apenas.
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
