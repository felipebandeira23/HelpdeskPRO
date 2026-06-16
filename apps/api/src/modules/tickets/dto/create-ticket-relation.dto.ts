import { IsString, IsEnum } from 'class-validator';
import { TicketRelationType } from '@prisma/client';

export class CreateTicketRelationDto {
  @IsString()
  relatedTicketId!: string;

  @IsEnum(TicketRelationType)
  type!: TicketRelationType;
}
