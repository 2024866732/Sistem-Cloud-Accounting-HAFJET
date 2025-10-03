# Loyverse POS Integration Design

## Objective
Ingest sales and refund data from Loyverse POS into HAFJET Cloud Accounting, normalize it, and post summarized double‑entry ledger transactions with Malaysian tax handling (SST) while preserving item-level analytics.

## Scope (Phase 1 MVP)
- Manual sync endpoint (`POST /api/pos/loyverse/sync`) pulling recent sales & refunds (mock now, real API later).
- Persist normalized sales (type `sale`) and refunds (type `refund`) in `PosSale` collection; upsert `StoreLocation` records.
- Refunds are represented as separate `PosSale` documents with `type="refund"` and optional `originalSaleExternalId` linking back to the original sale external ID (future enrichment will map to internal `_id`).
- Monetary and quantity fields for refunds are stored as negative values (net impact ready for aggregation) while preserving the original absolute amounts implicitly via sign.
- De-duplicate on `externalId` per company (same logic applies to refunds).
- Provide simple metrics (# created / skipped) in response.
- Prepare data for future ledger posting (Phase 2) with refunds already netted at the record level.

## Future Phases
| Phase | Feature | Notes |
|-------|---------|-------|
| 2 | Scheduled polling / webhooks | Use `LOYVERSE_POLL_INTERVAL_SEC` or webhook receiver once available. |
| 2 | Void handling & partial returns | Extend model: partial line refunds, reference linkage via `originalSaleExternalId` and later internal `_id`. |
| 3 | Ledger posting automation | Aggregate daily net sales (sales + refunds) → LedgerEntry (Revenue, Tax Payable, Cash/Undeposited Funds). |
| 3 | Tax mapping logic | Infer taxable vs non-taxable items, compute SST breakdown (support negative tax on refunds). |
| 4 | Inventory COGS posting | Integrate with Inventory module for cost recognition (adjust for returns). |
| 5 | Incremental sync cursors | Store last sync timestamp per company to limit API calls. |

### Early Posting (Implemented MVP Variant)
An initial manual daily posting endpoint is now available:
`POST /api/pos/loyverse/post` body: `{ businessDate: 'YYYY-MM-DD', storeLocationId?, status?: 'draft'|'posted' }`
It aggregates all `PosSale` documents with `status=normalized` for that business date (and optional store) including refunds (negative lines) into a single `LedgerEntry (sourceType=pos_daily)`.
Logic supports negative net days (heavy refunds) by reversing split directions.
Updated model: `PosSale.ledgerEntryId` stores linkage for traceability and original records are marked `status='posted'`.

### Incremental Sync (MVP Implemented)
State model: `PosSyncState` (unique by companyId + provider) holds `lastSyncAt`.
`POST /api/pos/loyverse/sync` behavior:
- Default (no `full` flag): uses `lastSyncAt` to inform future real API cursor usage (mock still returns sample set for now).
- `?full=true` or body `{ full: true }`: ignores existing `lastSyncAt` and performs a full fetch logic (still mock currently) then updates timestamp.
Response now includes:
```
{
  success: true,
  data: { created, skipped, errors, syncState: { lastSyncAt } },
  full: false
}
```
Future real integration: pass `since=lastSyncAt.toISOString()` to provider API.

### Metrics (In-Memory MVP)
Counters exposed at `GET /api/system/metrics` (permission `system.metrics`):
| Counter | Description |
|---------|-------------|
| pos.sync.runs | Total sync executions (any mode) |
| pos.sync.full_runs | Full sync executions (override cursor) |
| pos.sync.incremental_runs | Incremental sync executions |
| pos.sync.created | Newly created PosSale documents |
| pos.sync.skipped | Duplicates skipped |
| pos.sync.errors | Errors during individual sale normalization |
| pos.post.success | Daily posting operations succeeded |
| pos.post.negative_day | Postings with net < 0 (refund heavy) |

Response shape:
```
{
  success: true,
  data: {
    counters: { "pos.sync.created": 2, ... },
    generatedAt: "2025-10-03T12:00:00.000Z"
  }
}
```
Future: persist counters, add Prometheus exporter, add receipt/telegram metrics.

### Prometheus Text Endpoint

For scraping by Prometheus or other metric collectors, enable the plain text endpoint:

1. Set environment variable `METRICS_PROM_ENABLED=true`.
2. Scrape `GET /api/system/metrics/prom` (no auth currently; deploy behind network / auth controls as needed).

Output example:
```
pos_sync_runs 12
pos_sync_errors 1
pos_post_success 4
```

Metric names are sanitized (non-alphanumeric replaced with underscore). Only counters are exposed presently.

### Error Spike Alerting

Set `POS_SYNC_ERROR_ALERT_THRESHOLD` (default 5) to automatically raise a `system_alert` notification when the number of sync errors encountered in a single run reaches or exceeds the threshold. The notification payload includes:

```
{
  type: 'system_alert',
  title: 'POS Sync Error Spike',
  message: 'Detected <delta> POS sync errors in latest run (threshold <threshold>)...'
  data: { delta, threshold, totalErrors }
}
```

Priority escalates to `high` when the delta is at least double the threshold.

This provides an early-warning mechanism for ingestion / API outages without requiring a full external monitoring stack.
### Scheduler (MVP)
Environment Flag: `LOYVERSE_SYNC_SCHEDULER_ENABLED` (default true)
Uses `LOYVERSE_POLL_INTERVAL_SEC` for interval.
Current Implementation:
- Single-company run requiring `DEFAULT_COMPANY_ID` set in environment.
- Simple in-memory lock prevents overlapping executions.
- Increments metrics counters `pos.sync.scheduled_runs` / `pos.sync.scheduled_errors`.
Future Enhancements:
- Multi-company iteration.
- Distributed lock (Redis) when `QUEUE_DRIVER=redis`.
- Backoff on repeated errors & jitter.

## Data Model Mapping
Raw -> Normalized:
```
RawLoyverseSale {
  id, store_id, datetime, currency, items[ { line, name, qty, price, discount, tax } ], refund:boolean, original_sale_id?
}
→ PosSale {
  externalId: id,
  type: 'sale' | 'refund',
  originalSaleExternalId?: original_sale_id,
  storeLocationId (ref),
  saleDateTime: datetime,
  businessDate: UTC date cut,
  totals (gross, discount, tax, net),  // negative when type=refund
  items[] (lineNumber, description, quantity, unitPrice, grossAmount, discountAmount, taxAmount, netAmount) // monetary + quantity negative when type=refund
}
```

## Normalization Logic
1. `grossAmount = qty * price`
2. `netAmount = gross - discount + tax`
3. For refunds (`refund=true`), each per-item monetary field and quantity is multiplied by `-1` (creates naturally nettable dataset).
4. Totals aggregated across (potentially negative) items.
5. `businessDate = UTC(y, m, d)` for consistent daily reporting
6. `hash` ensures deterministic dedupe if external ID not unique (fallback)

## Posting Strategy (Planned)
Per business date per store:
```
Debit: Cash/Undeposited Funds (totalNet)
Credit: Sales Revenue (totalGross - totalDiscount)
Credit: SST Output Tax (totalTax)
Adjust rounding differences into Misc Adjustment account
```
Optionally, group by tax rate when multi-rate emerges.

## API Flow (MVP)
Client -> `POST /api/pos/loyverse/sync` (auth & `pos.sync` permission)
Service:
1. Fetch raw sales (mock list for now)
2. For each sale: skip if exists, else upsert store, normalize & persist
3. Return summary

## Error Handling
- Network/API errors: continue with next sale, increment `errors` counter.
- Duplicate key (externalId): treat as skipped.
- Unexpected schema: log + count error.

## Security & Permissions
- New permission: `pos.sync` (admin, finance roles)
- API key stored in `LOYVERSE_API_KEY` (future real API calls with Authorization header)

## Configuration
| Variable | Default | Purpose |
|----------|---------|---------|
| LOYVERSE_API_KEY | (empty) | Auth key for API requests |
| LOYVERSE_API_URL | https://api.loyverse.com | Base API URL |
| LOYVERSE_POLL_INTERVAL_SEC | 300 | Future polling scheduler interval |

## Testing Strategy
- Unit test service normalization & dedupe.
- Mock axios `get` for future real endpoint.
- Edge cases: empty items, zero tax, duplicate externalId.

## Open Questions
- Partial returns: represent as a refund record containing only returned lines vs full-sale negative mirror? (current approach: full negative record; enhancement: partial line subset)
- How to handle voids distinct from refunds (status vs type)?
- Currency conversion when store currency != company base (introduce FX snapshot usage).

## Sequence (Future with Polling)
```
Scheduler -> LoyversePosService.sync() -> fetch raw -> normalize -> persist -> emit event 'pos.sale.normalized' -> ledger posting consumer aggregates daily -> create LedgerEntry
```

## Observability (Future)
- Add metrics: pos_sales_created, pos_sales_skipped, pos_sales_errors
- Detailed audit log on posting stage

---
Prepared for incremental enhancement while delivering immediate structured storage of POS sales.
