const REPORT_CODE_PREFIX = 'GLP'
const REPORT_CODE_RANDOM_LENGTH = 6
const REPORT_CODE_RANDOM_BASE = 36

function formatDateSegment(date: Date): string {
  const year = date.getUTCFullYear().toString()
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0')
  const day = date.getUTCDate().toString().padStart(2, '0')

  return `${year}${month}${day}`
}

function normalizeRandomValue(randomValue: number): number {
  if (!Number.isFinite(randomValue)) {
    return 0
  }

  if (randomValue < 0) {
    return 0
  }

  if (randomValue >= 1) {
    return Number.MIN_VALUE
  }

  return randomValue
}

function formatRandomSegment(randomValue: number): string {
  const maxValue = REPORT_CODE_RANDOM_BASE ** REPORT_CODE_RANDOM_LENGTH
  const numericValue = Math.floor(normalizeRandomValue(randomValue) * maxValue)

  return numericValue.toString(REPORT_CODE_RANDOM_BASE).toUpperCase().padStart(REPORT_CODE_RANDOM_LENGTH, '0')
}

export function generateReportCode(date: Date = new Date(), randomValue: number = Math.random()): string {
  return `${REPORT_CODE_PREFIX}-${formatDateSegment(date)}-${formatRandomSegment(randomValue)}`
}
