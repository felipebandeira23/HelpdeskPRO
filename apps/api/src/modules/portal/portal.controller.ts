import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { PortalService } from './portal.service';

@Controller('api/portal')
export class PortalController {
  constructor(private service: PortalService) {}

  @Post('tickets')
  createTicket(@Body() data: any) {
    return this.service.createTicketPublic(data);
  }

  @Get('tickets')
  getTickets(@Query('email') email: string) {
    return this.service.getTicketsPublic(email);
  }

  @Get('tickets/:id')
  getTicket(@Param('id') id: string) {
    return this.service.getTicketPublic(id);
  }

  @Post('tickets/:id/followup')
  addFollowup(
    @Param('id') id: string,
    @Body() data: { email: string; message: string },
  ) {
    return this.service.addPublicFollowup(id, data.email, data.message);
  }
}
