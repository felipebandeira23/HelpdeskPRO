import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { RatingsService } from './ratings.service';

interface SubmitRatingDto {
  ticketId: string;
  userId: string;
  rating: number;
  comment?: string;
}

@Controller('api/ratings')
export class RatingsController {
  constructor(private service: RatingsService) {}

  @Post('submit')
  submitRating(@Body() data: SubmitRatingDto): Promise<unknown> {
    return this.service.submitRating(data);
  }

  @Get('ticket/:ticketId')
  getTicketRating(@Param('ticketId') ticketId: string): Promise<unknown> {
    return this.service.getTicketRating(ticketId);
  }

  @Get('survey-results')
  getSurveyResults(): Promise<unknown> {
    return this.service.getSurveyResults();
  }
}
