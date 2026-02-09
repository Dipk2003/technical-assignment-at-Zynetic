CREATE TABLE IF NOT EXISTS meter_readings (
  id BIGSERIAL PRIMARY KEY,
  meter_id TEXT NOT NULL,
  kwh_consumed_ac DOUBLE PRECISION NOT NULL,
  voltage DOUBLE PRECISION NOT NULL,
  ts TIMESTAMPTZ NOT NULL,
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meter_readings_meter_ts
  ON meter_readings (meter_id, ts DESC);

CREATE TABLE IF NOT EXISTS vehicle_readings (
  id BIGSERIAL PRIMARY KEY,
  vehicle_id TEXT NOT NULL,
  soc DOUBLE PRECISION NOT NULL,
  kwh_delivered_dc DOUBLE PRECISION NOT NULL,
  battery_temp DOUBLE PRECISION NOT NULL,
  ts TIMESTAMPTZ NOT NULL,
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_readings_vehicle_ts
  ON vehicle_readings (vehicle_id, ts DESC);

CREATE TABLE IF NOT EXISTS meter_latest (
  meter_id TEXT PRIMARY KEY,
  kwh_consumed_ac DOUBLE PRECISION NOT NULL,
  voltage DOUBLE PRECISION NOT NULL,
  ts TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vehicle_latest (
  vehicle_id TEXT PRIMARY KEY,
  soc DOUBLE PRECISION NOT NULL,
  kwh_delivered_dc DOUBLE PRECISION NOT NULL,
  battery_temp DOUBLE PRECISION NOT NULL,
  ts TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vehicle_meter_links (
  vehicle_id TEXT PRIMARY KEY,
  meter_id TEXT NOT NULL,
  linked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_meter_links_meter
  ON vehicle_meter_links (meter_id);
