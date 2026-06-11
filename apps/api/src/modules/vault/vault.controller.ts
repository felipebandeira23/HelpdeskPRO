import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { VaultService } from './vault.service';

interface AuthRequest {
  user: { id: string };
}

interface CreateCredentialDto {
  name: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
}

interface UpdateCredentialDto {
  name?: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
}

// Identidade SEMPRE do token (req.user) — nunca do body, que é forjável.
@Controller('api/vault')
@UseGuards(JwtAuthGuard)
export class VaultController {
  constructor(private service: VaultService) {}

  @Post()
  create(
    @Body() data: CreateCredentialDto,
    @Request() req: AuthRequest,
  ): Promise<unknown> {
    return this.service.create({ ...data, ownerId: req.user.id });
  }

  @Get()
  findAll(@Request() req: AuthRequest): Promise<unknown[]> {
    return this.service.findAll(req.user.id);
  }

  @Get(':id/reveal')
  reveal(
    @Param('id') id: string,
    @Request() req: AuthRequest,
  ): Promise<{ password: string }> {
    return this.service.reveal(id, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthRequest): Promise<unknown> {
    return this.service.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: UpdateCredentialDto,
    @Request() req: AuthRequest,
  ): Promise<unknown> {
    return this.service.update(id, req.user.id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req: AuthRequest): Promise<unknown> {
    return this.service.delete(id, req.user.id);
  }
}
