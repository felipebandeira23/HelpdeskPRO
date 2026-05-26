import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { TicketStatus, TicketPriority } from '@prisma/client';

export class UpdateTicketDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @IsOptional()
  @IsUUID()
  groupId?: string;

  @IsOptional()
  @IsUUID()
  assetId?: string;
}
