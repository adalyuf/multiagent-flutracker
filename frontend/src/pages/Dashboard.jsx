import React, { useState } from 'react'
import { api } from '../api'
import { useApi } from '../hooks/useApi'
import AlertBar from '../components/AlertBar'
import ChoroplethMap from '../components/ChoroplethMap'
import HistoricalChart from '../components/HistoricalChart'
import CladeTrends from '../components/CladeTrends'
import SubtypeTrends from '../components/SubtypeTrends'
import CountryTable from '../components/CountryTable'
import ErrorBoundary from '../components/ErrorBoundary'
import { SkeletonKpi, SkeletonChart, SkeletonTable } from '../components/Skeleton'

function ErrorCard({ message }) {
  return (
    <div className="card" style={{ color: '#f87171', fontSize: '0.85rem' }}>
      {message}
    </div>
  )
}

/* ── Trend Arrow SVG ── */
function TrendArrow({ up, size = 10 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" style={{ flexShrink: 0 }}>
      {up ? (
        <path d="M5 1L9 6H1L5 1Z" fill="currentColor" />
      ) : (
        <path d="M5 9L1 4H9L5 9Z" fill="currentColor" />
      )}
    </svg>
  )
}

/* ── Mini Bar Chart ── */
function MiniBarChart({ value, max, color, width = 80, height = 4 }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div style={{
      width,
      height,
      background: 'rgba(255,255,255,0.04)',
      borderRadius: height / 2,
      overflow: 'hidden',
    }}>
      <div style={{
        width: `${pct}%`,
        height: '100%',
        background: color,
        borderRadius: height / 2,
        transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      }} />
    </div>
  )
}

/* ── KPI Card ── */
function KpiCard({ label, value, subtitle, accentClass = 'kpi-cyan', trend, trendLabel, icon, className = '' }) {
  const trendUp = trend > 0
  const trendColor = trendUp ? 'var(--danger)' : 'var(--success)'
  const hasTrend = trend != null && Number.isFinite(trend)

  return (
    <div className={`kpi-card ${accentClass} ${className}`}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header row: icon + label */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 6,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            {icon && (
              <div style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {icon}
              </div>
            )}
            <span style={{
              fontSize: '0.62rem',
              color: 'var(--text-muted)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              {label}
            </span>
          </div>
          {hasTrend && (
            <div className="badge" style={{
              background: trendUp ? 'var(--danger-glow)' : 'var(--success-glow)',
              color: trendColor,
              fontSize: '0.58rem',
            }}>
              <TrendArrow up={trendUp} size={7} />
              {Math.abs(trend).toFixed(1)}%
            </div>
          )}
        </div>

        {/* Main value */}
        <div className="mono" style={{
          fontSize: '1.3rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
        }}>
          {value ?? '\u2014'}
        </div>

        {/* Subtitle / secondary metric */}
        {subtitle && (
          <div style={{
            fontSize: '0.6rem',
            color: 'var(--text-muted)',
            marginTop: 4,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.01em',
          }}>
            {subtitle}
          </div>
        )}

        {/* Trend label */}
        {trendLabel && (
          <div style={{
            fontSize: '0.58rem',
            color: 'var(--text-dim)',
            marginTop: 2,
          }}>
            {trendLabel}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Small stat inline ── */
function StatChip({ label, value, color = 'var(--text-secondary)' }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '6px 0',
    }}>
      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', minWidth: 70 }}>{label}</span>
      <span className="mono" style={{ fontSize: '0.82rem', fontWeight: 600, color }}>{value}</span>
    </div>
  )
}

/* ── Icons (inline SVGs for KPI cards) ── */
const IconGlobe = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)

const IconFlag = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--indigo)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" />
  </svg>
)

const IconActivity = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
)

const IconTrending = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
)

