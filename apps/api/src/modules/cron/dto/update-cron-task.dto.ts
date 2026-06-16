import { IsOptional, IsEnum, IsInt, IsObject, Min, Max } from 'class-validator';
import { CronTaskStatus } from '@prisma/client';

export class UpdateCronTaskDto {
  @IsOptional()
  @IsEnum(CronTaskStatus)
  status?: CronTaskStatus;

  @IsOptional()
  @IsInt()
  @Min(1)
  frequency?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(23)
  runStartHour?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(24)
  runEndHour?: number;

  @IsOptional()
  @IsObject()
  param?: Record<string, any>;
}
