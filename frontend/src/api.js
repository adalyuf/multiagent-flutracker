const BASE = '/api'

async function fetchJson(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const api = {
  summary: () => fetchJson('/cases/summary'),
  mapData: () => fetchJson('/cases/map'),
  historical: () => fetchJson('/cases/historical'),
  subtypes: () => fetchJson('/cases/subtypes'),
  countries: (params = '') => fetchJson(`/cases/countries${params ? '?' + params : ''}`),
  anomalies: () => fetchJson('/anomalies'),
  forecast: (params = '') => fetchJson(`/forecast${params ? '?' + params : ''}`),
  genomicTrends: (params = '') => fetchJson(`/genomics/trends${params ? '?' + params : ''}`),
  genomicSummary: () => fetchJson('/genomics/summary'),
  genomicCountries: () => fetchJson('/genomics/countries'),
}
