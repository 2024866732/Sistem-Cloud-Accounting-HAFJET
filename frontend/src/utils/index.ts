import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency to Malaysian Ringgit
 */
export function formatMYR(amount: number): string {
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format date to Malaysian format (DD/MM/YYYY)
 */
export function formatDateMY(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dateObj)
}

/**
 * Calculate SST (Sales and Service Tax) - 6%
 */
export function calculateSST(amount: number): number {
  return amount * 0.06
}

/**
 * Calculate GST (for historical data) - 6%
 */
export function calculateGST(amount: number): number {
  return amount * 0.06
}

/**
 * Validate Malaysian tax identification number format
 */
export function validateMalaysianTaxNo(taxNo: string): boolean {
  // Basic validation for Malaysian tax number format
  const taxRegex = /^[A-Z0-9]{10,20}$/
  return taxRegex.test(taxNo.toUpperCase())
}

/**
 * Generate invoice number in Malaysian format
 */
export function generateInvoiceNumber(prefix: string = 'INV'): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `${prefix}${year}${month}${random}`
}

/**
 * Format Malaysian business registration number
 */
export function formatSSMNumber(ssmNo: string): string {
  // Format: 201501026187 (YYYYXXXXXXXD)
  return ssmNo.replace(/(\d{4})(\d{8})(\d)/, '$1-$2-$3')
}