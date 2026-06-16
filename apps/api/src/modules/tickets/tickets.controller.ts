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
  UsePipes,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { CreateTicketTaskDto } from './dto/create-ticket-task.dto';
import { UpdateTicketTaskDto } from './dto/update-ticket-task.dto';
import { CreateTicketCostDto } from './dto/create-ticket-cost.dto';
import { CreateTicketSolutionDto } from './dto/create-ticket-solution.dto';
import { UpdateTicketSolutionDto } from './dto/update-ticket-solution.dto';
import { CreateTicketValidationDto } from './dto/create-ticket-validation.dto';
import { UpdateTicketValidationDto } from './dto/update-ticket-validation.dto';
import { CreateTicketRelationDto } from './dto/create-ticket-relation.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { PauseReasonValidationPipe } from '../../common/pipes/pause-reason-validation.pipe';
import {
  Ticket,
  TicketFollowup,
  TicketFollower,
  TicketStatus,
  TicketPriority,
  TicketTask,
  TicketCost,
  TicketSolution,
  TicketValidation,
  TicketRelation,
} from '@prisma/client';

interface AuthRequest {
  user: { id: string; profileId: string };
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
  @UsePipes(PauseReasonValidationPipe)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTicketDto,
    @Request() req: AuthRequest,
  ): Promise<Ticket> {
    return this.ticketsService.update(id, dto, req.user.id);
  }

  // Exclusão é destrutiva e irrecuperável — apenas ADMIN (padrão GLPI)
  @Delete(':id')
  @Roles('Administrador')
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

  // ─── Sub-Recursos: Tarefas ─────────────────────────────────────────────────

  @Post(':id/tasks')
  async createTask(
    @Param('id') ticketId: string,
    @Body() dto: CreateTicketTaskDto,
  ): Promise<TicketTask> {
    return this.ticketsService.createTask(ticketId, dto);
  }

  @Get(':id/tasks')
  async getTasks(@Param('id') ticketId: string): Promise<TicketTask[]> {
    return this.ticketsService.getTasks(ticketId);
  }

  @Patch(':id/tasks/:taskId')
  async updateTask(
    @Param('id') ticketId: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTicketTaskDto,
  ): Promise<TicketTask> {
    return this.ticketsService.updateTask(ticketId, taskId, dto);
  }

  @Delete(':id/tasks/:taskId')
  async deleteTask(
    @Param('id') ticketId: string,
    @Param('taskId') taskId: string,
  ): Promise<{ message: string }> {
    return this.ticketsService.deleteTask(ticketId, taskId);
  }

  // ─── Sub-Recursos: Custos ──────────────────────────────────────────────────

  @Post(':id/costs')
  async createCost(
    @Param('id') ticketId: string,
    @Body() dto: CreateTicketCostDto,
  ): Promise<TicketCost> {
    return this.ticketsService.createCost(ticketId, dto);
  }

  @Get(':id/costs')
  async getCosts(
    @Param('id') ticketId: string,
  ): Promise<{
    costs: TicketCost[];
    totals: {
      timeTotal: number;
      fixedTotal: number;
      materialTotal: number;
      grandTotal: number;
    };
  }> {
    return this.ticketsService.getCosts(ticketId);
  }

  // ─── Sub-Recursos: Solução ─────────────────────────────────────────────────

  @Post(':id/solutions')
  async createSolution(
    @Param('id') ticketId: string,
    @Body() dto: CreateTicketSolutionDto,
  ): Promise<TicketSolution> {
    return this.ticketsService.createSolution(ticketId, dto);
  }

  @Get(':id/solutions')
  async getSolutions(@Param('id') ticketId: string): Promise<TicketSolution[]> {
    return this.ticketsService.getSolutions(ticketId);
  }

  @Patch(':id/solutions/:solutionId')
  async updateSolution(
    @Param('id') ticketId: string,
    @Param('solutionId') solutionId: string,
    @Body() dto: UpdateTicketSolutionDto,
  ): Promise<TicketSolution> {
    return this.ticketsService.updateSolution(ticketId, solutionId, dto);
  }

  // ─── Sub-Recursos: Validação ───────────────────────────────────────────────

  @Post(':id/validations')
  async createValidation(
    @Param('id') ticketId: string,
    @Body() dto: CreateTicketValidationDto,
  ): Promise<TicketValidation> {
    return this.ticketsService.createValidation(ticketId, dto);
  }

  @Get(':id/validations')
  async getValidations(@Param('id') ticketId: string): Promise<TicketValidation[]> {
    return this.ticketsService.getValidations(ticketId);
  }

  @Patch(':id/validations/:validationId')
  async updateValidation(
    @Param('id') ticketId: string,
    @Param('validationId') validationId: string,
    @Body() dto: UpdateTicketValidationDto,
  ): Promise<TicketValidation> {
    return this.ticketsService.updateValidation(ticketId, validationId, dto);
  }

  // ─── Sub-Recursos: Relações ────────────────────────────────────────────────

  @Post(':id/relations')
  async createRelation(
    @Param('id') ticketId: string,
    @Body() dto: CreateTicketRelationDto,
  ): Promise<TicketRelation> {
    return this.ticketsService.createRelation(ticketId, dto);
  }

  @Get(':id/relations')
  async getRelations(@Param('id') ticketId: string): Promise<TicketRelation[]> {
    return this.ticketsService.getRelations(ticketId);
  }

  @Delete(':id/relations/:relationId')
  async deleteRelation(
    @Param('id') ticketId: string,
    @Param('relationId') relationId: string,
  ): Promise<{ message: string }> {
    return this.ticketsService.deleteRelation(ticketId, relationId);
  }
}
