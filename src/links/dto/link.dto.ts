import { IsNotEmpty, IsString } from 'class-validator';

export class LinkDto {
  @IsString()
  @IsNotEmpty()
  vehicleId!: string;

  @IsString()
  @IsNotEmpty()
  meterId!: string;
}
