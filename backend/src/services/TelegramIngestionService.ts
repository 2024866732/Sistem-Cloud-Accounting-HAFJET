import axios from 'axios';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Receipt from '../models/Receipt';
import NotificationService from './NotificationService';
import { config } from '../config/config';

interface TelegramFileInfo {
  file_id: string;
  file_unique_id: string;
  file_size?: number;
  file_path?: string;
}

export class TelegramIngestionService {
  private botToken?: string;
  private uploadDir: string;
  private allowedChats: Set<string>;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN;
    this.uploadDir = process.env.UPLOAD_PATH || './uploads';
    this.allowedChats = new Set((process.env.TELEGRAM_ALLOWED_CHAT_IDS || '').split(',').map(s => s.trim()).filter(Boolean));
  }

  isEnabled() {
    return !!this.botToken;
  }

  isChatAllowed(chatId: string) {
    if (this.allowedChats.size === 0) return true; // open if not specified
    return this.allowedChats.has(chatId);
  }

  private async fetchFileMeta(fileId: string): Promise<TelegramFileInfo | null> {
    if (!this.botToken) return null;
    const url = `https://api.telegram.org/bot${this.botToken}/getFile?file_id=${fileId}`;
    const res = await axios.get(url);
    if (!res.data.ok) return null;
    return res.data.result as TelegramFileInfo;
  }

  private async downloadFile(filePathRel: string): Promise<Buffer | null> {
    if (!this.botToken) return null;
    const fileUrl = `https://api.telegram.org/file/bot${this.botToken}/${filePathRel}`;
    const res = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    return Buffer.from(res.data);
  }

  async ingestPhotoMessage(message: any, companyId: string, userId?: string) {
    if (!this.botToken) throw new Error('Telegram bot not configured');
    if (!message.photo || !Array.isArray(message.photo) || message.photo.length === 0) return null;
    const best = message.photo[message.photo.length - 1];
    const meta = await this.fetchFileMeta(best.file_id);
    if (!meta || !meta.file_path) throw new Error('Failed to resolve Telegram file');
    const buffer = await this.downloadFile(meta.file_path);
    if (!buffer) throw new Error('Empty file');

    if (!fs.existsSync(this.uploadDir)) fs.mkdirSync(this.uploadDir, { recursive: true });
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    const ext = path.extname(meta.file_path) || '.jpg';
    const filename = Date.now() + '-tg-' + hash.slice(0,8) + ext;
    const fullPath = path.join(this.uploadDir, filename);
    fs.writeFileSync(fullPath, buffer);

    const receipt = await Receipt.create({
      companyId,
      userId,
      originalFilename: filename,
      storagePath: path.relative(process.cwd(), fullPath),
      mimeType: 'image/jpeg',
      size: buffer.length,
      hash,
      status: 'uploaded',
      meta: { source: 'telegram', chatId: message.chat?.id }
    });

    await NotificationService.sendCompanyNotification(String(companyId), {
      type: 'receipt_uploaded',
      title: 'Resit Telegram',
      message: 'Resit diterima melalui Telegram',
      priority: 'low',
      companyId: String(companyId),
      data: { receiptId: String(receipt._id), source: 'telegram' }
    });
    return receipt;
  }

  async ingestDocumentMessage(message: any, companyId: string, userId?: string) {
    if (!this.botToken) throw new Error('Telegram bot not configured');
    const doc = message.document;
    if (!doc) return null;
    // Basic mime allowlist (expand as needed)
    const allowed = ['application/pdf','image/jpeg','image/png'];
    const mime = doc.mime_type || 'application/octet-stream';
    if (!allowed.includes(mime)) {
      throw new Error('Unsupported document type');
    }
    const meta = await this.fetchFileMeta(doc.file_id);
    if (!meta || !meta.file_path) throw new Error('Failed to resolve Telegram document file');
    const buffer = await this.downloadFile(meta.file_path);
    if (!buffer) throw new Error('Empty document file');

    if (!fs.existsSync(this.uploadDir)) fs.mkdirSync(this.uploadDir, { recursive: true });
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    const ext = path.extname(meta.file_path) || (mime === 'application/pdf' ? '.pdf' : '.bin');
    const filename = Date.now() + '-tgdoc-' + hash.slice(0,8) + ext;
    const fullPath = path.join(this.uploadDir, filename);
    fs.writeFileSync(fullPath, buffer);

    const receipt = await Receipt.create({
      companyId,
      userId,
      originalFilename: doc.file_name || filename,
      storagePath: path.relative(process.cwd(), fullPath),
      mimeType: mime,
      size: buffer.length,
      hash,
      status: 'uploaded',
      meta: { source: 'telegram', chatId: message.chat?.id, telegramDocument: true }
    });

    await NotificationService.sendCompanyNotification(String(companyId), {
      type: 'receipt_uploaded',
      title: 'Dokumen Telegram',
      message: 'Dokumen resit diterima melalui Telegram',
      priority: 'low',
      companyId: String(companyId),
      data: { receiptId: String(receipt._id), source: 'telegram', kind: 'document' }
    });
    return receipt;
  }
}

export const telegramIngestionService = new TelegramIngestionService();
export default telegramIngestionService;