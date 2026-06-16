import { IsString, IsOptional, IsEnum } from 'class-validator';
import { TicketPriority } from '@prisma/client';

export class CreateTicketFromChatDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(TicketPriority)
  priority!: TicketPriority;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  assignedToId?: string;

  @IsOptional()
  @IsString()
  groupId?: string;
}
