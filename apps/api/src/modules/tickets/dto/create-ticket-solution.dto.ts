import { IsString, IsOptional } from 'class-validator';

export class CreateTicketSolutionDto {
  @IsString()
  content!: string;
}
