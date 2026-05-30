import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { RatingsService } from './ratings.service';

@Controller('api/ratings')
export class RatingsController {
  constructor(private service: RatingsService) {}

  @Post('submit')
  submitRating(@Body() data: any) {
    return this.service.submitRating(data);
  }

  @Get('ticket/:ticketId')
  getTicketRating(@Param('ticketId') ticketId: string) {
    return this.service.getTicketRating(ticketId);
  }

  @Get('survey-results')
  getSurveyResults() {
    return this.service.getSurveyResults();
  }
}
