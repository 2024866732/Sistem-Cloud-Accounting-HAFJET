import { Request, Response, NextFunction } from 'express';

// Permission taxonomy (expand as needed)
export type Permission =
  | 'invoice.create'
  | 'invoice.view'
  | 'invoice.submit_einvoice'
  | 'reports.view'
  | 'ledger.view'
  | 'ledger.post'
  | 'tax.manage'
  | 'notifications.view'
  | 'reconciliation.manage'
  | 'reconciliation.view'
  | 'admin.manage_users'
  | 'system.metrics'
  | 'audit.view'
  | 'receipt.ocr'   // trigger OCR processing
  | 'receipt.classify' // trigger AI classification (future)
  | 'receipt.review'   // approve/post receipts (future)
  | 'pos.sync'
  ;

// Role -> permissions mapping
const rolePermissions: Record<string, Permission[]> = {
  admin: [
    'invoice.create','invoice.view','invoice.submit_einvoice',
    'reports.view','ledger.view','ledger.post','tax.manage',
    'notifications.view','reconciliation.manage','reconciliation.view',
  'admin.manage_users','system.metrics','audit.view','receipt.ocr','receipt.classify','receipt.review','pos.sync'
  ],
  finance: [
    'invoice.create','invoice.view','invoice.submit_einvoice',
    'reports.view','ledger.view','ledger.post','reconciliation.manage','reconciliation.view','notifications.view','receipt.ocr','receipt.classify','receipt.review','pos.sync'
  ],
  staff: [
    'invoice.create','invoice.view','notifications.view','receipt.ocr'
  ],
  viewer: [
    'invoice.view','reports.view','ledger.view','notifications.view'
  ]
};

export const authorize = (required: Permission | Permission[]) => {
  const needed = Array.isArray(required) ? required : [required];
  return (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const perms = rolePermissions[req.user.role] || [];
    const missing = needed.filter(p => !perms.includes(p));
    if (missing.length) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions', missing });
    }
    return next();
  };
};

export const listRolePermissions = () => rolePermissions;

export default authorize;