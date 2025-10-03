import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';

export interface ValidationSchemas {
  body?: ZodSchema<any>;
  query?: ZodSchema<any>;
  params?: ZodSchema<any>;
}

const formatZodError = (err: ZodError) => {
  return err.issues.map(issue => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: issue.code
  }));
};

export const validate = (schemas: ValidationSchemas) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        const parsed = schemas.body.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({
            success: false,
            message: 'Validation failed (body)',
            errors: formatZodError(parsed.error)
          });
        }
        req.body = parsed.data;
      }

      if (schemas.query) {
        const parsed = schemas.query.safeParse(req.query);
        if (!parsed.success) {
          return res.status(400).json({
            success: false,
            message: 'Validation failed (query)',
            errors: formatZodError(parsed.error)
          });
        }
        req.query = parsed.data; 
      }

      if (schemas.params) {
        const parsed = schemas.params.safeParse(req.params);
        if (!parsed.success) {
          return res.status(400).json({
            success: false,
            message: 'Validation failed (params)',
            errors: formatZodError(parsed.error)
          });
        }
        req.params = parsed.data; 
      }

      return next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal validation error'
      });
    }
  };
};

export const idParamSchema = z.object({
  id: z.string().min(1, 'ID is required')
});

export const invoiceItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  taxRate: z.number().min(0).max(1).optional(),
  taxType: z.string().optional()
});

export const createInvoiceSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  currency: z.string().default('MYR'),
  items: z.array(invoiceItemSchema).min(1),
  notes: z.string().optional()
});

export const updateInvoiceSchema = createInvoiceSchema.partial();

export default validate;