export default function Dashboard() {
  const [selectedCountry, setSelectedCountry] = useState('')
  const { data: summary, error: summaryError } = useApi(() => api.summary(), [])
  const { data: mapData, error: mapError } = useApi(() => api.mapData(), [])
  const historicalParams = selectedCountry ? `country=${selectedCountry}` : ''
  const { data: historical, error: historicalError } = useApi(
    () => api.historical(historicalParams),
    [selectedCountry],
  )
  const forecastParams = selectedCountry ? `country=${selectedCountry}` : ''
  const { data: forecast, error: forecastError } = useApi(
    () => api.forecast(forecastParams),
    [selectedCountry],
  )
  const { data: subtypes, error: subtypesError } = useApi(() => api.subtypes(), [])
  const { data: countries, error: countriesError } = useApi(() => api.countries(), [])
  const { data: anomalies, error: anomaliesError } = useApi(() => api.anomalies(), [])
  const { data: cladeTrends, error: cladeTrendsError } = useApi(() => api.genomicTrends(), [])

  const weekChangePct = summary?.week_change_pct
  const weekUp = weekChangePct >= 0

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 24 }}>
      <ErrorBoundary><AlertBar anomalies={anomalies} loadError={anomaliesError} /></ErrorBoundary>

      {/* ── KPI Cards ── */}
      {summaryError ? (
        <div style={{ padding: '16px 24px' }}>
          <ErrorCard message="Failed to load summary data — please refresh." />
        </div>
      ) : (
        <div className="grid-kpi">
          {summary ? (
            <>
              <KpiCard
                label="Total Cases"
                value={summary.total_cases?.toLocaleString()}
                subtitle="cumulative reported"
                icon={IconGlobe}
                accentClass="kpi-cyan"
                className="fade-in-up stagger-1"
              />
              <KpiCard
                label="Countries Reporting"
                value={summary.countries_reporting}
                subtitle="actively reporting"
                icon={IconFlag}
                accentClass="kpi-indigo"
                className="fade-in-up stagger-2"
              />
              <KpiCard
                label="This Week"
                value={summary.current_week_cases?.toLocaleString()}
                subtitle="new cases reported"
                icon={IconActivity}
                accentClass="kpi-amber"
                className="fade-in-up stagger-3"
              />
              <KpiCard
                label="Week Change"
                value={`${weekUp ? '+' : ''}${weekChangePct?.toFixed(1)}%`}
                subtitle="vs previous week"
                icon={IconTrending}
                accentClass={weekUp ? 'kpi-danger' : 'kpi-success'}
                trendLabel={weekUp ? 'Cases increasing' : 'Cases decreasing'}
                className="fade-in-up stagger-4"
              />
            </>
          ) : (
            <>
              <SkeletonKpi />
              <SkeletonKpi />
              <SkeletonKpi />
              <SkeletonKpi />
            </>
          )}
        </div>
      )}

      {/* ── Situation Overview ── */}
      <div className="section-header">
        <div className="section-header__title">Situation Overview</div>
        {selectedCountry && (
          <button
            onClick={() => setSelectedCountry('')}
            className="section-header__action"
            style={{ background: 'none', border: 'none', fontFamily: 'inherit' }}
          >
            Clear filter: {selectedCountry}
          </button>
        )}
      </div>

      <div className="grid-hero">
        {mapError ? (
          <ErrorCard message="Failed to load map data — please refresh." />
        ) : (
          <ErrorBoundary>
            <ChoroplethMap
              data={mapData}
              selectedCountry={selectedCountry}
              onSelectCountry={setSelectedCountry}
            />
          </ErrorBoundary>
        )}
        {historicalError ? (
          <ErrorCard message="Failed to load historical data — please refresh." />
        ) : (
          <ErrorBoundary>
            <HistoricalChart
              data={historical}
              country={selectedCountry}
              forecast={forecastError ? null : forecast}
              forecastUnavailable={!!forecastError}
            />
          </ErrorBoundary>
        )}
      </div>

      {/* ── Trends ── */}
      <div className="section-header">
        <div className="section-header__title">Trend Analysis</div>
      </div>
      <div className="grid-half">
        {cladeTrendsError ? (
          <ErrorCard message="Failed to load clade trend data — please refresh." />
        ) : (
          <ErrorBoundary><CladeTrends data={cladeTrends} /></ErrorBoundary>
        )}
        {subtypesError ? (
          <ErrorCard message="Failed to load subtype data — please refresh." />
        ) : (
          <ErrorBoundary><SubtypeTrends data={subtypes} /></ErrorBoundary>
        )}
      </div>

      {/* ── Country Analytics ── */}
      <div className="section-header">
        <div className="section-header__title">Country Analytics</div>
        {countries && (
          <span style={{
            fontSize: '0.68rem',
            color: 'var(--text-dim)',
            fontFamily: 'var(--font-mono)',
          }}>
            {countries.length} countries
          </span>
        )}
      </div>
      <div style={{ padding: '0 24px' }}>
        {countriesError ? (
          <ErrorCard message="Failed to load country data — please refresh." />
        ) : countries ? (
          <ErrorBoundary>
            <CountryTable
              data={countries}
              selectedCountry={selectedCountry}
              onSelectCountry={setSelectedCountry}
            />
          </ErrorBoundary>
        ) : (
          <SkeletonTable rows={8} />
        )}
      </div>

      {/* ── Footer ── */}
      <footer style={{
        textAlign: 'center',
        padding: '28px 16px 20px',
        color: 'var(--text-dim)',
        fontSize: '0.65rem',
        borderTop: '1px solid var(--border-subtle)',
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.02em',
        marginTop: 24,
      }}>
        Data: WHO FluNet &bull; Nextstrain &bull; FluTracker is for informational purposes only
      </footer>
    </div>
  )
}
