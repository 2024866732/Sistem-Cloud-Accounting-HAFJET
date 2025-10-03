import { useState } from 'react';

interface LHDNEInvoiceProps {
  invoiceId: string;
  onSuccess?: (result: string) => void;
  onError?: (error: string) => void;
}

interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

interface SubmissionResult {
  uuid: string;
  status: 'Valid' | 'Invalid';
  submissionDateTime: string;
  message: string;
}

interface ServiceInfo {
  environment: string;
  apiUrl: string;
  authenticated: boolean;
  clientId: string;
}

export default function LHDNEInvoiceManager({ invoiceId, onSuccess, onError }: LHDNEInvoiceProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [serviceInfo, setServiceInfo] = useState<ServiceInfo | null>(null);

  // Validate invoice for LHDN compliance
  const validateInvoice = async () => {
    setIsValidating(true);
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/validate-einvoice`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setValidationResult(data.data);
        if (data.data.valid) {
          onSuccess?.(`Invoice ${invoiceId} is LHDN compliant`);
        } else {
          onError?.(`Validation failed: ${data.data.errors?.join(', ')}`);
        }
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Validation failed';
      onError?.(errorMessage);
      setValidationResult({ valid: false, errors: [errorMessage] });
    } finally {
      setIsValidating(false);
    }
  };

  // Submit invoice to LHDN E-Invoice system
  const submitToLHDN = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/submit-einvoice`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setSubmissionResult(data.data);
        onSuccess?.(`E-Invoice submitted successfully. UUID: ${data.data.uuid}`);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Submission failed';
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get E-Invoice status from LHDN
  const getEInvoiceStatus = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/einvoice-status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setSubmissionResult(prev => prev ? { ...prev, ...data.data } : data.data);
        onSuccess?.(`Status updated: ${data.data.status}`);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get status';
      onError?.(errorMessage);
    }
  };

  // Get LHDN service information
  const getServiceInfo = async () => {
    try {
      const response = await fetch('/api/invoices/lhdn/service-info', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setServiceInfo(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get service info';
      onError?.(errorMessage);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">LHDN E-Invoice Management</h3>
        <div className="flex space-x-2">
          <button
            onClick={getServiceInfo}
            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
          >
            Service Info
          </button>
          {submissionResult && (
            <button
              onClick={getEInvoiceStatus}
              className="px-3 py-1 text-sm text-green-600 hover:text-green-800"
            >
              Refresh Status
            </button>
          )}
        </div>
      </div>

      {/* Service Information */}
      {serviceInfo && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">LHDN Service Status</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Environment:</span>
              <span className="ml-2 font-medium">{serviceInfo.environment}</span>
            </div>
            <div>
              <span className="text-blue-700">Authentication:</span>
              <span className={`ml-2 font-medium ${serviceInfo.authenticated ? 'text-green-600' : 'text-red-600'}`}>
                {serviceInfo.authenticated ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Validation Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-700">Step 1: Validate Invoice</h4>
          <button
            onClick={validateInvoice}
            disabled={isValidating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isValidating ? 'Validating...' : 'Validate for LHDN'}
          </button>
        </div>

        {validationResult && (
          <div className={`p-4 rounded-lg ${validationResult.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center">
              {validationResult.valid ? (
                <div className="flex items-center text-green-700">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Invoice is LHDN compliant</span>
                </div>
              ) : (
                <div className="text-red-700">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Validation failed</span>
                  </div>
                  {validationResult.errors && (
                    <ul className="mt-2 ml-7 list-disc list-inside text-sm">
                      {validationResult.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Submission Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-700">Step 2: Submit to LHDN</h4>
          <button
            onClick={submitToLHDN}
            disabled={isSubmitting || (validationResult && !validationResult.valid)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit E-Invoice'}
          </button>
        </div>

        {submissionResult && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <h5 className="font-medium text-green-900 mb-3">Submission Result</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-green-700">UUID:</span>
                <span className="ml-2 font-mono font-medium">{submissionResult.uuid}</span>
              </div>
              <div>
                <span className="text-green-700">Status:</span>
                <span className={`ml-2 font-medium ${submissionResult.status === 'Valid' ? 'text-green-600' : 'text-red-600'}`}>
                  {submissionResult.status}
                </span>
              </div>
              <div className="md:col-span-2">
                <span className="text-green-700">Submission Time:</span>
                <span className="ml-2 font-medium">
                  {new Date(submissionResult.submissionDateTime).toLocaleString()}
                </span>
              </div>
              <div className="md:col-span-2">
                <span className="text-green-700">Message:</span>
                <span className="ml-2">{submissionResult.message}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Information Section */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h5 className="font-medium text-gray-700 mb-2">About LHDN E-Invoice</h5>
        <p className="text-sm text-gray-600 mb-2">
          The Lembaga Hasil Dalam Negeri (LHDN) E-Invoice system is mandatory for Malaysian businesses.
          This feature ensures your invoices comply with Malaysian tax regulations.
        </p>
        <div className="text-xs text-gray-500">
          <p>• Currently running in sandbox mode for testing</p>
          <p>• Production mode requires valid LHDN API credentials</p>
          <p>• All submitted invoices are validated against UBL 2.1 standards</p>
        </div>
      </div>
    </div>
  );
}