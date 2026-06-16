import { IsOptional, IsNumber, Min, IsInt } from 'class-validator';

export class CreateTicketCostDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  costTime?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  actionTime?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costFixed?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costMaterial?: number;
}
