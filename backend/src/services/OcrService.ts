import fs from 'fs';
import path from 'path';
import { Receipt, IReceipt } from '../models/Receipt.js';
import { logger } from '../utils/logger.js';

/**
 * OcrService
 * Abstraction layer for OCR providers. For now, implements a mock/simple extractor:
 *  - If PDF/image: reads file text via placeholder (future: integrate Tesseract or external API)
 *  - Performs naive regex extraction for currency amounts and date patterns
 */
export class OcrService {
  provider: string;
  constructor(provider?: string) {
    this.provider = provider || process.env.OCR_PROVIDER || 'mock';
  }

  async extract(receipt: IReceipt): Promise<{ text: string; fields: { key: string; value: any; confidence?: number; source?: string }[] }> {
    const absolutePath = path.isAbsolute(receipt.storagePath)
      ? receipt.storagePath
      : path.join(process.cwd(), receipt.storagePath);

    let rawBuffer: Buffer;
    try {
      rawBuffer = fs.readFileSync(absolutePath);
    } catch (err) {
      throw new Error('Failed to read receipt file for OCR');
    }

    // MOCK: Convert binary to base64 and pretend it's text length info.
    // In real integration, call Tesseract or external API and return actual extracted text.
    const mockText = `MOCK_OCR provider=${this.provider} file=${path.basename(absolutePath)} size=${rawBuffer.length}`;

    // Naive regex extraction examples
    const fields: { key: string; value: any; confidence?: number; source?: string }[] = [];
    // Amount: look for numbers with 2 decimals
    const amountMatch = mockText.match(/(\d+\.?\d{2})/);
    if (amountMatch) {
      fields.push({ key: 'grossAmount', value: parseFloat(amountMatch[1]), confidence: 0.3, source: 'ocr' });
    }
    // Currency
    fields.push({ key: 'currency', value: receipt.currency || 'MYR', confidence: 0.5, source: 'rule' });

    return { text: mockText, fields };
  }

  async processReceipt(receiptId: string) {
    const receipt = await Receipt.findById(receiptId);
    if (!receipt) throw new Error('Receipt not found');
    if (receipt.status !== 'uploaded') throw new Error('Receipt not in uploaded state');

    try {
      const { text, fields } = await this.extract(receipt);
      receipt.extractedText = text;
      // Merge fields: avoid duplicates by key
      const existingKeys = new Set((receipt.extractionFields || []).map(f => f.key));
      for (const f of fields) {
        if (!existingKeys.has(f.key)) receipt.extractionFields!.push(f as any);
      }
      receipt.status = 'ocr_processed';
      receipt.ocrProvider = this.provider;
      await receipt.save();
      return receipt;
    } catch (err: any) {
      logger.error('OCR processing failed', { err: err.message, receiptId });
      receipt.status = 'error';
      receipt.errorMessage = err.message;
      await receipt.save();
      throw err;
    }
  }
}

export const ocrService = new OcrService();
export default OcrService;
