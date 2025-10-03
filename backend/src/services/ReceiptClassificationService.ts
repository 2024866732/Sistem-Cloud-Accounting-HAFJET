import { Receipt } from '../models/Receipt';
import { logger } from '../utils/logger';

/**
 * ReceiptClassificationService
 * Simple rule-based placeholder that:
 *  - Attempts to derive grossAmount from extractionFields or extractedText
 *  - Infers taxAmount at 6% SST if not present and type=expense
 *  - Sets category heuristics based on vendor keywords
 *  - Moves status from ocr_processed -> classified -> review_pending
 */
export class ReceiptClassificationService {
  model: string;
  constructor(model?: string) {
    this.model = model || process.env.AI_MODEL || 'rules_v1';
  }

  private parseAmount(text?: string): number | undefined {
    if (!text) return undefined;
    const matches = text.match(/(RM|MYR)?\s?(\d+[.,]\d{2})/g);
    if (!matches) return undefined;
    const nums = matches.map(m => parseFloat(m.replace(/[^0-9.]/g,'')));
    // Choose largest plausible amount as gross
    return nums.sort((a,b)=>b-a)[0];
  }

  private inferCategory(vendor?: string): string | undefined {
    if (!vendor) return undefined;
    const v = vendor.toLowerCase();
    if (v.includes('shell') || v.includes('petron')) return 'Fuel';
    if (v.includes('grab') || v.includes('tng')) return 'Transport';
    if (v.includes('tesco') || v.includes('lotus') || v.includes('aeon')) return 'Supplies';
    if (v.includes('starbucks') || v.includes('kopi')) return 'Meals & Entertainment';
    return undefined;
  }

  async classify(receiptId: string) {
    const receipt = await Receipt.findById(receiptId);
    if (!receipt) throw new Error('Receipt not found');
    if (receipt.status !== 'ocr_processed') throw new Error('Receipt not ready for classification');

    try {
      const text = receipt.extractedText || '';
      // Extract vendor from first word after mock header (placeholder logic)
      let vendor = receipt.vendorName;
      if (!vendor && text) {
        const parts = text.split(/\s+/).slice(2,8); // skip MOCK_OCR provider tokens
        vendor = parts.find(p => p.length > 3 && /[A-Za-z]/.test(p)) || undefined;
      }

      // Amount heuristics
      let gross = receipt.grossAmount;
      if (!gross) gross = this.parseAmount(text);

      let taxAmount = receipt.taxAmount;
      if (!taxAmount && gross) taxAmount = +(gross * 0.06).toFixed(2); // assume 6% SST placeholder
      let netAmount = receipt.netAmount;
      if (!netAmount && gross && taxAmount !== undefined) netAmount = +(gross - taxAmount).toFixed(2);

      const category = this.inferCategory(vendor) || receipt.category;

      receipt.vendorName = vendor;
      if (gross) receipt.grossAmount = gross;
      if (taxAmount !== undefined) receipt.taxAmount = taxAmount;
      if (netAmount !== undefined) receipt.netAmount = netAmount;
      if (category) receipt.category = category;
      receipt.type = receipt.type || 'expense';
      receipt.aiModel = this.model;
      receipt.status = 'classified';
      // Immediately move to review_pending so UI can show review queue
      receipt.status = 'review_pending';
      await receipt.save();
      return receipt;
    } catch (err: any) {
      logger.error('Receipt classification failed', { err: err.message, receiptId });
      receipt.status = 'error';
      receipt.errorMessage = err.message;
      await receipt.save();
      throw err;
    }
  }
}

export const receiptClassificationService = new ReceiptClassificationService();
export default ReceiptClassificationService;
