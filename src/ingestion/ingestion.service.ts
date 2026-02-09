import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { MeterIngestDto } from './dto/meter-ingest.dto';
import { VehicleIngestDto } from './dto/vehicle-ingest.dto';

@Injectable()
export class IngestionService {
  constructor(private readonly db: DbService) {}

  async ingestMeter(dto: MeterIngestDto): Promise<void> {
    await this.db.query(
      `INSERT INTO meter_readings (meter_id, kwh_consumed_ac, voltage, ts)
       VALUES ($1, $2, $3, $4)`,
      [dto.meterId, dto.kwhConsumedAc, dto.voltage, dto.timestamp],
    );

    await this.db.query(
      `INSERT INTO meter_latest (meter_id, kwh_consumed_ac, voltage, ts)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (meter_id) DO UPDATE SET
         kwh_consumed_ac = EXCLUDED.kwh_consumed_ac,
         voltage = EXCLUDED.voltage,
         ts = EXCLUDED.ts,
         updated_at = now()
       WHERE EXCLUDED.ts >= meter_latest.ts`,
      [dto.meterId, dto.kwhConsumedAc, dto.voltage, dto.timestamp],
    );
  }

  async ingestVehicle(dto: VehicleIngestDto): Promise<void> {
    await this.db.query(
      `INSERT INTO vehicle_readings (vehicle_id, soc, kwh_delivered_dc, battery_temp, ts)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        dto.vehicleId,
        dto.soc,
        dto.kwhDeliveredDc,
        dto.batteryTemp,
        dto.timestamp,
      ],
    );

    await this.db.query(
      `INSERT INTO vehicle_latest (vehicle_id, soc, kwh_delivered_dc, battery_temp, ts)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (vehicle_id) DO UPDATE SET
         soc = EXCLUDED.soc,
         kwh_delivered_dc = EXCLUDED.kwh_delivered_dc,
         battery_temp = EXCLUDED.battery_temp,
         ts = EXCLUDED.ts,
         updated_at = now()
       WHERE EXCLUDED.ts >= vehicle_latest.ts`,
      [
        dto.vehicleId,
        dto.soc,
        dto.kwhDeliveredDc,
        dto.batteryTemp,
        dto.timestamp,
      ],
    );
  }
}
