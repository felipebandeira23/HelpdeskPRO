import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  MaxLength,
  IsISO8601,
} from 'class-validator';
import { TicketStatus, TicketPriority, TicketKind, TicketUrgency, TicketImpact } from '@prisma/client';

// IDs são cuid() (não UUID) — @IsUUID rejeitava IDs válidos do banco.
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
  @IsEnum(TicketKind)
  kind?: TicketKind;

  @IsOptional()
  @IsEnum(TicketUrgency)
  urgency?: TicketUrgency;

  @IsOptional()
  @IsEnum(TicketImpact)
  impact?: TicketImpact;

  @IsOptional()
  @IsString()
  externalId?: string;

  @IsOptional()
  @IsISO8601()
  openedAt?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsOptional()
  @IsString()
  assignedToId?: string;

  @IsOptional()
  @IsString()
  groupId?: string;

  @IsOptional()
  @IsString()
  assetId?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  locationId?: string;

  /** Obrigatório quando status muda para PAUSED */
  @IsOptional()
  @IsString()
  @MaxLength(300)
  pauseReason?: string;
}
