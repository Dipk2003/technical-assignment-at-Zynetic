import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { IngestionService } from './ingestion.service';
import { MeterIngestDto } from './dto/meter-ingest.dto';
import { VehicleIngestDto } from './dto/vehicle-ingest.dto';

@Controller('ingest')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post()
  async ingest(@Body() body: Record<string, any>) {
    const hasMeter = typeof body?.meterId === 'string';
    const hasVehicle = typeof body?.vehicleId === 'string';

    if (hasMeter && hasVehicle) {
      throw new BadRequestException(
        'Payload must include either meterId or vehicleId, not both',
      );
    }

    if (hasMeter) {
      const dto = await this.validateDto(MeterIngestDto, body);
      await this.ingestionService.ingestMeter(dto);
      return { status: 'ok', type: 'meter' };
    }

    if (hasVehicle) {
      const dto = await this.validateDto(VehicleIngestDto, body);
      await this.ingestionService.ingestVehicle(dto);
      return { status: 'ok', type: 'vehicle' };
    }

    throw new BadRequestException('Payload must include meterId or vehicleId');
  }

  private async validateDto<T extends object>(
    dtoClass: new () => T,
    payload: Record<string, any>,
  ): Promise<T> {
    const dto = plainToInstance(dtoClass, payload);
    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return dto;
  }
}
