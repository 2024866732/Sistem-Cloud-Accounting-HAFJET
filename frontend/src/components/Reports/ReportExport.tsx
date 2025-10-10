import React from 'react';

interface ReportExportProps {
  format: string;
  reportType: string;
  endpoint?: string;
  onStatus?: (status: string) => void;
}

const ReportExport: React.FC<ReportExportProps> = ({ format, reportType, endpoint, onStatus }) => {
  // status is managed by parent via onStatus

  const handleExport = async () => {
    try {
      onStatus?.('Export started');
      const apiUrl = endpoint || `/api/reports/export?type=${reportType}&format=${format}`;
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportType}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      onStatus?.('Export completed');
    } catch {
      onStatus?.('Export failed');
    } finally {
      setTimeout(() => {
        onStatus?.('');
      }, 2500);
    }
  };

  return (
    <button type="button" onClick={handleExport} aria-label="Export report" style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', borderRadius: '1rem', padding: '0.75rem 1.25rem', fontWeight: 600 }}>
      Export
    </button>
  );
};

export default ReportExport;
