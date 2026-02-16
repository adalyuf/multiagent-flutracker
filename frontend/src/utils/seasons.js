/**
 * Normalize dates to Oct-Sep season for visual comparison.
 * Returns season label and week offset.
 */
export function parseSeason(dateStr) {
  const d = new Date(dateStr)
  const year = d.getFullYear()
  const month = d.getMonth() // 0-indexed
  const seasonYear = month >= 9 ? year : year - 1 // Oct = month 9
  const seasonStart = new Date(seasonYear, 9, 1) // Oct 1
  const weekOffset = Math.floor((d - seasonStart) / (7 * 86400000))
  return {
    season: `${seasonYear}/${seasonYear + 1}`,
    weekOffset,
  }
}

export function getSeasonLabel(seasonYear) {
  return `${seasonYear}/${seasonYear + 1}`
}
