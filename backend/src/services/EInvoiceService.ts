// LHDN E-Invoice Service for Malaysian Tax Compliance
import axios, { AxiosInstance } from 'axios'
import { logger } from '../utils/logger'

export interface LHDNEInvoiceConfig {
  clientId: string
  clientSecret: string
  environment: 'sandbox' | 'production'
  apiUrl: string
  taxpayerTin: string
  idType: string
  idValue: string
}

export interface EInvoiceDoc {
  id: string
  issueDate: string
  issueTime: string
  invoiceType: '01' | '02' | '03' | '11' | '12' // 01=Invoice, 02=Credit Note, 03=Debit Note, 11=Self-Billed Invoice, 12=Self-Billed Credit Note
  invoiceNumber: string
  originalEInvoiceReference?: string
  currencyCode: string
  exchangeRate?: number
  billFrequency?: string
  billPeriod?: string
  irbmUniqueId?: string
  
  // Supplier Information
  supplier: {
    tin: string
    idType: string
    idValue: string
    registrationName: string
    businessRegistrationNumber?: string
    email?: string
    msicCode?: string
    businessActivityDescription?: string
    address: {
      addressLine1: string
      addressLine2?: string
      addressLine3?: string
      postcode: string
      city: string
      state: string
      country: string
    }
    contact?: string
  }
  
  // Buyer Information
  buyer: {
    tin?: string
    idType: string
    idValue: string
    registrationName: string
    businessRegistrationNumber?: string
    email?: string
    address: {
      addressLine1: string
      addressLine2?: string
      addressLine3?: string
      postcode: string
      city: string
      state: string
      country: string
    }
    contact?: string
  }
  
  // Invoice Line Items
  invoiceLineItems: Array<{
    classification: string
    productName: string
    quantity: number
    unitPrice: number
    measurement: string
    subtotal: number
    countryOfOrigin?: string
    totalExcludingTax: number
    taxType: string
    taxRate: number
    taxAmount: number
    taxDescription?: string
    taxExemptionDetails?: string
    discountRate?: number
    discountAmount?: number
    feeOrChargeRate?: number
    feeOrChargeAmount?: number
    totalIncludingTax: number
  }>
  
  // Payment Information
  paymentInformation?: {
    paymentMode: string
    paymentTerms?: string
    paymentAmount: number
    paymentDate?: string
    paymentReference?: string
    payeeFinancialAccountId?: string
    paymentMethod?: string
  }
  
  // Tax Summary
  taxSummary: Array<{
    taxType: string
    taxableAmount: number
    taxRate: number
    taxAmount: number
  }>
  
  // Totals
  totalExcludingTax: number
  totalIncludingTax: number
  totalTaxAmount: number
  totalPayableAmount: number
  roundingAmount?: number
}

export interface SubmissionResult {
  uuid: string
  submissionUid: string
  status: 'Valid' | 'Invalid' | 'Submitted' | 'Cancelled'
  submissionDateTime: string
  validationResults?: {
    status: string
    errors?: Array<{
      code: string
      message: string
      target?: string
    }>
    warnings?: Array<{
      code: string
      message: string
      target?: string
    }>
  }
  longId?: string
  internalId?: string
}

export class LHDNEInvoiceService {
  private config: LHDNEInvoiceConfig
  private accessToken?: string
  private tokenExpiry?: Date
  private apiClient: AxiosInstance

