import { IsString, IsOptional, IsBoolean, IsInt, Min, IsISO8601 } from 'class-validator';

export class UpdateTicketTaskDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsBoolean()
  isDone?: boolean;

  @IsOptional()
  @IsString()
  assignedToId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  actionTime?: number;

  @IsOptional()
  @IsISO8601()
  plannedAt?: string;

  @IsOptional()
  @IsISO8601()
  plannedEnd?: string;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}
