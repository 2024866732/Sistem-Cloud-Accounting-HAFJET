import axios from 'axios'
import type { AxiosResponse } from 'axios'
import type { ApiResponse } from '../types'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth token and redirect to login
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth service
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post<ApiResponse<{ token: string; user: unknown }>>('/auth/login', {
      email,
      password,
    })
    return response.data
  },

  register: async (userData: {
    name: string
    email: string
    password: string
    companyName: string
  }) => {
    const response = await api.post<ApiResponse<{ token: string; user: unknown }>>('/auth/register', userData)
    return response.data
  },

  logout: async () => {
    const response = await api.post<ApiResponse>('/auth/logout')
    localStorage.removeItem('authToken')
    return response.data
  },

  getCurrentUser: async () => {
    const response = await api.get<ApiResponse<unknown>>('/auth/me')
    return response.data
  },
}

// Company service
export const companyService = {
  getProfile: async () => {
    const response = await api.get<ApiResponse<unknown>>('/companies/profile')
    return response.data
  },

  updateProfile: async (companyData: unknown) => {
    const response = await api.put<ApiResponse<unknown>>('/companies/profile', companyData)
    return response.data
  },
}

// Transaction service
export const transactionService = {
  getTransactions: async (params?: {
    page?: number
    limit?: number
    type?: string
    startDate?: string
    endDate?: string
  }) => {
    const response = await api.get<ApiResponse<unknown>>('/transactions', { params })
    return response.data
  },

  createTransaction: async (transactionData: unknown) => {
    const response = await api.post<ApiResponse<unknown>>('/transactions', transactionData)
    return response.data
  },

  updateTransaction: async (id: string, transactionData: unknown) => {
    const response = await api.put<ApiResponse<unknown>>(`/transactions/${id}`, transactionData)
    return response.data
  },

  deleteTransaction: async (id: string) => {
    const response = await api.delete<ApiResponse>(`/transactions/${id}`)
    return response.data
  },
}

// Invoice service
export const invoiceService = {
  getInvoices: async (params?: {
    page?: number
    limit?: number
    status?: string
    startDate?: string
    endDate?: string
  }) => {
    const response = await api.get<ApiResponse<unknown>>('/invoices', { params })
    return response.data
  },

  createInvoice: async (invoiceData: unknown) => {
    const response = await api.post<ApiResponse<unknown>>('/invoices', invoiceData)
    return response.data
  },

  updateInvoice: async (id: string, invoiceData: unknown) => {
    const response = await api.put<ApiResponse<unknown>>(`/invoices/${id}`, invoiceData)
    return response.data
  },

  deleteInvoice: async (id: string) => {
    const response = await api.delete<ApiResponse>(`/invoices/${id}`)
    return response.data
  },

  sendInvoice: async (id: string, method: 'email' | 'whatsapp') => {
    const response = await api.post<ApiResponse>(`/invoices/${id}/send`, { method })
    return response.data
  },

  generatePDF: async (id: string) => {
    const response = await api.get(`/invoices/${id}/pdf`, {
      responseType: 'blob',
    })
    return response.data
  },
}

// E-Invoice service
export const einvoiceService = {
  submitToLHDN: async (invoiceId: string) => {
    const response = await api.post<ApiResponse<unknown>>(`/einvoice/submit/${invoiceId}`)
    return response.data
  },

  getStatus: async (invoiceId: string) => {
    const response = await api.get<ApiResponse<unknown>>(`/einvoice/status/${invoiceId}`)
    return response.data
  },

  cancelEInvoice: async (invoiceId: string, reason: string) => {
    const response = await api.post<ApiResponse>(`/einvoice/cancel/${invoiceId}`, { reason })
    return response.data
  },
}

// Report service
export const reportService = {
  getProfitLoss: async (startDate: string, endDate: string) => {
    const response = await api.get<ApiResponse<unknown>>('/reports/profit-loss', {
      params: { startDate, endDate },
    })
    return response.data
  },

  getBalanceSheet: async (date: string) => {
    const response = await api.get<ApiResponse<unknown>>('/reports/balance-sheet', {
      params: { date },
    })
    return response.data
  },

  getCashFlow: async (startDate: string, endDate: string) => {
    const response = await api.get<ApiResponse<unknown>>('/reports/cash-flow', {
      params: { startDate, endDate },
    })
    return response.data
  },

  getTrialBalance: async (date: string) => {
    const response = await api.get<ApiResponse<unknown>>('/reports/trial-balance', {
      params: { date },
    })
    return response.data
  },

  getAgedReceivables: async (date: string) => {
    const response = await api.get<ApiResponse<unknown>>('/reports/aged-receivables', {
      params: { date },
    })
    return response.data
  },

  getAgedPayables: async (date: string) => {
    const response = await api.get<ApiResponse<unknown>>('/reports/aged-payables', {
      params: { date },
    })
    return response.data
  },
}

// Tax service
export const taxService = {
  calculateSST: async (amount: number) => {
    const response = await api.post<ApiResponse<{ taxAmount: number }>>('/tax/calculate-sst', { amount })
    return response.data
  },

  getTaxRates: async () => {
    const response = await api.get<ApiResponse<unknown>>('/tax/rates')
    return response.data
  },

  updateTaxSettings: async (settings: unknown) => {
    const response = await api.put<ApiResponse<unknown>>('/tax/settings', settings)
    return response.data
  },
}

// Settings service
export const settingsService = {
  // Company settings
  getCompanySettings: async () => {
    const response = await api.get<ApiResponse<unknown>>('/settings/company')
    return response.data
  },

  updateCompanySettings: async (settings: unknown) => {
    const response = await api.put<ApiResponse<unknown>>('/settings/company', settings)
    return response.data
  },

  // Tax settings
  getTaxSettings: async () => {
    const response = await api.get<ApiResponse<unknown>>('/settings/tax')
    return response.data
  },

  updateTaxSettings: async (settings: unknown) => {
    const response = await api.put<ApiResponse<unknown>>('/settings/tax', settings)
    return response.data
  },

  // System settings
  getSystemSettings: async () => {
    const response = await api.get<ApiResponse<unknown>>('/settings/system')
    return response.data
  },

  updateSystemSettings: async (settings: unknown) => {
    const response = await api.put<ApiResponse<unknown>>('/settings/system', settings)
    return response.data
  },

  // User management
  getUsers: async () => {
    const response = await api.get<ApiResponse<unknown>>('/settings/users')
    return response.data
  },

  createUser: async (userData: unknown) => {
    const response = await api.post<ApiResponse<unknown>>('/settings/users', userData)
    return response.data
  },

  updateUser: async (id: string, userData: unknown) => {
    const response = await api.put<ApiResponse<unknown>>(`/settings/users/${id}`, userData)
    return response.data
  },

  deleteUser: async (id: string) => {
    const response = await api.delete<ApiResponse<unknown>>(`/settings/users/${id}`)
    return response.data
  },
}

// Dashboard service
export const dashboardService = {
  getStats: async (startDate?: string, endDate?: string) => {
    const response = await api.get<ApiResponse<unknown>>('/dashboard/stats', {
      params: { startDate, endDate },
    })
    return response.data
  },

  getChartData: async (type: string, startDate?: string, endDate?: string) => {
    const response = await api.get<ApiResponse<unknown>>(`/dashboard/charts/${type}`, {
      params: { startDate, endDate },
    })
    return response.data
  },
}

export default api