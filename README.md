# High-Scale Energy Ingestion Engine

NestJS + PostgreSQL ingestion service for smart meter and EV telemetry. It separates hot (operational) and cold (historical) data paths, then exposes a 24-hour performance analytics endpoint.

## Quick Start

1. `docker compose up --build`
2. Service listens on `http://localhost:3000`

## Deployment (Render + Supabase)

Render egress is often IPv4-only, while the direct Supabase DB host can be IPv6-only. Use the Supabase connection pooler (PgBouncer) URL in production so the DB resolves over IPv4.

Render env vars:
- `DATABASE_POOL_URL` set to the Supabase pooler connection string (host like `aws-0-<region>.pooler.supabase.com`, port `6543`, include `sslmode=require` and `pgbouncer=true` if provided).
- `USE_DATABASE_POOLER=true` to force pooler usage (optional if `DATABASE_POOL_URL` is set).
- `DATABASE_URL` can remain the direct DB URL for local/dev; the app will prefer `DATABASE_POOL_URL` when present.

## Endpoints

`POST /v1/ingest`
- Polymorphic ingestion. The payload must include either `meterId` or `vehicleId`.

Meter payload:
```json
{
  "meterId": "meter-001",
  "kwhConsumedAc": 1.42,
  "voltage": 230.5,
  "timestamp": "2026-02-09T10:00:00Z"
}
```

Vehicle payload:
```json
{
  "vehicleId": "vehicle-001",
  "soc": 68.2,
  "kwhDeliveredDc": 1.18,
  "batteryTemp": 31.4,
  "timestamp": "2026-02-09T10:00:00Z"
}
```

`PUT /v1/links`
- Links a vehicle to a meter for analytics correlation.
```json
{
  "vehicleId": "vehicle-001",
  "meterId": "meter-001"
}
```

`GET /v1/analytics/performance/:vehicleId`
- Returns 24-hour totals and efficiency ratio (DC/AC).

`GET /v1/status/vehicle/:vehicleId`
- Reads from hot store (`vehicle_latest`).

`GET /v1/status/meter/:meterId`
- Reads from hot store (`meter_latest`).

## Data Model

Hot (operational) tables:
- `vehicle_latest`: latest SoC, battery temp, DC delivered per vehicle.
- `meter_latest`: latest voltage and AC consumed per meter.

Cold (historical) tables:
- `vehicle_readings`: append-only telemetry.
- `meter_readings`: append-only telemetry.

Link table:
- `vehicle_meter_links`: maps a vehicle to its grid-side meter.

## Persistence Strategy (Insert vs Upsert)

Cold path:
- Every heartbeat is inserted into `*_readings` tables.
- This provides a full audit trail for analytics and reporting.

Hot path:
- Latest state is upserted into `*_latest` tables.
- Upsert includes a timestamp guard (`EXCLUDED.ts >= *_latest.ts`) so out-of-order events do not overwrite the most recent state.

## Analytics Query (No Full Table Scan)

The 24-hour performance query is bounded by time and device id:
- `WHERE vehicle_id = $1 AND ts >= now() - interval '24 hours'`
- `WHERE meter_id = $1 AND ts >= now() - interval '24 hours'`

Indexes:
- `idx_vehicle_readings_vehicle_ts (vehicle_id, ts DESC)`
- `idx_meter_readings_meter_ts (meter_id, ts DESC)`

These allow PostgreSQL to use index range scans rather than full table scans.

## Correlation Strategy

The meter stream (AC) and vehicle stream (DC) are correlated via `vehicle_meter_links`. This mirrors a real fleet scenario where a registry or provisioning system knows which vehicle is connected to which meter. The analytics endpoint uses the linked meter to compute AC totals and compare against the vehicle’s DC totals.

## Handling 14.4M+ Records/Day

At 10,000 devices reporting once per minute, each stream produces 14.4M rows/day (28.8M/day across both streams). The design scales by:
- Append-only cold tables (sequential writes).
- Narrow, indexed time-range analytics queries.
- Hot tables for dashboard reads without scanning history.

For production scale, the cold tables can be partitioned by day/month or moved to TimescaleDB hypertables. This keeps retention manageable and queries fast as volume grows.

## Assumptions

- `kwhConsumedAc` and `kwhDeliveredDc` represent per-interval energy. If the devices report cumulative counters, compute deltas between consecutive readings before aggregation.
"# technical-assignment-at-Zynetic" 
