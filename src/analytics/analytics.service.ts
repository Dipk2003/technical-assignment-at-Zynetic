import { Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from '../db/db.service';

export interface PerformanceSummary {
  vehicleId: string;
  meterId: string;
  windowStart: string;
  windowEnd: string;
  totalEnergyConsumedAc: number;
  totalEnergyDeliveredDc: number;
  efficiencyRatio: number | null;
  avgBatteryTemp: number | null;
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly db: DbService) {}

  async getPerformance(vehicleId: string): Promise<PerformanceSummary> {
    const linkResult = await this.db.query<{ meter_id: string }>(
      'SELECT meter_id FROM vehicle_meter_links WHERE vehicle_id = $1',
      [vehicleId],
    );

    if (linkResult.rowCount === 0) {
      throw new NotFoundException(
        'No meter link found for this vehicle. Create a link via /v1/links',
      );
    }

    const meterId = linkResult.rows[0].meter_id;

    const acResult = await this.db.query<{ total_ac: number }>(
      `SELECT COALESCE(SUM(kwh_consumed_ac), 0) AS total_ac
       FROM meter_readings
       WHERE meter_id = $1 AND ts >= now() - interval '24 hours'`,
      [meterId],
    );

    const dcResult = await this.db.query<{
      total_dc: number;
      avg_temp: number | null;
    }>(
      `SELECT COALESCE(SUM(kwh_delivered_dc), 0) AS total_dc,
              AVG(battery_temp) AS avg_temp
       FROM vehicle_readings
       WHERE vehicle_id = $1 AND ts >= now() - interval '24 hours'`,
      [vehicleId],
    );

    const totalAc = Number(acResult.rows[0]?.total_ac ?? 0);
    const totalDc = Number(dcResult.rows[0]?.total_dc ?? 0);
    const avgTemp = dcResult.rows[0]?.avg_temp ?? null;

    return {
      vehicleId,
      meterId,
      windowStart: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      windowEnd: new Date().toISOString(),
      totalEnergyConsumedAc: totalAc,
      totalEnergyDeliveredDc: totalDc,
      efficiencyRatio: totalAc > 0 ? totalDc / totalAc : null,
      avgBatteryTemp: avgTemp === null ? null : Number(avgTemp),
    };
  }
}
