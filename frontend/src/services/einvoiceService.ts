import api from './api'

export interface EInvoiceDoc {
  id: string
  issueDate: string
  issueTime: string
  invoiceType: '01' | '02' | '03' | '11' | '12'
  invoiceNumber: string
  currencyCode: string
  
  supplier: {
    tin: string
    idType: string
    idValue: string
    registrationName: string
    businessRegistrationNumber?: string
    email?: string
    address: {
      addressLine1: string
      city: string
      postcode: string
      state: string
      country: string
    }
  }
  
  buyer: {
    tin?: string
    idType: string
    idValue: string
    registrationName: string
    email?: string
    address: {
      addressLine1: string
      city: string
      postcode: string
      state: string
      country: string
    }
  }
  
  invoiceLineItems: Array<{
    classification: string
    productName: string
    quantity: number
    unitPrice: number
    measurement: string
    totalExcludingTax: number
    taxType: string
    taxRate: number
    taxAmount: number
    totalIncludingTax: number
  }>
  
  taxSummary: Array<{
    taxType: string
    taxableAmount: number
    taxRate: number
    taxAmount: number
  }>
  
  totalExcludingTax: number
  totalIncludingTax: number
  totalTaxAmount: number
  totalPayableAmount: number
}

export interface SubmissionResult {
  uuid: string
  submissionUid: string
  status: 'Valid' | 'Invalid' | 'Submitted' | 'Cancelled'
  submissionDateTime: string
}

export interface ValidationResult {
  valid: boolean
  errors?: string[]
}

class EInvoiceService {
  async getServiceInfo() {
    const response = await api.get('/einvoice/service-info')
    return response.data.data
  }

  async submitEInvoice(invoice: EInvoiceDoc): Promise<SubmissionResult> {
    const response = await api.post('/einvoice/submit', invoice)
    return response.data.data
  }

  async getInvoiceStatus(uuid: string) {
    const response = await api.get(`/einvoice/status/${uuid}`)
    return response.data.data
  }

  async validateInvoice(invoice: EInvoiceDoc): Promise<ValidationResult> {
    const response = await api.post('/einvoice/validate', invoice)
    return response.data.data
  }

  async getSampleInvoice(): Promise<EInvoiceDoc> {
    const response = await api.get('/einvoice/sample')
    return response.data.data
  }

  getMalaysianStates() {
    return [
      { code: '01', name: 'Johor' },
      { code: '02', name: 'Kedah' },
      { code: '03', name: 'Kelantan' },
      { code: '04', name: 'Melaka' },
      { code: '05', name: 'Negeri Sembilan' },
      { code: '06', name: 'Pahang' },
      { code: '07', name: 'Pulau Pinang' },
      { code: '08', name: 'Perak' },
      { code: '09', name: 'Perlis' },
      { code: '10', name: 'Selangor' },
      { code: '11', name: 'Terengganu' },
      { code: '12', name: 'Sabah' },
      { code: '13', name: 'Sarawak' },
      { code: '14', name: 'W.P. Kuala Lumpur' },
      { code: '15', name: 'W.P. Labuan' },
      { code: '16', name: 'W.P. Putrajaya' }
    ]
  }

  formatCurrency(amount: number, currency = 'MYR'): string {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }
}

export const einvoiceService = new EInvoiceService()
export default einvoiceService