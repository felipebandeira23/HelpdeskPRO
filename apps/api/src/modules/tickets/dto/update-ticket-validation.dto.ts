import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ValidationStatus } from '@prisma/client';

export class UpdateTicketValidationDto {
  @IsEnum(ValidationStatus)
  status!: ValidationStatus;

  @IsOptional()
  @IsString()
  validatorId?: string;
}
