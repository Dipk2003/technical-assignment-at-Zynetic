import { Global, Module } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from './db.constants';
import { DbService } from './db.service';

@Global()
@Module({
  providers: [
    {
      provide: PG_POOL,
      useFactory: () => {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
          throw new Error('DATABASE_URL is not set');
        }
        return new Pool({ connectionString });
      },
    },
    DbService,
  ],
  exports: [DbService],
})
export class DbModule {}
