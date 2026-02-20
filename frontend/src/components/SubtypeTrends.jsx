import React from 'react'
import { subtypeColors } from '../utils/colors'
import StackedAreaChart from './StackedAreaChart'

const subtypeIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 20V10M12 20V4M6 20v-6" />
  </svg>
)

export default function SubtypeTrends({ data }) {
  const subtypes = [...new Set((data || []).map((d) => d.subtype))]

  return <StackedAreaChart
    data={data}
    keys={subtypes}
    colorScale={subtypeColors}
    xAccessor={(d) => d.date}
    yAccessor={(d) => d.cases}
    seriesAccessor={(d) => d.subtype}
    title="Subtype Trends (1 year)"
    ariaLabel="Stacked area chart showing subtype trends over time"
    icon={subtypeIcon}
  />
}
