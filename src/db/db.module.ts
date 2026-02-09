import { Global, Module } from '@nestjs/common';
import { Pool, PoolConfig } from 'pg';
import { PG_POOL } from './db.constants';
import { DbService } from './db.service';

const isProduction =
  process.env.NODE_ENV === 'production' ||
  process.env.RENDER === 'true' ||
  Boolean(process.env.RENDER_SERVICE_ID);

const parseBool = (value?: string): boolean | undefined => {
  if (!value) {
    return undefined;
  }
  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }
  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }
  return undefined;
};

const parsePositiveInt = (value?: string): number | undefined => {
  if (!value) {
    return undefined;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

const resolveConnectionString = (): string => {
  const baseUrl = process.env.DATABASE_URL;
  const poolerUrl = process.env.DATABASE_POOL_URL;
  const usePooler = parseBool(process.env.USE_DATABASE_POOLER);

  if (poolerUrl && usePooler !== false) {
    return poolerUrl;
  }
  if (!baseUrl) {
    throw new Error('DATABASE_URL or DATABASE_POOL_URL is not set');
  }
  return baseUrl;
};

const buildPoolConfig = (): PoolConfig => {
  const rawConnectionString = resolveConnectionString();
  const url = new URL(rawConnectionString);

  const sslMode =
    url.searchParams.get('sslmode') ??
    process.env.PGSSLMODE ??
    (isProduction ? 'require' : undefined);
  const useLibpqCompat =
    url.searchParams.get('uselibpqcompat') ?? (isProduction ? 'true' : undefined);

  if (sslMode && !url.searchParams.has('sslmode')) {
    url.searchParams.set('sslmode', sslMode);
  }
  if (useLibpqCompat && !url.searchParams.has('uselibpqcompat')) {
    url.searchParams.set('uselibpqcompat', useLibpqCompat);
  }

  const poolConfig: PoolConfig = {
    connectionString: url.toString(),
  };

  if (sslMode && sslMode !== 'disable') {
    const rejectUnauthorized =
      sslMode === 'verify-full' || sslMode === 'verify-ca';
    poolConfig.ssl = { rejectUnauthorized };
  }

  const max = parsePositiveInt(process.env.PG_POOL_MAX);
  if (max) {
    poolConfig.max = max;
  }

  const idleTimeoutMillis = parsePositiveInt(process.env.PG_IDLE_TIMEOUT_MS);
  if (idleTimeoutMillis) {
    poolConfig.idleTimeoutMillis = idleTimeoutMillis;
  }

  const connectionTimeoutMillis = parsePositiveInt(
    process.env.PG_CONN_TIMEOUT_MS,
  );
  if (connectionTimeoutMillis) {
    poolConfig.connectionTimeoutMillis = connectionTimeoutMillis;
  }

  return poolConfig;
};

@Global()
@Module({
  providers: [
    {
      provide: PG_POOL,
      useFactory: () => new Pool(buildPoolConfig()),
    },
    DbService,
  ],
  exports: [DbService],
})
export class DbModule {}
