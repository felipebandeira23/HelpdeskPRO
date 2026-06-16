import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { ProfilesService, CreateProfileDto, UpdateProfileDto } from './profiles.service';

@Controller('api/profiles')
@UseGuards(JwtAuthGuard)
export class ProfilesController {
  constructor(private profilesService: ProfilesService) {}

  /**
   * Listar todos os perfis
   * GET /api/profiles
   */
  @Get()
  async list() {
    return this.profilesService.findAll();
  }

  /**
   * Obter perfil por ID
   * GET /api/profiles/:id
   */
  @Get(':id')
  async findById(@Param('id') id: string) {
    const profile = await this.profilesService.findById(id);
    if (!profile) {
      return { error: 'Perfil não encontrado' };
    }
    return profile;
  }

  /**
   * Criar novo perfil
   * POST /api/profiles
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateProfileDto) {
    return this.profilesService.create(dto);
  }

  /**
   * Atualizar perfil
   * PUT /api/profiles/:id
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProfileDto) {
    return this.profilesService.update(id, dto);
  }

  /**
   * Deletar perfil
   * DELETE /api/profiles/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.profilesService.delete(id);
    return null;
  }

  /**
   * Obter catálogo de direitos para interface
   * GET /api/profiles/catalog/:interface
   */
  @Get('catalog/:interface')
  getCatalog(@Param('interface') interfaceType: 'central' | 'simplified') {
    return this.profilesService.getRightsCatalog(interfaceType);
  }
}
