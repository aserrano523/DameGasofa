import { getWeekdayIndex, minutesFromMidnight, isTimeInRange } from './timeUtils.js'

/**
 * Determina si una gasolinera está abierta en el momento de llegada estimado
 * @param {Date} arrivalDate - Fecha y hora estimada de llegada
 * @param {Object} parsedSchedule - Horario parseado (resultado de parseOpeningHours)
 * @returns {boolean | "unknown"} true si está abierta, false si está cerrada, "unknown" si no se puede determinar
 */
export function isOpenAt(arrivalDate, parsedSchedule) {
  if (!(arrivalDate instanceof Date) || isNaN(arrivalDate.getTime())) {
    return 'unknown'
  }

  if (!parsedSchedule || typeof parsedSchedule !== 'object') {
    return 'unknown'
  }

  if (parsedSchedule.type === '24h') {
    return true
  }

  if (parsedSchedule.type === 'unknown') {
    return 'unknown'
  }

  if (parsedSchedule.type === 'weekly') {
    if (!parsedSchedule.intervals || typeof parsedSchedule.intervals !== 'object') {
      return 'unknown'
    }

    const weekdayIndex = getWeekdayIndex(arrivalDate)
    const arrivalMinutes = minutesFromMidnight(arrivalDate)

    const dayIntervals = parsedSchedule.intervals[weekdayIndex]

    if (!dayIntervals || !Array.isArray(dayIntervals) || dayIntervals.length === 0) {
      return false
    }

    for (const interval of dayIntervals) {
      if (!interval || typeof interval !== 'object') {
        continue
      }

      if (!interval.start || !interval.end) {
        continue
      }

      const [startHours, startMinutes] = interval.start.split(':').map(Number)
      const [endHours, endMinutes] = interval.end.split(':').map(Number)

      if (isNaN(startHours) || isNaN(startMinutes) || isNaN(endHours) || isNaN(endMinutes)) {
        continue
      }

      const startTotalMinutes = startHours * 60 + startMinutes
      const endTotalMinutes = endHours * 60 + endMinutes

      if (isTimeInRange(arrivalMinutes, startTotalMinutes, endTotalMinutes)) {
        return true
      }
    }

    return false
  }

  return 'unknown'
}
