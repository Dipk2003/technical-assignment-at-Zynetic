import { Type } from 'class-transformer';
import { IsISO8601, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class VehicleIngestDto {
  @IsString()
  @IsNotEmpty()
  vehicleId!: string;

  @Type(() => Number)
  @IsNumber()
  soc!: number;

  @Type(() => Number)
  @IsNumber()
  kwhDeliveredDc!: number;

  @Type(() => Number)
  @IsNumber()
  batteryTemp!: number;

  @IsISO8601()
  timestamp!: string;
}
