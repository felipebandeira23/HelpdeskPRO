import { IsString, IsOptional, IsEnum, MinLength, MaxLength, IsISO8601 } from 'class-validator';
import { TicketPriority, TicketStatus, TicketKind, TicketUrgency, TicketImpact } from '@prisma/client';

// IDs são cuid() (não UUID) — @IsUUID rejeitava IDs válidos do banco.
export class CreateTicketDto {
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

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
  @IsString()
  groupId?: string;

  @IsOptional()
  @IsString()
  assetId?: string;

  @IsOptional()
  @IsString()
  assignedToId?: string;

  @IsOptional()
  @IsString()
  requesterId?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  locationId?: string;
}
