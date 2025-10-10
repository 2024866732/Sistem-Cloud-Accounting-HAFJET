# Loyverse POS API Features & Data Models

## Authentication
- OAuth2 (Authorization Code Grant)
- Bearer token required for all endpoints

## Endpoints
- /token: Get access token
- /refresh: Refresh token
- /stores: List stores
- /receipts: Sales transactions, returns
- /customers: Customer records
- /items: Products
- /inventory: Stock levels
- /payments: Payment records
- /employees: Staff info
- /webhooks: Register for event notifications

## Data Models
- Receipt: id, date, items, payments, customer, store
- Item: id, name, sku, price, stock, category
- Inventory: item_id, store_id, quantity
- Customer: id, name, email, phone, loyalty
- Payment: id, type, amount, receipt_id

## Features
- Pull sales, returns, receipts, products, inventory, customers
- Webhook support for real-time sync
- Pagination, filtering, incremental sync
- Error codes, rate limits

See https://loyverse.com/open-api for full details.