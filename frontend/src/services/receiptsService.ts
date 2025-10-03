import { authFetch } from './shared';

export interface Receipt {
  _id: string;
  originalFilename: string;
  status: string;
  vendorName?: string;
  grossAmount?: number;
  taxAmount?: number;
  netAmount?: number;
  category?: string;
  currency?: string;
  documentDate?: string;
  relatedLedgerEntryId?: string;
  createdAt: string;
  extractedText?: string;
  extractionFields?: { key: string; value: any; confidence?: number; source?: string }[];
}

const base = '/api/receipts';

export const receiptsService = {
  async list(): Promise<Receipt[]> {
    const res = await authFetch(base);
    if (!res.ok) throw new Error('Failed to fetch receipts');
    const data = await res.json();
    return data.data || [];
  },
  async upload(file: File, meta?: { currency?: string; documentDate?: string }) {
    const form = new FormData();
    form.append('file', file);
    if (meta?.currency) form.append('currency', meta.currency);
    if (meta?.documentDate) form.append('documentDate', meta.documentDate);
    const res = await authFetch(base + '/upload', { method: 'POST', body: form });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Upload failed');
    return data.data as Receipt;
  },
  async ocr(id: string) {
    const res = await authFetch(`${base}/${id}/ocr`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'OCR failed');
    return data.data as Receipt;
  },
  async classify(id: string) {
    const res = await authFetch(`${base}/${id}/classify`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Classification failed');
    return data.data as Receipt;
  },
  async approve(id: string, overrides?: Partial<Pick<Receipt,'vendorName'|'grossAmount'|'taxAmount'|'netAmount'|'category'>>) {
    const res = await authFetch(`${base}/${id}/approve`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(overrides || {}) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Approval failed');
    return data.data.receipt as Receipt;
  }
};

export default receiptsService;
