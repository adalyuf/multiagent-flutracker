import * as d3 from 'd3'

export const mapColorScale = d3.scaleSequential(d3.interpolateYlOrRd).domain([0, 40])

export const seasonColors = d3.scaleOrdinal(d3.schemeTableau10)

export const subtypeColors = {
  'H1N1': '#e41a1c',
  'H3N2': '#377eb8',
  'H5N1': '#4daf4a',
  'H7N9': '#984ea3',
  'B/Yamagata': '#ff7f00',
  'B/Victoria': '#a65628',
  'A (unsubtyped)': '#f781bf',
  'B (lineage unknown)': '#999999',
  'unknown': '#666666',
}

export const cladeColors = d3.scaleOrdinal(d3.schemePastel1)

export const severityColor = (v) => {
  if (v >= 0.75) return '#ef4444'
  if (v >= 0.5) return '#f59e0b'
  if (v >= 0.25) return '#eab308'
  return '#22c55e'
}
