import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { TicketPriority } from '@prisma/client';

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
  @IsString()
  priority?: TicketPriority;

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
}
