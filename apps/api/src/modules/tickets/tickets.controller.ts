import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('api/tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Post()
  async create(@Body() dto: CreateTicketDto, @Request() req: any) {
    return this.ticketsService.create(dto, req.user.id);
  }

  @Get()
  async findAll(@Query('status') status?: string, @Query('priority') priority?: string) {
    return this.ticketsService.findAll({ status, priority });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ticketsService.findById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTicketDto) {
    return this.ticketsService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.ticketsService.delete(id);
  }

  @Post(':id/followups')
  async addFollowup(
    @Param('id') ticketId: string,
    @Body() body: { message: string; isInternal?: boolean },
    @Request() req: any,
  ) {
    return this.ticketsService.addFollowup(
      ticketId,
      req.user.id,
      body.message,
      body.isInternal || false,
    );
  }
}
