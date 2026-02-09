import { Type } from 'class-transformer';
import { IsISO8601, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class MeterIngestDto {
  @IsString()
  @IsNotEmpty()
  meterId!: string;

  @Type(() => Number)
  @IsNumber()
  kwhConsumedAc!: number;

  @Type(() => Number)
  @IsNumber()
  voltage!: number;

  @IsISO8601()
  timestamp!: string;
}
