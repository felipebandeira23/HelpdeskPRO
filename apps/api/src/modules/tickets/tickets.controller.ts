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
import { Roles, RolesGuard } from '../../common/guards/roles.guard';
import {
  Ticket,
  TicketFollowup,
  TicketFollower,
  TicketStatus,
  TicketPriority,
} from '@prisma/client';

interface AuthRequest {
  user: { id: string; role: string };
}

@Controller('api/tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Post()
  async create(
    @Body() dto: CreateTicketDto,
    @Request() req: AuthRequest,
  ): Promise<Ticket> {
    return this.ticketsService.create(dto, req.user.id);
  }

  @Get()
  async findAll(
    @Query('status') status?: TicketStatus,
    @Query('priority') priority?: TicketPriority,
    @Query('categoryId') categoryId?: string,
    @Query('customerId') customerId?: string,
    @Query('assignedToId') assignedToId?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ): Promise<{
    data: Ticket[];
    pagination: { total: number; skip: number; take: number; hasMore: boolean };
  }> {
    return this.ticketsService.findAll({
      status,
      priority,
      categoryId,
      customerId,
      assignedToId,
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    });
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: AuthRequest,
  ): Promise<Ticket> {
    return this.ticketsService.findById(id, req.user);
  }

  @Get(':id/requester-history')
  async requesterHistory(@Param('id') id: string): Promise<Ticket[]> {
    return this.ticketsService.findRecentByRequester(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTicketDto,
    @Request() req: AuthRequest,
  ): Promise<Ticket> {
    return this.ticketsService.update(id, dto, req.user.id);
  }

  // Exclusão é destrutiva e irrecuperável — apenas ADMIN (padrão GLPI)
  @Delete(':id')
  @Roles('ADMIN')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.ticketsService.delete(id);
  }

  @Post(':id/followups')
  async addFollowup(
    @Param('id') ticketId: string,
    @Body() body: { message: string; isInternal?: boolean },
    @Request() req: AuthRequest,
  ): Promise<TicketFollowup> {
    return this.ticketsService.addFollowup(
      ticketId,
      req.user.id,
      body.message,
      body.isInternal || false,
    );
  }

  @Post(':id/followers')
  async addFollower(
    @Param('id') ticketId: string,
    @Body() body: { userId?: string },
    @Request() req: AuthRequest,
  ): Promise<TicketFollower> {
    return this.ticketsService.addFollower(
      ticketId,
      body.userId || req.user.id,
    );
  }

  @Delete(':id/followers/:userId')
  async removeFollower(
    @Param('id') ticketId: string,
    @Param('userId') userId: string,
  ): Promise<{ message: string }> {
    return this.ticketsService.removeFollower(ticketId, userId);
  }
}
