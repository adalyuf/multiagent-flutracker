import React from 'react'

const styles = {
  bar: {
    display: 'flex',
    gap: 8,
    padding: '7px 24px',
    background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.03) 100%)',
    borderBottom: '1px solid rgba(239, 68, 68, 0.12)',
    overflowX: 'auto',
    minHeight: 38,
    alignItems: 'center',
  },
  chip: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '3px 12px',
    background: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.15)',
    borderRadius: 20,
    fontSize: '0.74rem',
    whiteSpace: 'nowrap',
    color: '#fca5a5',
    fontFamily: 'var(--font-display)',
    transition: 'background 0.2s ease, border-color 0.2s ease',
  },
  severityText: { fontWeight: 600, color: '#fecaca', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.03em' },
  dot: (severity) => ({
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: severity === 'high' ? '#ef4444' : '#f59e0b',
    boxShadow: severity === 'high' ? '0 0 8px rgba(239, 68, 68, 0.5)' : '0 0 6px rgba(245, 158, 11, 0.3)',
    flexShrink: 0,
  }),
  label: {
    fontSize: '0.65rem',
    color: 'rgba(239, 68, 68, 0.6)',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginRight: 4,
    flexShrink: 0,
    fontFamily: 'var(--font-mono)',
  },
  empty: { fontSize: '0.74rem', color: 'var(--text-dim)' },
}

function severityLabel(severity) {
  const value = String(severity || '').toLowerCase()
  if (value === 'high') return 'High'
  if (value === 'medium') return 'Medium'
  if (value === 'low') return 'Low'
  if (value === 'unknown') return 'Unknown'
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : 'Unknown'
}

export default function AlertBar({ anomalies, loadError }) {
  if (loadError) {
    return (
      <div style={styles.bar} role="region" aria-label="Anomaly alerts">
        <span style={{ ...styles.empty, color: '#f87171' }}>Unable to load anomaly alerts — please refresh.</span>
      </div>
    )
  }

  if (!anomalies || anomalies.length === 0) {
    return (
      <div style={{ ...styles.bar, background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid var(--border-subtle)' }} role="region" aria-label="Anomaly alerts">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success-dim)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <span style={{ ...styles.empty, color: 'var(--text-dim)' }}>No active anomalies</span>
      </div>
    )
  }

  return (
    <div style={styles.bar} role="region" aria-label="Anomaly alerts">
      <span style={styles.label}>Alerts</span>
      {anomalies.map((a, i) => (
        <div key={a.id || i} style={styles.chip}>
          <span style={styles.dot(a.severity)} aria-hidden="true" />
          <span style={styles.severityText}>
            {severityLabel(a.severity)}:
          </span>
          {a.message}
        </div>
      ))}
    </div>
  )
}
