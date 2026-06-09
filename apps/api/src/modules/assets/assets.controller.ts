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
import { JwtGuard } from '../../common/guards/jwt.guard';
import { AssetsService } from './assets.service';
import { Prisma, Asset, Ticket } from '@prisma/client';

@Controller('api/assets')
@UseGuards(JwtGuard)
export class AssetsController {
  constructor(private service: AssetsService) {}

  @Post()
  create(@Body() data: Prisma.AssetCreateInput): Promise<Asset> {
    return this.service.create(data);
  }

  @Get()
  findAll(): Promise<Asset[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Asset> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: Prisma.AssetUpdateInput,
  ): Promise<Asset> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<Asset> {
    return this.service.delete(id);
  }

  @Get(':id/tickets')
  getTickets(@Param('id') id: string): Promise<Ticket[]> {
    return this.service.getAssetTickets(id);
  }
}
