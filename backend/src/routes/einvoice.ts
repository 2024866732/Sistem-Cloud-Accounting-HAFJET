import express, { Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth.js'
import { logger } from '../utils/logger.js'
import { notificationService } from '../index.js'
import LHDNEInvoiceService, { EInvoiceDoc } from '../services/EInvoiceService.js'

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    company: string;
  };
}

const router = express.Router()

// Debug marker to verify latest file loaded (remove later)
logger.info('[EINVOICE ROUTE] Loaded updated einvoice.ts at ' + new Date().toISOString())

// Initialize LHDN E-Invoice service
const lhdnService = new LHDNEInvoiceService({
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
})

// Get LHDN service info
router.get('/service-info', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const serviceInfo = lhdnService.getServiceInfo()
    res.json({
      success: true,
      data: serviceInfo,
      message: 'LHDN E-Invoice service information retrieved successfully'
    })
  } catch (error) {
    logger.error('Failed to get service info:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve service information',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Submit E-Invoice to LHDN
router.post('/submit', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const invoiceData: EInvoiceDoc = req.body
    const userId = req.user?.id
    const companyId = req.user?.company

    logger.info(`Submitting E-Invoice to LHDN: ${invoiceData.invoiceNumber}`)

    // Submit to LHDN
    const result = await lhdnService.submitEInvoice(invoiceData)

    // Send notification about submission
    if (notificationService && userId) {
      await notificationService.sendNotification(
        userId,
        `SUCCESS: E-Invoice ${invoiceData.invoiceNumber} submitted to LHDN successfully`
      )
    }

    res.json({
      success: true,
      data: result,
      message: 'E-Invoice submitted to LHDN successfully'
    })

  } catch (error) {
    logger.error('E-Invoice submission failed:', error)
    
    // Send error notification
    if (notificationService && req.user?.id) {
      await notificationService.sendNotification(
        req.user.id,
        `ERROR: Failed to submit E-Invoice: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }

    res.status(500).json({
      success: false,
      message: 'Failed to submit E-Invoice to LHDN',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get E-Invoice status from LHDN
router.get('/status/:uuid', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { uuid } = req.params
    
    logger.info(`Getting E-Invoice status for UUID: ${uuid}`)
    
    const status = await lhdnService.getInvoiceStatus(uuid)
    
    res.json({
      success: true,
      data: status,
      message: 'E-Invoice status retrieved successfully'
    })

  } catch (error) {
    logger.error('Failed to get E-Invoice status:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve E-Invoice status',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Cancel E-Invoice
router.post('/cancel/:uuid', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { uuid } = req.params
    const { reason } = req.body
    const userId = req.user?.id
    const companyId = req.user?.company

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Cancellation reason is required'
      })
    }

    logger.info(`Cancelling E-Invoice UUID: ${uuid}`)
    
    await lhdnService.cancelInvoice(uuid, reason)

    // Send notification about cancellation
    if (notificationService && userId) {
      await notificationService.sendNotification(
        userId,
        `WARNING: E-Invoice ${uuid} has been cancelled`
      )
    }
    
    res.json({
      success: true,
      message: 'E-Invoice cancelled successfully'
    })

  } catch (error) {
    logger.error('Failed to cancel E-Invoice:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to cancel E-Invoice',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Validate E-Invoice data
router.post('/validate', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const invoiceData: EInvoiceDoc = req.body
    
    logger.info(`Validating E-Invoice: ${invoiceData.invoiceNumber}`)
    
    const validation = await lhdnService.validateInvoice(invoiceData)
    
    res.json({
      success: true,
      data: validation,
      message: validation.valid ? 'E-Invoice validation passed' : 'E-Invoice validation failed'
    })

  } catch (error) {
    logger.error('Failed to validate E-Invoice:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to validate E-Invoice',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get sample E-Invoice
router.get('/sample', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sampleInvoice = lhdnService.createSampleInvoice()
    
    res.json({
      success: true,
      data: sampleInvoice,
      message: 'Sample E-Invoice created successfully'
    })

  } catch (error) {
    logger.error('Failed to create sample E-Invoice:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create sample E-Invoice',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get document types
router.get('/document-types', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const documentTypes = await lhdnService.getDocumentTypes()
    
    res.json({
      success: true,
      data: documentTypes,
      message: 'Document types retrieved successfully'
    })

  } catch (error) {
    logger.error('Failed to get document types:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve document types',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get tax types
router.get('/tax-types', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const taxTypes = await lhdnService.getTaxTypes()
    
    res.json({
      success: true,
      data: taxTypes,
      message: 'Tax types retrieved successfully'
    })

  } catch (error) {
    logger.error('Failed to get tax types:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve tax types',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Convert regular invoice to E-Invoice format
router.post('/convert', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { invoiceData } = req.body
    
    if (!invoiceData) {
      return res.status(400).json({
        success: false,
        message: 'Invoice data is required'
      })
    }

    // Convert regular invoice to E-Invoice format
    const eInvoice: EInvoiceDoc = {
      id: invoiceData.id || `CONV-${Date.now()}`,
      issueDate: invoiceData.date || new Date().toISOString().split('T')[0],
      issueTime: new Date().toTimeString().split(' ')[0],
      invoiceType: '01', // Standard Invoice
      invoiceNumber: invoiceData.invoiceNumber || `INV-${Date.now()}`,
      currencyCode: invoiceData.currency || 'MYR',
      
      supplier: {
        tin: process.env.LHDN_TAXPAYER_TIN || '201901234567',
        idType: 'BRN',
        idValue: process.env.LHDN_ID_VALUE || '201901234567',
        registrationName: invoiceData.companyName || 'HAFJET CLOUD ACCOUNTING SDN BHD',
        businessRegistrationNumber: process.env.LHDN_ID_VALUE || '201901234567',
        email: invoiceData.companyEmail || 'accounting@hafjet.com',
        address: {
          addressLine1: invoiceData.companyAddress || 'Level 10, Menara HAFJET',
          city: 'Kuala Lumpur',
          postcode: '55100',
          state: '14', // Kuala Lumpur
          country: 'MY'
        }
      },
      
      buyer: {
        idType: 'BRN',
        idValue: invoiceData.customerTaxId || '199801234567',
        registrationName: invoiceData.customerName || 'Customer SDN BHD',
        email: invoiceData.customerEmail,
        address: {
          addressLine1: invoiceData.customerAddress || 'Customer Address',
          city: invoiceData.customerCity || 'Kuala Lumpur',
          postcode: invoiceData.customerPostcode || '50000',
          state: invoiceData.customerState || '14',
          country: 'MY'
        }
      },
      
      invoiceLineItems: (invoiceData.items || []).map((item: any, index: number) => ({
        classification: item.classification || '85423100',
        productName: item.description || item.name || 'Product/Service',
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || item.price || 0,
        measurement: 'C62', // Unit
        subtotal: (item.quantity || 1) * (item.unitPrice || item.price || 0),
        countryOfOrigin: 'MY',
        totalExcludingTax: (item.quantity || 1) * (item.unitPrice || item.price || 0),
        taxType: item.taxType || 'SST',
        taxRate: item.taxRate || 6.00,
        taxAmount: ((item.quantity || 1) * (item.unitPrice || item.price || 0)) * ((item.taxRate || 6.00) / 100),
        totalIncludingTax: ((item.quantity || 1) * (item.unitPrice || item.price || 0)) * (1 + (item.taxRate || 6.00) / 100)
      })),
      
      taxSummary: [{
        taxType: 'SST',
        taxableAmount: invoiceData.subtotal || 0,
        taxRate: 6.00,
        taxAmount: (invoiceData.subtotal || 0) * 0.06
      }],
      
      totalExcludingTax: invoiceData.subtotal || 0,
      totalIncludingTax: invoiceData.total || 0,
      totalTaxAmount: (invoiceData.subtotal || 0) * 0.06,
      totalPayableAmount: invoiceData.total || 0
    }
    
    res.json({
      success: true,
      data: eInvoice,
      message: 'Invoice converted to E-Invoice format successfully'
    })

  } catch (error) {
    logger.error('Failed to convert invoice:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to convert invoice to E-Invoice format',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get notification settings
router.get('/notifications', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const settings = await lhdnService.getNotificationSettings()
    
    res.json({
      success: true,
      data: settings,
      message: 'Notification settings retrieved successfully'
    })

  } catch (error) {
    logger.error('Failed to get notification settings:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve notification settings',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router