  constructor(config?: Partial<LHDNEInvoiceConfig>) {
    this.config = {
      clientId: config?.clientId || process.env.LHDN_CLIENT_ID || 'demo_client',
      clientSecret: config?.clientSecret || process.env.LHDN_CLIENT_SECRET || 'demo_secret',
      environment: config?.environment || 'sandbox',
      apiUrl: config?.apiUrl || 'https://preprod-api.myinvois.hasil.gov.my',
      taxpayerTin: config?.taxpayerTin || process.env.LHDN_TAXPAYER_TIN || '201901234567',
      idType: config?.idType || 'BRN',
      idValue: config?.idValue || process.env.LHDN_ID_VALUE || '201901234567'
    }

    this.apiClient = axios.create({
      baseURL: this.config.apiUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

  // TODO: Add retry logic and exponential backoff for production API calls
  // TODO: Implement HTTP circuit breaker to avoid overloading LHDN when it is down

    // Add request interceptor for authentication
    this.apiClient.interceptors.request.use(async (config) => {
      if (!this.accessToken || (this.tokenExpiry && new Date() >= this.tokenExpiry)) {
        await this.authenticate()
      }
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`
      }
      return config
    })
  }

  async authenticate(): Promise<void> {
    try {
      logger.info('Authenticating with LHDN E-Invoice API')
      
      if (this.config.environment === 'sandbox') {
        // Simulate sandbox authentication
        this.accessToken = `sandbox_token_${Date.now()}`
        this.tokenExpiry = new Date(Date.now() + 3600000) // 1 hour
        logger.info('Sandbox authentication successful')
        return
      }

      // Production authentication with LHDN
      const authData = {
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        grant_type: 'client_credentials',
        scope: 'InvoicingAPI'
      }

      const response = await this.apiClient.post('/connect/token', authData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

      this.accessToken = response.data.access_token
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000))
      
      logger.info('LHDN authentication successful')
    } catch (error) {
      logger.error('LHDN authentication failed:', error)
      throw new Error('Failed to authenticate with LHDN E-Invoice API')
    }
  }

  async submitEInvoice(invoice: EInvoiceDoc): Promise<SubmissionResult> {
    try {
      logger.info(`Submitting E-Invoice: ${invoice.invoiceNumber}`)

      // Validate invoice before submission
      const validation = await this.validateInvoice(invoice)
      if (!validation.valid) {
        throw new Error(`Invoice validation failed: ${validation.errors?.join(', ')}`)
      }

      if (this.config.environment === 'sandbox') {
        // Simulate sandbox submission
        const result: SubmissionResult = {
          uuid: `EINV-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          submissionUid: `SUB-${Date.now()}`,
          status: 'Valid',
          submissionDateTime: new Date().toISOString(),
          validationResults: {
            status: 'Valid'
          },
          longId: `LID-${Date.now()}`,
          internalId: invoice.invoiceNumber
        }

        logger.info('E-Invoice submission successful (sandbox):', result)
        return result
      }

      // Production submission to LHDN
      const submissionData = {
        documents: [{
          format: 'JSON',
          document: this.convertToLHDNFormat(invoice),
          documentHash: this.generateDocumentHash(invoice)
        }]
      }

      const response = await this.apiClient.post('/api/v1.0/documentsubmissions', submissionData)
      
      const result: SubmissionResult = {
        uuid: response.data.uuid,
        submissionUid: response.data.submissionUid,
        status: response.data.status,
        submissionDateTime: response.data.submissionDateTime,
        validationResults: response.data.validationResults
      }

      logger.info('E-Invoice submission successful:', result)
      return result

    } catch (error) {
      logger.error('E-Invoice submission failed:', error)
      throw new Error(`Failed to submit E-Invoice: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getInvoiceStatus(uuid: string): Promise<any> {
    try {
      logger.info(`Getting invoice status for UUID: ${uuid}`)

      if (this.config.environment === 'sandbox') {
        return {
          uuid,
          status: 'Valid',
          submissionDateTime: new Date().toISOString(),
          issueDateTime: new Date().toISOString(),
          cancelDateTime: null,
          rejectRequestDateTime: null
        }
      }

      const response = await this.apiClient.get(`/api/v1.0/documents/${uuid}/details`)
      return response.data

    } catch (error) {
      logger.error('Failed to get invoice status:', error)
      throw new Error(`Failed to get invoice status: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async cancelInvoice(uuid: string, reason: string): Promise<void> {
    try {
      logger.info(`Cancelling invoice UUID: ${uuid}`)

      if (this.config.environment === 'sandbox') {
        logger.info('Invoice cancelled successfully (sandbox)')
        return
      }

      await this.apiClient.put(`/api/v1.0/documents/state/${uuid}/state`, {
        status: 'cancelled',
        reason
      })

      logger.info('Invoice cancelled successfully')
    } catch (error) {
      logger.error('Failed to cancel invoice:', error)
      throw new Error(`Failed to cancel invoice: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async validateInvoice(invoice: EInvoiceDoc): Promise<{ valid: boolean; errors?: string[] }> {
    logger.info(`Validating E-Invoice: ${invoice.invoiceNumber}`)

    const errors: string[] = []

    // Basic validation
    if (!invoice.id) errors.push('Invoice ID is required')
    if (!invoice.invoiceNumber) errors.push('Invoice number is required')
    if (!invoice.supplier?.registrationName) errors.push('Supplier name is required')
    if (!invoice.buyer?.registrationName) errors.push('Buyer name is required')
    if (invoice.totalIncludingTax <= 0) errors.push('Total amount must be greater than zero')
    if (invoice.currencyCode !== 'MYR') errors.push('Currency must be MYR for Malaysian invoices')

    // Supplier validation
    if (!invoice.supplier?.tin) errors.push('Supplier TIN is required')
    if (!invoice.supplier?.address?.addressLine1) errors.push('Supplier address is required')
    if (!invoice.supplier?.address?.postcode) errors.push('Supplier postcode is required')
    if (!invoice.supplier?.address?.state) errors.push('Supplier state is required')

    // Buyer validation
    if (!invoice.buyer?.idValue) errors.push('Buyer ID value is required')
    if (!invoice.buyer?.address?.addressLine1) errors.push('Buyer address is required')

    // Line items validation
    if (!invoice.invoiceLineItems || invoice.invoiceLineItems.length === 0) {
      errors.push('At least one invoice line item is required')
    } else {
      invoice.invoiceLineItems.forEach((item, index) => {
        if (!item.productName) errors.push(`Line item ${index + 1}: Product name is required`)
        if (item.quantity <= 0) errors.push(`Line item ${index + 1}: Quantity must be greater than zero`)
        if (item.unitPrice < 0) errors.push(`Line item ${index + 1}: Unit price cannot be negative`)
      })
    }

    // Tax validation
    if (!invoice.taxSummary || invoice.taxSummary.length === 0) {
      errors.push('Tax summary is required')
    }

    const isValid = errors.length === 0

    return {
      valid: isValid,
      errors: errors.length > 0 ? errors : undefined
    }
  }

  private convertToLHDNFormat(invoice: EInvoiceDoc): any {
    // Convert our internal format to LHDN's required JSON format
    return {
      _D: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2",
      _A: "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
      _B: "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
      Invoice: [{
        ID: [{ _: invoice.invoiceNumber }],
        IssueDate: [{ _: invoice.issueDate }],
        IssueTime: [{ _: invoice.issueTime }],
        InvoiceTypeCode: [{ 
          _: invoice.invoiceType,
          listVersionID: "1.0"
        }],
        DocumentCurrencyCode: [{ _: invoice.currencyCode }],
        
        // Add other LHDN format fields...
        AccountingSupplierParty: [{
          Party: [{
            IndustryClassificationCode: [{ _: invoice.supplier.msicCode || "62019" }],
            PartyIdentification: [{
              ID: [{
                _: invoice.supplier.idValue,
                schemeID: invoice.supplier.idType
              }]
            }],
            PartyName: [{
              Name: [{ _: invoice.supplier.registrationName }]
            }],
            PostalAddress: [{
              AddressLine: [
                { Line: [{ _: invoice.supplier.address.addressLine1 }] },
                ...(invoice.supplier.address.addressLine2 ? [{ Line: [{ _: invoice.supplier.address.addressLine2 }] }] : [])
              ],
              CityName: [{ _: invoice.supplier.address.city }],
              PostalZone: [{ _: invoice.supplier.address.postcode }],
              CountrySubentityCode: [{ _: invoice.supplier.address.state }],
              Country: [{
                IdentificationCode: [{ _: invoice.supplier.address.country }]
              }]
            }]
          }]
        }],
        
        AccountingCustomerParty: [{
          Party: [{
            PartyIdentification: [{
              ID: [{
                _: invoice.buyer.idValue,
                schemeID: invoice.buyer.idType
              }]
            }],
            PartyName: [{
              Name: [{ _: invoice.buyer.registrationName }]
            }],
            PostalAddress: [{
              AddressLine: [
                { Line: [{ _: invoice.buyer.address.addressLine1 }] }
              ],
              CityName: [{ _: invoice.buyer.address.city }],
              PostalZone: [{ _: invoice.buyer.address.postcode }],
              CountrySubentityCode: [{ _: invoice.buyer.address.state }],
              Country: [{
                IdentificationCode: [{ _: invoice.buyer.address.country }]
              }]
            }]
          }]
        }],

        InvoiceLine: invoice.invoiceLineItems.map((item, index) => ({
          ID: [{ _: (index + 1).toString() }],
          InvoicedQuantity: [{
            _: item.quantity.toString(),
            unitCode: item.measurement
          }],
          LineExtensionAmount: [{
            _: item.totalExcludingTax.toFixed(2),
            currencyID: invoice.currencyCode
          }],
          Item: [{
            Name: [{ _: item.productName }],
            OriginCountry: [{
              IdentificationCode: [{ _: item.countryOfOrigin || "MY" }]
            }],
            CommodityClassification: [{
              ItemClassificationCode: [{
                _: item.classification,
                listID: "PTC"
              }]
            }]
          }],
          Price: [{
            PriceAmount: [{
              _: item.unitPrice.toFixed(2),
              currencyID: invoice.currencyCode
            }]
          }],
          TaxTotal: [{
            TaxAmount: [{
              _: item.taxAmount.toFixed(2),
              currencyID: invoice.currencyCode
            }],
            TaxSubtotal: [{
              TaxableAmount: [{
                _: item.totalExcludingTax.toFixed(2),
                currencyID: invoice.currencyCode
              }],
              TaxAmount: [{
                _: item.taxAmount.toFixed(2),
                currencyID: invoice.currencyCode
              }],
              TaxCategory: [{
                ID: [{ _: item.taxType }],
                Percent: [{ _: item.taxRate.toString() }],
                TaxScheme: [{
                  ID: [{ 
                    _: item.taxType,
                    schemeID: "UN/ECE 5153",
                    schemeAgencyID: "6"
                  }]
                }]
              }]
            }]
          }]
        })),

        TaxTotal: [{
          TaxAmount: [{
            _: invoice.totalTaxAmount.toFixed(2),
            currencyID: invoice.currencyCode
          }],
          TaxSubtotal: invoice.taxSummary.map(tax => ({
            TaxableAmount: [{
              _: tax.taxableAmount.toFixed(2),
              currencyID: invoice.currencyCode
            }],
            TaxAmount: [{
              _: tax.taxAmount.toFixed(2),
              currencyID: invoice.currencyCode
            }],
            TaxCategory: [{
              ID: [{ _: tax.taxType }],
              Percent: [{ _: tax.taxRate.toString() }],
              TaxScheme: [{
                ID: [{
                  _: tax.taxType,
                  schemeID: "UN/ECE 5153",
                  schemeAgencyID: "6"
                }]
              }]
            }]
          }))
        }],

        LegalMonetaryTotal: [{
          LineExtensionAmount: [{
            _: invoice.totalExcludingTax.toFixed(2),
            currencyID: invoice.currencyCode
          }],
          TaxExclusiveAmount: [{
            _: invoice.totalExcludingTax.toFixed(2),
            currencyID: invoice.currencyCode
          }],
          TaxInclusiveAmount: [{
            _: invoice.totalIncludingTax.toFixed(2),
            currencyID: invoice.currencyCode
          }],
          PayableAmount: [{
            _: invoice.totalPayableAmount.toFixed(2),
            currencyID: invoice.currencyCode
          }]
        }]
      }]
    }
  }

  private generateDocumentHash(invoice: EInvoiceDoc): string {
    // Generate SHA256 hash of the document (simplified for demo)
    const crypto = require('crypto')
    const documentString = JSON.stringify(this.convertToLHDNFormat(invoice))
    return crypto.createHash('sha256').update(documentString).digest('hex')
  }

  createSampleInvoice(): EInvoiceDoc {
    const currentDate = new Date()
    const invoiceNumber = `HAFJET-${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
    
    return {
      id: `${invoiceNumber}-ID`,
      issueDate: currentDate.toISOString().split('T')[0],
      issueTime: currentDate.toTimeString().split(' ')[0],
      invoiceType: '01', // Standard Invoice
      invoiceNumber,
      currencyCode: 'MYR',
      
      supplier: {
        tin: this.config.taxpayerTin,
        idType: this.config.idType,
        idValue: this.config.idValue,
        registrationName: 'HAFJET CLOUD ACCOUNTING SDN BHD',
        businessRegistrationNumber: '201901234567',
        email: 'accounting@hafjet.com',
        msicCode: '62019',
        businessActivityDescription: 'Cloud Accounting Software Services',
        address: {
          addressLine1: 'Level 10, Menara HAFJET',
          addressLine2: 'Jalan Bukit Bintang',
          city: 'Kuala Lumpur',
          postcode: '55100',
          state: '14', // Kuala Lumpur state code
          country: 'MY'
        },
        contact: '+60123456789'
      },
      
      buyer: {
        idType: 'BRN',
        idValue: '199801234567',
        registrationName: 'SAMPLE CUSTOMER SDN BHD',
        businessRegistrationNumber: '199801234567',
        email: 'finance@customer.com',
        address: {
          addressLine1: 'No. 123, Jalan Sample',
          city: 'Petaling Jaya',
          postcode: '47800',
          state: '10', // Selangor state code
          country: 'MY'
        },
        contact: '+60187654321'
      },
      
      invoiceLineItems: [{
        classification: '85423100',
        productName: 'Cloud Accounting Software License (Monthly)',
        quantity: 1,
        unitPrice: 1000.00,
        measurement: 'C62', // Unit
        subtotal: 1000.00,
        countryOfOrigin: 'MY',
        totalExcludingTax: 1000.00,
        taxType: 'SST',
        taxRate: 6.00,
        taxAmount: 60.00,
        taxDescription: 'Service Tax',
        totalIncludingTax: 1060.00
      }],
      
      taxSummary: [{
        taxType: 'SST',
        taxableAmount: 1000.00,
        taxRate: 6.00,
        taxAmount: 60.00
      }],
      
      totalExcludingTax: 1000.00,
      totalIncludingTax: 1060.00,
      totalTaxAmount: 60.00,
      totalPayableAmount: 1060.00
    }
  }

  getServiceInfo() {
    return {
      environment: this.config.environment,
      apiUrl: this.config.apiUrl,
      authenticated: !!this.accessToken,
      tokenExpiry: this.tokenExpiry?.toISOString(),
      taxpayerTin: this.config.taxpayerTin,
      clientId: this.config.clientId
    }
  }

  // Additional helper methods for Malaysian tax compliance
  
  async getDocumentTypes(): Promise<any[]> {
    if (this.config.environment === 'sandbox') {
      return [
        { code: '01', description: 'Invoice' },
        { code: '02', description: 'Credit Note' },
        { code: '03', description: 'Debit Note' },
        { code: '11', description: 'Self-Billed Invoice' },
        { code: '12', description: 'Self-Billed Credit Note' }
      ]
    }
    
    const response = await this.apiClient.get('/api/v1.0/documenttypes')
    return response.data
  }

  async getTaxTypes(): Promise<any[]> {
    if (this.config.environment === 'sandbox') {
      return [
        { code: 'SST', description: 'Sales and Service Tax', rate: 6.0 },
        { code: 'GST', description: 'Goods and Services Tax', rate: 6.0 },
        { code: 'EXEMPT', description: 'Tax Exempt', rate: 0.0 },
        { code: 'ZERO', description: 'Zero Rate', rate: 0.0 }
      ]
    }
    
    const response = await this.apiClient.get('/api/v1.0/taxtypes')
    return response.data
  }

  async getNotificationSettings(): Promise<any> {
    if (this.config.environment === 'sandbox') {
      return {
        emailNotification: true,
        webhookUrl: 'https://your-domain.com/webhook/einvoice',
        notificationTypes: ['submission', 'validation', 'cancellation']
      }
    }
    
    const response = await this.apiClient.get('/api/v1.0/notifications')
    return response.data
  }
}

export default LHDNEInvoiceService