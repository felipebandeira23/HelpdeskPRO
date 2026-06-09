import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { TicketTypesService } from './ticket-types.service';

interface CreateTicketTypeDto {
  name: string;
  icon?: string;
  color?: string;
  description?: string;
  slaResponseTime?: number;
  slaSolutionTime?: number;
}

interface UpdateTicketTypeDto {
  name?: string;
  icon?: string;
  color?: string;
  description?: string;
  slaResponseTime?: number;
  slaSolutionTime?: number;
}

@Controller('api/ticket-types')
export class TicketTypesController {
  constructor(private service: TicketTypesService) {}

  @Post()
  create(@Body() data: CreateTicketTypeDto): Promise<unknown> {
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
  update(@Param('id') id: string, @Body() data: UpdateTicketTypeDto): Promise<unknown> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<unknown> {
    return this.service.delete(id);
  }
}
