import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';
import { PG_POOL } from './db.constants';

@Injectable()
export class DbService implements OnApplicationShutdown {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    return this.pool.query(text, params);
  }

  async onApplicationShutdown() {
    await this.pool.end();
  }
}
