import React from 'react'

export function SkeletonBlock({ width = '100%', height = 16, style = {} }) {
  return <div className="skeleton" style={{ width, height, ...style }} />
}

export function SkeletonKpi() {
  return (
    <div className="kpi-card kpi-cyan" style={{ opacity: 0.6 }}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <SkeletonBlock width={28} height={28} style={{ borderRadius: 8 }} />
          <SkeletonBlock width="50%" height={10} />
        </div>
        <SkeletonBlock width="60%" height={28} style={{ marginBottom: 6 }} />
        <SkeletonBlock width="40%" height={10} />
      </div>
    </div>
  )
}

export function SkeletonChart({ height = 240 }) {
  return (
    <div className="card-analytics">
      <SkeletonBlock width="35%" height={14} style={{ marginBottom: 14 }} />
      <SkeletonBlock width="100%" height={height} />
    </div>
  )
}

export function SkeletonTable({ rows = 6 }) {
  return (
    <div className="card-analytics">
      <SkeletonBlock width="25%" height={14} style={{ marginBottom: 18 }} />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <SkeletonBlock width="5%" height={12} />
          <SkeletonBlock width="18%" height={12} />
          <SkeletonBlock width="14%" height={12} />
          <SkeletonBlock width="10%" height={12} />
          <SkeletonBlock width="12%" height={12} />
          <SkeletonBlock width="16%" height={12} />
          <SkeletonBlock width="10%" height={12} />
        </div>
      ))}
    </div>
  )
}
