import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { SkeletonChart } from './Skeleton'

function resolveColor(colorScale, key) {
  if (typeof colorScale === 'function') return colorScale(key)
  return colorScale?.[key] || '#666'
}

export default function StackedAreaChart({
  data,
  keys,
  colorScale,
  xAccessor,
  yAccessor,
  seriesAccessor,
  title,
  headerAction = null,
  ariaLabel = '',
  icon = null,
}) {
  const svgRef = useRef()

  useEffect(() => {
    if (!data || data.length === 0 || !keys || keys.length === 0) return

    const width = 440
    const height = 200
    const margin = { top: 12, right: 10, bottom: 32, left: 48 }

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.attr('viewBox', `0 0 ${width} ${height}`)

    const dateStrings = [...new Set(data.map((d) => String(xAccessor(d))))].sort()
    const matrix = dateStrings.map((dateStr) => {
      const row = { date: new Date(dateStr) }
      keys.forEach((k) => {
        row[k] = 0
      })
      return row
    })
    const rowByDate = Object.fromEntries(dateStrings.map((d, i) => [d, matrix[i]]))

    data.forEach((point) => {
      const dateStr = String(xAccessor(point))
      const key = seriesAccessor(point)
      const row = rowByDate[dateStr]
      if (row && keys.includes(key)) {
        row[key] = yAccessor(point)
      }
    })

    const stacked = d3.stack().keys(keys)(matrix)

    const x = d3.scaleTime()
      .domain(d3.extent(matrix, (d) => d.date))
      .range([margin.left, width - margin.right])

    const y = d3.scaleLinear()
      .domain([0, d3.max(stacked[stacked.length - 1] || [[0, 0]], (d) => d[1]) || 1])
      .range([height - margin.bottom, margin.top])

    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(5))
      .style('color', '#636a88')
      .selectAll('text').style('font-family', 'var(--font-mono)').style('font-size', '0.5rem')

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(4).tickFormat(d3.format('.2s')))
      .style('color', '#636a88')
      .selectAll('text').style('font-family', 'var(--font-mono)').style('font-size', '0.5rem')

    const area = d3.area()
      .x((_, i) => x(matrix[i].date))
      .y0((d) => y(d[0]))
      .y1((d) => y(d[1]))
      .curve(d3.curveMonotoneX)

    svg.selectAll('.layer')
      .data(stacked)
      .join('path')
      .attr('class', 'layer')
      .attr('d', area)
      .attr('fill', (d) => resolveColor(colorScale, d.key))
      .attr('opacity', 0.8)
  }, [colorScale, data, keys, seriesAccessor, xAccessor, yAccessor])

  if (!data || data.length === 0) {
    return <SkeletonChart height={160} />
  }

  return (
    <div className="card-analytics fade-in-up" style={{ padding: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <h3 style={{
          fontSize: '0.75rem',
          color: 'var(--text-primary)',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          {icon}
          {title}
        </h3>
        {headerAction}
      </div>
      <svg
        ref={svgRef}
        style={{ width: '100%', height: 'auto' }}
        role="img"
        aria-label={ariaLabel || title}
      />
      {/* HTML legend — flush right */}
      {keys && keys.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          gap: '4px 10px',
          marginTop: 6,
        }}>
          {keys.map((key) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: resolveColor(colorScale, key),
                flexShrink: 0,
              }} />
              <span style={{
                fontSize: '0.52rem',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-display)',
                whiteSpace: 'nowrap',
              }}>
                {key}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
