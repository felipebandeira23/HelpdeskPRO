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
import { Ticket, TicketFollowup, TicketStatus, TicketPriority } from '@prisma/client';

@Controller('api/tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Post()
  async create(
    @Body() dto: CreateTicketDto,
    @Request() req: { user: { id: string } },
  ): Promise<Ticket> {
    return this.ticketsService.create(dto, req.user.id);
  }

  @Get()
  async findAll(
    @Query('status') status?: TicketStatus,
    @Query('priority') priority?: TicketPriority,
  ): Promise<{
    data: Ticket[];
    pagination: { total: number; skip: number; take: number; hasMore: boolean };
  }> {
    return this.ticketsService.findAll({ status, priority });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Ticket> {
    return this.ticketsService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTicketDto,
  ): Promise<Ticket> {
    return this.ticketsService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.ticketsService.delete(id);
  }

  @Post(':id/followups')
  async addFollowup(
    @Param('id') ticketId: string,
    @Body() body: { message: string; isInternal?: boolean },
    @Request() req: { user: { id: string } },
  ): Promise<TicketFollowup> {
    return this.ticketsService.addFollowup(
      ticketId,
      req.user.id,
      body.message,
      body.isInternal || false,
    );
  }
}
