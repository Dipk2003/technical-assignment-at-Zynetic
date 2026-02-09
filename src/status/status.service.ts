import { Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from '../db/db.service';

@Injectable()
export class StatusService {
  constructor(private readonly db: DbService) {}

  async getVehicleStatus(vehicleId: string) {
    const result = await this.db.query(
      `SELECT vehicle_id, soc, kwh_delivered_dc, battery_temp, ts, updated_at
       FROM vehicle_latest
       WHERE vehicle_id = $1`,
      [vehicleId],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException('Vehicle not found');
    }

    return result.rows[0];
  }

  async getMeterStatus(meterId: string) {
    const result = await this.db.query(
      `SELECT meter_id, kwh_consumed_ac, voltage, ts, updated_at
       FROM meter_latest
       WHERE meter_id = $1`,
      [meterId],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException('Meter not found');
    }

    return result.rows[0];
  }
}
