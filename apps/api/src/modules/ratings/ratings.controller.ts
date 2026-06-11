import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { TicketRating } from '@prisma/client';

interface AuthRequest {
  user: { id: string };
}

interface SubmitRatingDto {
  ticketId: string;
  rating: number;
  comment?: string;
}

@Controller('api/ratings')
@UseGuards(JwtAuthGuard)
export class RatingsController {
  constructor(private service: RatingsService) {}

  @Post('submit')
  submitRating(
    @Body() data: SubmitRatingDto,
    @Request() req: AuthRequest,
  ): Promise<TicketRating> {
    // userId vem do token — o usuário não pode avaliar em nome de outro
    return this.service.submitRating({ ...data, userId: req.user.id });
  }

  @Get('survey-results')
  getSurveyResults(): Promise<Record<string, unknown>> {
    return this.service.getSurveyResults();
  }

  @Get('ticket/:ticketId')
  getTicketRating(
    @Param('ticketId') ticketId: string,
  ): Promise<TicketRating | null> {
    return this.service.getTicketRating(ticketId);
  }
}
