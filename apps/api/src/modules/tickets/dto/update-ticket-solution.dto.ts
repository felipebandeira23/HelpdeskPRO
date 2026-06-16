import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SolutionStatus } from '@prisma/client';

export class UpdateTicketSolutionDto {
  @IsEnum(SolutionStatus)
  status!: SolutionStatus;

  @IsOptional()
  @IsString()
  refusalReason?: string;
}
