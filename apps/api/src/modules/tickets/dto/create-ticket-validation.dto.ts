import { IsString } from 'class-validator';

export class CreateTicketValidationDto {
  @IsString()
  content!: string;
}
