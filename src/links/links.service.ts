import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { LinkDto } from './dto/link.dto';

@Injectable()
export class LinksService {
  constructor(private readonly db: DbService) {}

  async upsertLink(dto: LinkDto): Promise<void> {
    await this.db.query(
      `INSERT INTO vehicle_meter_links (vehicle_id, meter_id)
       VALUES ($1, $2)
       ON CONFLICT (vehicle_id) DO UPDATE SET
         meter_id = EXCLUDED.meter_id,
         linked_at = now()`,
      [dto.vehicleId, dto.meterId],
    );
  }
}
