import React from 'react'

const styles = {
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' },
  th: { textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #333', color: '#888', fontWeight: 600 },
  td: { padding: '8px 12px', borderBottom: '1px solid #1a1a2e', color: '#ccc' },
}

export default function GenomicsTable({ data }) {
  if (!data || data.length === 0) return null

  return (
    <div style={{ background: '#0d1117', borderRadius: 8, padding: 16, border: '1px solid #2a2a4a' }}>
      <h3 style={{ fontSize: '0.9rem', color: '#ccc', marginBottom: 12 }}>Top Countries by Sequences</h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>#</th>
            <th style={styles.th}>Country</th>
            <th style={styles.th}>Sequences</th>
            <th style={styles.th}>Top Clade</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r, i) => (
            <tr key={r.country_code}>
              <td style={styles.td}>{i + 1}</td>
              <td style={styles.td}>{r.country_code}</td>
              <td style={styles.td}>{r.total_sequences?.toLocaleString()}</td>
              <td style={styles.td}>{r.top_clade}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
