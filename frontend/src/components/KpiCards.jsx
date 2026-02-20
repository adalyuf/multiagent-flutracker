import React from 'react'

const cardConfigs = [
  { key: 'total_sequences', label: 'Total Sequences', accent: 'kpi-cyan', format: v => v?.toLocaleString() || '0' },
  { key: 'countries', label: 'Countries', accent: 'kpi-indigo', format: v => v || 0 },
  { key: 'unique_clades', label: 'Unique Clades', accent: 'kpi-violet', format: v => v || 0 },
  { key: 'dominant_clade', label: 'Dominant Clade', accent: 'kpi-amber', format: v => v || '\u2014' },
]

const icons = [
  <svg key="seq" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
  <svg key="ctr" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--indigo)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" /></svg>,
  <svg key="cls" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--violet)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>,
  <svg key="dom" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
]

export default function KpiCards({ data }) {
  if (!data) return null

  return (
    <div className="grid-kpi" style={{ padding: 0 }}>
      {cardConfigs.map((c, i) => (
        <div key={c.key} className={`kpi-card ${c.accent} fade-in-up stagger-${i + 1}`}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 6,
            }}>
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
                {icons[i]}
              </div>
              <span style={{
                fontSize: '0.62rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>
                {c.label}
              </span>
            </div>
            <div className="mono" style={{
              fontSize: '1.3rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}>
              {c.format(data[c.key])}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
