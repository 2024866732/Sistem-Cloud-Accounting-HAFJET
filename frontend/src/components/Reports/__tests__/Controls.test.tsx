import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Controls from '../Controls'

describe('Controls component', () => {
  it('renders select and export button', () => {
    const onDateRangeChange = () => { /* noop for render test */ }
    const onReportChange = () => { /* noop */ }
    render(<Controls dateRange="thisMonth" onDateRangeChange={onDateRangeChange} selectedReport="overview" onReportChange={onReportChange} exportFormats={[{value:'pdf', label:'PDF'}]} />)

  const dateSelect = screen.getByTestId('select-date-range')
  expect(dateSelect).toBeInTheDocument()

  const reportSelect = screen.getByTestId('select-report-type')
  expect(reportSelect).toBeInTheDocument()

  const exportFormatSelect = screen.getByTestId('select-export-format')
  expect(exportFormatSelect).toBeInTheDocument()

  const exportBtn = screen.getByTestId('export-report-button')
  expect(exportBtn).toBeInTheDocument()
  })
})
