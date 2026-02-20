import React from 'react'
import { cladeColors } from '../utils/colors'
import { Link } from 'react-router-dom'
import StackedAreaChart from './StackedAreaChart'

const cladeIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--violet)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
  </svg>
)

export default function CladeTrends({ data }) {
  const clades = [...new Set((data || []).map((d) => d.clade))]

  return <StackedAreaChart
    data={data}
    keys={clades}
    colorScale={cladeColors}
    xAccessor={(d) => d.date}
    yAccessor={(d) => d.count}
    seriesAccessor={(d) => d.clade}
    title="Clade Trends (1 year)"
    ariaLabel="Stacked area chart showing clade trends over time"
    icon={cladeIcon}
    headerAction={<Link to="/genomics" style={{
      fontSize: '0.72rem',
      color: 'var(--accent-cyan-dim)',
      textDecoration: 'none',
      fontWeight: 500,
      transition: 'color 0.15s ease',
      display: 'flex',
      alignItems: 'center',
      gap: 4,
    }}>
      Genomics
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </Link>}
  />
}
