function normalizeTime(str) {
  if (!str || typeof str !== 'string') return null

  const trimmed = str.trim()
  const timeMatch = trimmed.match(/^(\d{1,2}):(\d{1,2})$/)

  if (!timeMatch) return null

  let hours = parseInt(timeMatch[1], 10)
  let minutes = parseInt(timeMatch[2], 10)

  if (isNaN(hours) || isNaN(minutes)) return null
  if (hours < 0 || hours > 23) return null
  if (minutes < 0 || minutes > 59) return null

  const hoursStr = hours.toString().padStart(2, '0')
  const minutesStr = minutes.toString().padStart(2, '0')

  return `${hoursStr}:${minutesStr}`
}

function parseDayRange(dayStr) {
  const dayMap = {
    D: 0,
    L: 1,
    M: 2,
    X: 3,
    J: 4,
    V: 5,
    S: 6,
  }

  const normalized = dayStr.trim().toUpperCase()

  if (dayMap[normalized] !== undefined) {
    return [dayMap[normalized]]
  }

  if (normalized.includes('-')) {
    const parts = normalized.split('-').map((p) => p.trim())
    if (parts.length !== 2) return null

    const startDay = dayMap[parts[0]]
    const endDay = dayMap[parts[1]]

    if (startDay === undefined || endDay === undefined) return null

    const days = []
    let current = startDay
    while (true) {
      days.push(current)
      if (current === endDay) break
      current = (current + 1) % 7
      if (days.length > 7) return null
    }

    return days
  }

  return null
}

function parseTimeRange(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return null

  const trimmed = timeStr.trim()
  const rangeMatch = trimmed.match(/^(\d{1,2}:\d{1,2})\s*-\s*(\d{1,2}:\d{1,2})$/)

  if (!rangeMatch) return null

  const start = normalizeTime(rangeMatch[1])
  const end = normalizeTime(rangeMatch[2])

  if (!start || !end) return null

  const [startHours, startMinutes] = start.split(':').map(Number)
  const [endHours, endMinutes] = end.split(':').map(Number)

  const startTotal = startHours * 60 + startMinutes
  const endTotal = endHours * 60 + endMinutes

  if (endTotal <= startTotal) {
    return null
  }

  return { start, end }
}

export function parseOpeningHours(rawHorario) {
  if (!rawHorario || typeof rawHorario !== 'string') {
    return { type: 'unknown' }
  }

  const normalized = rawHorario.trim().toUpperCase()

  if (normalized === '') {
    return { type: 'unknown' }
  }

  if (/24\s*H|ABIERTO\s*24\s*HORAS|24\s*HORAS/.test(normalized)) {
    return { type: '24h' }
  }

  const intervals = {}

  const parts = normalized.split(/[;]/).map((p) => p.trim()).filter((p) => p)

  for (const part of parts) {
    const allDaysPattern = /^(LUNES\s+A\s+DOMINGO|L\s*-\s*D)\s+(\d{1,2}:\d{1,2}\s*-\s*\d{1,2}:\d{1,2})$/i
    const allDaysMatch = part.match(allDaysPattern)

    if (allDaysMatch) {
      const timeStr = allDaysMatch[2]
      const timeRange = parseTimeRange(timeStr)
      if (timeRange) {
        for (let day = 0; day <= 6; day++) {
          if (!intervals[day]) intervals[day] = []
          intervals[day].push(timeRange)
        }
      }
      continue
    }

    const dayTimeMatch = part.match(/^([DLMXJVS\s-]+)\s+(\d{1,2}:\d{1,2}\s*-\s*\d{1,2}:\d{1,2})$/i)

    if (!dayTimeMatch) {
      continue
    }

    const dayStr = dayTimeMatch[1].trim().replace(/\s+/g, '')
    const timeStr = dayTimeMatch[2].trim()

    const days = parseDayRange(dayStr)
    const timeRange = parseTimeRange(timeStr)

    if (!days || !timeRange) continue

    for (const day of days) {
      if (!intervals[day]) intervals[day] = []
      intervals[day].push(timeRange)
    }
  }

  if (Object.keys(intervals).length === 0) {
    return { type: 'unknown' }
  }

  return {
    type: 'weekly',
    intervals,
  }
}
