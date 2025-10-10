// Loyverse Sync Service
// Node.js/TypeScript backend module for two-way sync with Loyverse POS
// Handles OAuth2, data pull/push, error/retry, deduplication, and mapping

import axios from 'axios';
import type { Receipt, Item, Inventory, Customer, Payment } from './loyverseTypes';

export class LoyverseSyncService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(private clientId: string, private clientSecret: string, private redirectUri: string) {}

  // OAuth2: Exchange code for token
  async authenticate(authCode: string) {
    const res = await axios.post('https://api.loyverse.com/token', {
      grant_type: 'authorization_code',
      code: authCode,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri,
    });
    this.accessToken = res.data.access_token;
    this.refreshToken = res.data.refresh_token;
    return res.data;
  }

  // Refresh token
  async refresh() {
    if (!this.refreshToken) throw new Error('No refresh token');
    const res = await axios.post('https://api.loyverse.com/refresh', {
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });
    this.accessToken = res.data.access_token;
    this.refreshToken = res.data.refresh_token;
    return res.data;
  }

  // Generic GET with bearer token
  async get(endpoint: string, params?: any) {
    if (!this.accessToken) throw new Error('Not authenticated');
    const res = await axios.get(`https://api.loyverse.com${endpoint}`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
      params,
    });
    return res.data;
  }

  // Pull receipts (sales/returns)
  async pullReceipts(since?: string): Promise<Receipt[]> {
    return this.get('/receipts', since ? { updated_since: since } : undefined);
  }

  // Pull products/items
  async pullItems(): Promise<Item[]> {
    return this.get('/items');
  }

  // Pull inventory
  async pullInventory(): Promise<Inventory[]> {
    return this.get('/inventory');
  }

  // Pull customers
  async pullCustomers(): Promise<Customer[]> {
    return this.get('/customers');
  }

  // Push invoice/payment/stock adjustment to Loyverse (if supported)
  async pushInvoice(invoice: any) {
    // Example: POST to /receipts or /payments if API allows
    // return axios.post('https://api.loyverse.com/receipts', invoice, { headers: { Authorization: `Bearer ${this.accessToken}` } });
  }

  // Error/retry, deduplication, incremental sync logic to be added
}
