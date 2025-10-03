# Digital Shoebox Architecture (Receipt Intelligence Pipeline)

Status: v1 (Synchronous MVP)  
Target: v2 (Event / Queue Driven, Multi-source, Observable)

## 1. Purpose
Provide an automated pipeline turning raw receipt artifacts (images / PDFs / chat uploads) into structured accounting entries (draft ledger postings) with auditability, Malaysian tax compliance (SST), and real‑time user feedback.

## 2. Scope
In-scope components:
- Receipt ingestion (web upload now; future: Telegram, POS email forward, API, mobile capture)
- OCR text extraction abstraction
- AI / heuristic classification (amounts, vendor, tax inference, category mapping)
- Human review & approval UI (Digital Shoebox page)
- Automatic double‑entry draft ledger posting
- Real-time notifications for lifecycle changes
- Persistence of receipt, extracted fields, classification metadata

Out-of-scope (future docs): document storage encryption, full ML model lifecycle, external DMS integration, advanced fraud detection.

## 3. Current Lifecycle (MVP Flow)
1. Upload (status: `uploaded`)
   - Stored on local filesystem (`/uploads`) with SHA256 hash (dedupe potential)
   - Metadata saved in `Receipt` (companyId, userId, mimeType, size, currency, optional date)
   - Notification: `receipt_uploaded`
2. OCR Trigger (manual) (status: `ocr_processed`)
   - `OcrService.processReceipt` extracts mock text + fields (provider placeholder)
   - Basic field merging, captured provider name
   - Notification: `receipt_ocr_processed`
3. Classification Trigger (manual) (status transitions to `review_pending`)
   - `ReceiptClassificationService.classify` infers vendor, gross, tax (6% SST), net, category
   - Sets `aiModel` plus heuristic values
   - Notification: `receipt_ready_review`
4. Review / Approval (status: `approved` after posting)
   - User may adjust vendor, amounts, category
   - `ReceiptPostingService.postFromReceipt` creates draft ledger journal (expense + tax + cash)
   - Links ledger entry id back to receipt
   - Notification: `receipt_approved`

Sequence Diagram (MVP):
```
User -> API: POST /receipts/upload
API -> ReceiptStore: create receipt (uploaded)
API -> Notifier: receipt_uploaded
User -> API: POST /receipts/:id/ocr
API -> OcrService -> FileSystem
OcrService -> API: receipt (ocr_processed)
API -> Notifier: receipt_ocr_processed
User -> API: POST /receipts/:id/classify
API -> ClassificationService
ClassificationService -> API: receipt (review_pending)
API -> Notifier: receipt_ready_review
User -> API: POST /receipts/:id/approve
API -> PostingService -> LedgerEntry
PostingService -> API: receipt (approved) + ledger draft
API -> Notifier: receipt_approved
```

## 4. Data Model Highlights (`Receipt`)
| Field | Purpose |
|-------|---------|
| status | Lifecycle state machine (`uploaded` -> `ocr_processed` -> `review_pending` -> `approved` / `error`) |
| extractionFields[] | Key-value extraction artifacts with source+confidence |
| extractedText | Raw OCR text (future: truncated or moved to cold storage) |
| grossAmount / taxAmount / netAmount | Monetary classification results (SST tax separated) |
| vendorName | Normalized vendor (inferred) |
| category | Expense category heuristic mapping |
| aiModel / ocrProvider | Traceability of automation sources |
| relatedLedgerEntryId | Link to `LedgerEntry` created |
| errorMessage | Failure reason for `error` state |

## 5. Ledger Posting Logic (Draft)
Splits pattern (expense receipt):
- DR Expense (net)
- DR SST Input Tax (tax) if tax > 0
- CR Cash (gross)  
Ensures balanced double entry; final posting still in `draft` enabling later batch approval / finalization.

## 6. Current Constraints / Limitations
| Area | Limitation | Impact |
|------|-----------|--------|
| OCR | Mock text only | No real extraction accuracy; classification values may need manual correction |
| Classification | Heuristic rules (keywords) | Limited vendor/category coverage & accuracy |
| Concurrency | Fully synchronous HTTP triggers | Upload + OCR + classify steps require manual orchestration |
| Storage | Local disk | Not scalable / multi-instance risk |
| Security | No virus scan / MIME deep validation | Potential unsafe file risk in production |
| Observability | No tracing/metrics per pipeline stage | Hard to measure accuracy & latency |
| Internationalization | MYR only in pipeline | Multi-currency normalization pending |

## 7. v2 Architecture (Event / Queue Driven Plan)
Goal: Decouple stages to improve scalability, resilience, and enable background automation.

Planned Components:
- Ingestion API publishes `receipt.uploaded` event
- Queue / broker (e.g., RabbitMQ, SQS, Redis Streams, or lightweight BullMQ) topics:
  - `receipt.ocr` (work items awaiting OCR)
  - `receipt.classify` (post-OCR classification jobs)
  - `receipt.posting` (auto-post jobs after approval or auto-approval rules)
- Workers:
  - OCR Worker: handles OCR tasks; retries with backoff; moves to error DLQ after N attempts
  - Classification Worker: enriches structured fields, pushes to review queue if confidence < threshold
  - Auto-Posting Worker: posts ledger drafts when receipt flagged auto-approvable (e.g., recurring vendor under threshold)
- Event Bus → Notification Adapter: Emits notifications on meaningful state changes (current logic ported). 
- Optional Rule Engine: Evaluate business rules (spend limit, vendor whitelist) => decide auto-approve vs manual review.

