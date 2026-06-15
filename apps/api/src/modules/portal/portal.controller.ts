import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { PortalService } from './portal.service';

interface CreateTicketPublicDto {
  email: string;
  name: string;
  title: string;
  description: string;
}

// Público por design: é o canal de abertura sem login técnico.
// Identificação por email + número do chamado (sem enumeração de IDs).
@Controller('api/portal')
export class PortalController {
  constructor(private service: PortalService) {}

  @Post('tickets')
  createTicket(
    @Body() data: CreateTicketPublicDto,
  ): Promise<{ id: string; ticketNumber: number }> {
    return this.service.createTicketPublic(data);
  }

  @Get('tickets')
  getTickets(@Query('email') email: string): Promise<unknown[]> {
    return this.service.getTicketsPublic(email);
  }

  @Get('tickets/:number')
  getTicket(
    @Param('number', ParseIntPipe) ticketNumber: number,
    @Query('email') email: string,
  ): Promise<unknown> {
    return this.service.getTicketPublic(ticketNumber, email);
  }

  @Post('tickets/:number/followup')
  addFollowup(
    @Param('number', ParseIntPipe) ticketNumber: number,
    @Body() data: { email: string; message: string },
  ): Promise<unknown> {
    return this.service.addPublicFollowup(ticketNumber, data.email, data.message);
  }
}
