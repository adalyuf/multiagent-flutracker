import React from 'react'

const cardStyle = {
  background: '#1a1a2e',
  borderRadius: 8,
  padding: '16px 20px',
  border: '1px solid #2a2a4a',
  textAlign: 'center',
}

export default function KpiCards({ data }) {
  if (!data) return null

  const cards = [
    { label: 'Total Sequences', value: data.total_sequences?.toLocaleString() || '0' },
    { label: 'Countries', value: data.countries || 0 },
    { label: 'Unique Clades', value: data.unique_clades || 0 },
    { label: 'Dominant Clade', value: data.dominant_clade || '—' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
      {cards.map(c => (
        <div key={c.label} style={cardStyle}>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f59e0b' }}>{c.value}</div>
          <div style={{ fontSize: '0.75rem', color: '#888', marginTop: 4 }}>{c.label}</div>
        </div>
      ))}
    </div>
  )
}