Revised Flow (Async):
```
Upload -> Event(receipt.uploaded)
  -> Queue(receipt.ocr) -> OCR Worker -> Event(receipt.ocr_processed)
    -> Queue(receipt.classify) -> Classification Worker -> Event(receipt.classified)
      -> (Rule) AutoApprove? yes -> Queue(receipt.posting)
                               no -> Status review_pending
Posting Worker -> Event(receipt.posted) -> Notification + ledger link
```

## 8. Evolution Roadmap
| Phase | Feature | Notes |
|-------|---------|-------|
| 1 (done) | Manual pipeline & notifications | Baseline synchronous MVP |
| 2 | Async queue & workers | Introduce BullMQ (Redis) minimal footprint |
| 3 | Real OCR provider integration | Tesseract local or external API (Vision) |
| 4 | ML Assisted classification | Replace heuristics with model inference, add confidence per field |
| 5 | Auto-approval rules engine | Threshold + vendor trust list + anomaly checks |
| 6 | Multi-source ingestion | Telegram, POS (Loyverse), Email forwarding |
| 7 | Observability | Metrics (duration per stage), field accuracy tracking |
| 8 | Security Hardening | Virus scan (ClamAV), content-type sniffing, encryption at rest |

## 9. Key Interfaces (Proposed v2 contracts)
Event Payload Examples:
```jsonc
// receipt.uploaded
{ "id": "<receiptId>", "companyId": "...", "status": "uploaded", "file": { "mimeType": "image/jpeg", "size": 23456 } }
// receipt.ocr_processed
{ "id": "<receiptId>", "status": "ocr_processed", "textBytes": 1024, "fields": [ { "key": "grossAmount", "value": 123.45, "confidence": 0.82 } ] }
// receipt.classified
{ "id": "<receiptId>", "status": "review_pending", "gross": 123.45, "tax": 7.41, "net": 116.04, "category": "Fuel", "confidence": 0.76 }
// receipt.posted
{ "id": "<receiptId>", "ledgerId": "<journalId>", "status": "approved" }
```

## 10. Reliability & Failure Modes
| Stage | Failure | Current Handling | Future Handling |
|-------|---------|------------------|-----------------|
| OCR | File read error | Status=error | Retry (exponential), DLQ after N tries |
| Classification | Parse error | Status=error | Retry with fallback model/version |
| Posting | Missing amounts | Throws error | Pre-validation guard + auto classification re-run |
| Notification | Socket down | Warn (logged) | Persist + retry worker / backoff |
| Storage | Disk full | Throw | Cloud object store, lifecycle policies |

## 11. Security & Compliance Considerations
- Add file type sniffing vs extension trust.
- Integrate antivirus scanning (queue stage before OCR).
- Encrypted object storage (S3 + SSE) for production.
- PII/Financial data minimization: only store necessary text; consider redaction of card numbers.
- Audit trail already captures actions; extend with event correlation IDs.

## 12. Observability Plan
Metrics (Prometheus-ready counters / histograms):
- `receipt_ingest_total{companyId}`
- `receipt_stage_duration_seconds{stage}` (upload→ocr, ocr→classify, classify→review, review→post)
- `receipt_field_confidence{field}` (classification ML phase)
- `receipt_errors_total{stage,reason}`
Logs: structured JSON with `receiptId`, `stage`, `latencyMs`, `correlationId`.
Tracing: optional OpenTelemetry spans per stage in v2.

## 13. Open Design Decisions
| Topic | Options | Preliminary Choice |
|-------|---------|--------------------|
| Queue backend | BullMQ (Redis) / RabbitMQ / SQS | BullMQ for simplicity |
| OCR engine | Tesseract local / Cloud Vision API | Start Tesseract local, allow provider switch ENV |
| ML model hosting | Local ONNX / External API | Start rules + optionally external API feature flag |
| Auto-approval rules | Custom code / Rule engine (json-rules-engine) | JSON config → later DSL |

## 14. ENV / Config Additions (Planned)
| Variable | Purpose | Default |
|----------|---------|---------|
| OCR_PROVIDER | Select OCR implementation | mock |
| AI_MODEL | Classification model tag | rules_v1 |
| QUEUE_DRIVER | Choose queue backend | memory (sync) |
| REDIS_URL | BullMQ connection | redis://localhost:6379 |
| AUTO_APPROVE_MAX_AMOUNT | Threshold for auto posting | 200.00 |
| ENABLE_RECEIPT_NOTIFICATIONS | Toggle receipt notifications | true |

## 15. Next Implementation Steps (Actionable)
1. Introduce config schema validation (zod) for new ENV (#37).  
2. Add queue abstraction interface (in-memory impl first).  
3. Refactor OCR/classify/post endpoints to enqueue jobs and return 202 Accepted.  
4. Worker loop to poll/process in background (later separate process).  
5. Add metrics counters + simple latency logging.  
6. Real OCR integration (provider switch).  
7. Add confidence & accuracy tracking fields to `Receipt`.  
8. Implement rule-based auto-approval (flag receipts for posting worker).  
9. Expand ingestion (Telegram, POS) publishing `receipt.uploaded`.  
10. Documentation updates & diagrams in README.

## 16. Diagram (Textual)
```
[Upload API] -> (Store File + Receipt Doc) -> [Event: receipt.uploaded]
   -> [Queue: receipt.ocr] -> [OCR Worker] -> update receipt -> Event -> [Queue: receipt.classify]
      -> [Classification Worker] -> update receipt -> (rule) -> review_pending OR [Queue: receipt.posting]
         -> [Posting Worker] -> LedgerEntry.create -> update receipt (approved) -> Notification
```

## 17. Summary
The current synchronous pipeline is a correct minimal foundation. This document defines a clear migration path toward a resilient, observable, and extensible event-driven architecture supporting multiple ingestion channels and automated decisioning while maintaining Malaysian accounting compliance.

---
Maintainer: Architecture WG  
Last Updated: 2025-10-03
