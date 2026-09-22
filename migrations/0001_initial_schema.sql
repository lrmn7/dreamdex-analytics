-- Migration 0001: Initial D1 Schema for dreamDEX Analytics Hub
-- Explicitly separates spot order book liquidity, SomniaLend assets, and Event Contracts.

CREATE TABLE IF NOT EXISTS markets (
  id TEXT PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  base_currency TEXT NOT NULL,
  quote_currency TEXT NOT NULL,
  base_address TEXT NOT NULL,
  quote_address TEXT NOT NULL,
  contract_address TEXT NOT NULL,
  stop_registry_address TEXT,
  base_decimals INTEGER NOT NULL,
  quote_decimals INTEGER NOT NULL,
  tick_size TEXT NOT NULL,
  lot_size TEXT NOT NULL,
  min_quantity TEXT NOT NULL,
  maker_fee_bps INTEGER DEFAULT 0,
  taker_fee_bps INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  discovered_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS market_snapshots_1m (
  timestamp INTEGER NOT NULL,
  market_id TEXT NOT NULL,
  price REAL NOT NULL,
  mid_price REAL NOT NULL,
  spread REAL NOT NULL,
  spread_bps REAL NOT NULL,
  volume_1m REAL DEFAULT 0,
  trade_count_1m INTEGER DEFAULT 0,
  bid_depth_05 REAL DEFAULT 0,
  ask_depth_05 REAL DEFAULT 0,
  bid_depth_1 REAL DEFAULT 0,
  ask_depth_1 REAL DEFAULT 0,
  PRIMARY KEY (market_id, timestamp)
);

CREATE INDEX IF NOT EXISTS idx_snapshots_1m_timestamp ON market_snapshots_1m(timestamp);

CREATE TABLE IF NOT EXISTS market_snapshots_1h (
  timestamp INTEGER NOT NULL,
  market_id TEXT NOT NULL,
  open REAL NOT NULL,
  high REAL NOT NULL,
  low REAL NOT NULL,
  close REAL NOT NULL,
  volume_1h REAL DEFAULT 0,
  trade_count_1h INTEGER DEFAULT 0,
  avg_spread_bps REAL DEFAULT 0,
  avg_bid_depth_1 REAL DEFAULT 0,
  avg_ask_depth_1 REAL DEFAULT 0,
  PRIMARY KEY (market_id, timestamp)
);

CREATE INDEX IF NOT EXISTS idx_snapshots_1h_timestamp ON market_snapshots_1h(timestamp);

CREATE TABLE IF NOT EXISTS market_snapshots_1d (
  timestamp INTEGER NOT NULL,
  market_id TEXT NOT NULL,
  open REAL NOT NULL,
  high REAL NOT NULL,
  low REAL NOT NULL,
  close REAL NOT NULL,
  volume_1d REAL DEFAULT 0,
  trade_count_1d INTEGER DEFAULT 0,
  avg_spread_bps REAL DEFAULT 0,
  avg_depth_usd REAL DEFAULT 0,
  PRIMARY KEY (market_id, timestamp)
);

CREATE INDEX IF NOT EXISTS idx_snapshots_1d_timestamp ON market_snapshots_1d(timestamp);

CREATE TABLE IF NOT EXISTS protocol_snapshots_1m (
  timestamp INTEGER PRIMARY KEY,
  spot_liquidity REAL NOT NULL,
  spot_volume_24h REAL NOT NULL,
  spot_trade_count_24h INTEGER NOT NULL,
  active_markets INTEGER NOT NULL,
  indexed_event_count INTEGER DEFAULT 0,
  methodology_version TEXT DEFAULT 'v1.0'
);

CREATE TABLE IF NOT EXISTS protocol_events_recent (
  id TEXT PRIMARY KEY,
  block_number INTEGER NOT NULL,
  transaction_hash TEXT NOT NULL,
  log_index INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  market_id TEXT NOT NULL,
  order_id TEXT NOT NULL,
  wallet_address TEXT,
  payload_json TEXT NOT NULL,
  block_timestamp INTEGER NOT NULL,
  indexed_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_market ON protocol_events_recent(market_id, block_timestamp);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON protocol_events_recent(block_timestamp);

CREATE TABLE IF NOT EXISTS event_contract_snapshots (
  timestamp INTEGER NOT NULL,
  market_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  status TEXT NOT NULL,
  time_to_close_ms INTEGER NOT NULL,
  up_price REAL NOT NULL,
  down_price REAL NOT NULL,
  volume REAL DEFAULT 0,
  trade_count INTEGER DEFAULT 0,
  PRIMARY KEY (market_id, timestamp)
);

CREATE TABLE IF NOT EXISTS lend_reserve_snapshots (
  timestamp INTEGER NOT NULL,
  asset TEXT NOT NULL,
  token_address TEXT NOT NULL,
  supplied_usd REAL NOT NULL,
  borrowed_usd REAL NOT NULL,
  available_liquidity_usd REAL NOT NULL,
  utilization_rate REAL NOT NULL,
  supply_apy REAL NOT NULL,
  borrow_apy REAL NOT NULL,
  PRIMARY KEY (asset, timestamp)
);

CREATE TABLE IF NOT EXISTS data_health_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,
  started_at INTEGER NOT NULL,
  completed_at INTEGER NOT NULL,
  status TEXT NOT NULL,
  latency_ms INTEGER NOT NULL,
  item_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at INTEGER NOT NULL
);
