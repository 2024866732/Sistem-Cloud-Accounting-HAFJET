import React from 'react'
import { Calendar, Filter, Download, Share2 } from 'lucide-react'

interface ControlsProps {
  dateRange: string
  onDateRangeChange: (v: string) => void
  selectedReport: string
  onReportChange: (v: string) => void
  exportFormats: { value: string; label: string }[]
  onExport?: () => void
}

export const Controls: React.FC<ControlsProps> = ({ dateRange, onDateRangeChange, selectedReport, onReportChange, exportFormats, onExport }) => {
  return (
  <div className="backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-8" style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--card-foreground))' }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-end">
        <div>
          <label htmlFor="select-date-range" className="block text-white/80 text-sm font-medium mb-2">
            <Calendar className="inline h-4 w-4 mr-2" />
            Date Range
          </label>
          <select id="select-date-range" data-testid="select-date-range" aria-label="Date Range" value={dateRange} onChange={(e) => onDateRangeChange(e.target.value)} className="w-full bg-white/10 border border-white/30 rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="thisYear">This Year</option>
          </select>
        </div>

        <div>
          <label htmlFor="select-report-type" className="block text-white/80 text-sm font-medium mb-2">
            <Filter className="inline h-4 w-4 mr-2" />
            Report Type
          </label>
          <select id="select-report-type" data-testid="select-report-type" aria-label="Report Type" aria-describedby="select-report-type-desc" value={selectedReport} onChange={(e) => onReportChange(e.target.value)} className="w-full bg-white/10 border border-white/30 rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="overview">Overview</option>
            <option value="profit-loss">Profit & Loss</option>
          </select>
          <div id="select-report-type-desc" className="sr-only">Choose the report to display</div>
        </div>

        <div>
          <label htmlFor="select-export-format" className="block text-white/80 text-sm font-medium mb-2">
            <Download className="inline h-4 w-4 mr-2" />
            Export Format
          </label>
          <select id="select-export-format" data-testid="select-export-format" aria-label="Export Format" aria-describedby="select-export-format-desc" className="w-full bg-white/10 border border-white/30 rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            {exportFormats.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <div id="select-export-format-desc" className="sr-only">Select export format for report download</div>
        </div>

        <div className="flex space-x-3 sm:space-x-4">
          {/* a11y: button must have visible text and accessible color contrast */}
          <button data-testid="export-report-button" aria-label="Export report" onClick={() => onExport?.()} className="flex-1 bg-blue-800 text-white py-3 px-3 sm:px-4 rounded-xl font-semibold hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center" type="button">
            <Download className="inline h-5 w-5 mr-2" aria-hidden="true" style={{ color: 'hsl(var(--primary))' }} />
            <span style={{ color: 'hsl(var(--primary-foreground))' }}>Export</span>
          </button>
          {/* a11y: button must have visible text and accessible color contrast */}
          <button aria-label="Share report" className="flex-1 bg-gray-900 text-white py-3 px-3 sm:px-4 rounded-xl font-semibold hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center" type="button">
            <Share2 className="h-5 w-5 mr-2" aria-hidden="true" style={{ color: 'hsl(var(--primary))' }} />
            <span style={{ color: 'hsl(var(--primary-foreground))' }}>Share</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Controls
