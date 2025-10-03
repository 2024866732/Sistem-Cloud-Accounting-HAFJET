import mongoose, { Schema, Document } from 'mongoose'

export interface IExchangeRate extends Document {
  base: string;                 // Typically 'MYR'
  quote: string;                // e.g. 'USD'
  rate: number;                 // quote per 1 base
  provider: string;             // e.g. 'exchangerate.host'
  asOf: Date;                   // timestamp of rate
  fetchedAt: Date;              // when we pulled it
  source?: string;              // raw API source id
  meta?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ExchangeRateSchema = new Schema<IExchangeRate>({
  base: { type: String, required: true },
  quote: { type: String, required: true },
  rate: { type: Number, required: true, min: 0 },
  provider: { type: String, required: true },
  asOf: { type: Date, required: true },
  fetchedAt: { type: Date, required: true },
  source: { type: String },
  meta: { type: Schema.Types.Mixed }
}, { timestamps: true })

// Ensure only one rate per base/quote/asOf (latest override allowed by time if needed)
ExchangeRateSchema.index({ base: 1, quote: 1, asOf: -1 }, { unique: true })
ExchangeRateSchema.index({ quote: 1, asOf: -1 })

export const ExchangeRate = mongoose.model<IExchangeRate>('ExchangeRate', ExchangeRateSchema)
