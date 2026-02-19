/**
 * Normalize dates to Oct-Sep season for visual comparison.
 * Returns season label and week offset.
 */
export function parseSeason(dateStr) {
  const d = new Date(dateStr)
  const year = d.getUTCFullYear()
  const month = d.getUTCMonth() // 0-indexed
  const day = d.getUTCDate()
  const seasonYear = month >= 9 ? year : year - 1 // Oct = month 9
  const seasonStartMs = Date.UTC(seasonYear, 9, 1) // Oct 1
  const dateMs = Date.UTC(year, month, day)
  const weekOffset = Math.floor((dateMs - seasonStartMs) / (7 * 86400000))
  return {
    season: `${seasonYear}/${seasonYear + 1}`,
    weekOffset,
  }
}

export function getSeasonLabel(seasonYear) {
  return `${seasonYear}/${seasonYear + 1}`
}
