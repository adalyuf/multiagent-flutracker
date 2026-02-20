import React, { useState } from 'react'
import { severityColor } from '../utils/colors'

function Sparkline({ data, width = 80, height = 22 }) {
  if (!data || data.length < 2) return null
  const max = Math.max(...data, 1)
  const points = data.map((v, i) =>
    `${(i / (data.length - 1)) * width},${height - (v / max) * height}`
  ).join(' ')

  return (
    <svg width={width} height={height} role="img" aria-label="Weekly country trend sparkline">
      <defs>
        <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke="#22d3ee"
        strokeWidth="1.5"
        opacity="0.85"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SeverityMeter({ value }) {
  const color = severityColor(value)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 56,
        height: 5,
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 3,
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${value * 100}%`,
          height: '100%',
          background: color,
          borderRadius: 3,
          transition: 'width 0.3s ease',
          boxShadow: `0 0 6px ${color}40`,
        }} />
      </div>
      <span className="mono" style={{ fontSize: '0.62rem', color: 'var(--text-dim)', minWidth: 24 }}>
        {(value * 100).toFixed(0)}
      </span>
    </div>
  )
}

function SortArrow({ field, sortField, sortDir }) {
  if (field !== sortField) return <span style={{ opacity: 0.25, marginLeft: 4, fontSize: '0.6rem' }}>{'\u2195'}</span>
  return <span style={{ marginLeft: 4, color: 'var(--accent-cyan)', fontSize: '0.6rem' }}>{sortDir === -1 ? '\u25BC' : '\u25B2'}</span>
}

function DeltaBadge({ value }) {
  if (value == null) return null
  const up = value >= 0
  return (
    <span className="badge mono" style={{
      background: up ? 'var(--danger-glow)' : 'var(--success-glow)',
      color: up ? 'var(--danger)' : 'var(--success)',
      fontSize: '0.66rem',
      padding: '1px 6px',
    }}>
      {up ? '\u25B2' : '\u25BC'} {Math.abs(value).toFixed(1)}%
    </span>
  )
}

export default function CountryTable({ data, selectedCountry = '', onSelectCountry = () => {} }) {
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState('total_cases')
  const [sortDir, setSortDir] = useState(-1)

  if (!data) return null

  const filtered = data.filter(r =>
    r.country_code.toLowerCase().includes(search.toLowerCase()) ||
    (r.country_name || '').toLowerCase().includes(search.toLowerCase())
  )

  const sorted = [...filtered].sort((a, b) => {
    return (a[sortField] > b[sortField] ? 1 : -1) * sortDir
  })

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(-sortDir)
    else { setSortField(field); setSortDir(-1) }
  }

  const thClass = (field) => sortField === field ? 'sorted' : ''

  return (
    <div className="card-analytics fade-in-up stagger-5">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        flexWrap: 'wrap',
        gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h3 style={{
            fontSize: '0.85rem',
            color: 'var(--text-primary)',
            fontWeight: 600,
          }}>
            Country Dashboard
          </h3>
          <span className="badge badge-muted">{sorted.length} results</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              id="country-search"
              aria-label="Search countries"
              style={{
                background: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-default)',
                borderRadius: 8,
                padding: '7px 12px 7px 32px',
                fontSize: '0.76rem',
                fontFamily: 'var(--font-display)',
                outline: 'none',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                width: 200,
              }}
              placeholder="Search countries..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={e => {
                e.target.style.borderColor = 'var(--accent-cyan-dim)'
                e.target.style.boxShadow = '0 0 0 3px var(--accent-cyan-glow)'
              }}
              onBlur={e => {
                e.target.style.borderColor = 'var(--border-default)'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>
        </div>
      </div>
      <div style={{ overflowX: 'auto', maxHeight: 440, borderRadius: 8 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 36 }}>#</th>
              <th className={thClass('country_code')} onClick={() => toggleSort('country_code')}>
                Country<SortArrow field="country_code" sortField={sortField} sortDir={sortDir} />
              </th>
              <th className={thClass('total_cases')} onClick={() => toggleSort('total_cases')}>
                Cases<SortArrow field="total_cases" sortField={sortField} sortDir={sortDir} />
              </th>
              <th className={thClass('per_100k')} onClick={() => toggleSort('per_100k')}>
                Per 100k<SortArrow field="per_100k" sortField={sortField} sortDir={sortDir} />
              </th>
              <th className={thClass('delta_pct')} onClick={() => toggleSort('delta_pct')}>
                {'\u0394'} YoY<SortArrow field="delta_pct" sortField={sortField} sortDir={sortDir} />
              </th>
              <th>Trend</th>
              <th>Severity</th>
              <th>Dominant</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => {
              const isSelected = r.country_code === selectedCountry
              return (
                <tr
                  key={r.country_code}
                  className={isSelected ? 'selected' : ''}
                  onClick={() => onSelectCountry(isSelected ? '' : r.country_code)}
                >
                  <td style={{ color: 'var(--text-dim)', fontSize: '0.68rem' }}>{i + 1}</td>
                  <td>
                    <span style={{ fontWeight: 600, letterSpacing: '0.02em' }}>{r.country_code}</span>
                  </td>
                  <td className="mono" style={{ fontWeight: 500 }}>{r.total_cases?.toLocaleString()}</td>
                  <td className="mono">{r.per_100k?.toFixed(1)}</td>
                  <td><DeltaBadge value={r.delta_pct} /></td>
                  <td><Sparkline data={r.sparkline} /></td>
                  <td><SeverityMeter value={r.severity || 0} /></td>
                  <td>
                    <span style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.72rem',
                      fontWeight: 500,
                      padding: '2px 6px',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: 4,
                    }}>
                      {r.dominant_type}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
