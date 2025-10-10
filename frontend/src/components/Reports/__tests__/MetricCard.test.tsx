import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import MetricCard from '../MetricCard'

describe('MetricCard', () => {
  it('renders title and value', () => {
    render(<MetricCard title="Total Revenue" value="RM 1,000" subtitle="Test" />)
    expect(screen.getByRole('group', { name: /Total Revenue/i })).toBeInTheDocument()
    expect(screen.getByText(/RM 1,000/)).toBeInTheDocument()
  })
})
