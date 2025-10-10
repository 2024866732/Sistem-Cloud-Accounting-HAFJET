import React from 'react'

interface MetricCardProps {
  title: string
  value: string
  subtitle?: string
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle }) => {
  return (
    <div
      className="backdrop-blur-sm rounded-2xl p-6"
      role="group"
      aria-label={title}
      style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--card-foreground))' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div />
        {/* a11y: use accessible text color for subtitle */}
  <span className="text-sm font-medium" style={{ color: 'hsl(var(--card-foreground))' }}>{subtitle}</span>
      </div>
      {/* a11y: use accessible text color for title */}
  <h3 className="text-sm font-medium" style={{ color: 'hsl(var(--card-foreground))' }}>{title}</h3>
      {/* a11y: use accessible text color for value */}
  <p className="text-2xl font-bold mt-2" style={{ color: 'hsl(var(--card-foreground))' }}>{value}</p>
    </div>
  )
}

export default MetricCard
