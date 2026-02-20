import React from 'react'

export default function GenomicsTable({ data }) {
  if (!data || data.length === 0) return null

  return (
    <div className="card-analytics fade-in-up stagger-2">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
      }}>
        <h3 style={{
          fontSize: '0.85rem',
          color: 'var(--text-primary)',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--indigo)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
          </svg>
          Top Countries by Sequences
        </h3>
        <span className="badge badge-muted">{data.length} countries</span>
      </div>
      <div style={{ overflowX: 'auto', borderRadius: 8 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 36 }}>#</th>
              <th>Country</th>
              <th>Sequences</th>
              <th>Top Clade</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r, i) => (
              <tr key={r.country_code} style={{ cursor: 'default' }}>
                <td style={{ color: 'var(--text-dim)', fontSize: '0.68rem' }}>{i + 1}</td>
                <td style={{ fontWeight: 600, letterSpacing: '0.02em' }}>{r.country_code}</td>
                <td className="mono" style={{ fontWeight: 500 }}>{r.total_sequences?.toLocaleString()}</td>
                <td>
                  <span style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.72rem',
                    fontWeight: 500,
                    padding: '2px 6px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 4,
                  }}>
                    {r.top_clade}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
