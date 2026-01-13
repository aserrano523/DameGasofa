/**
 * Obtiene el índice del día de la semana usando la convención de JavaScript Date.getDay()
 * 0 = domingo, 1 = lunes, 2 = martes, 3 = miércoles, 4 = jueves, 5 = viernes, 6 = sábado
 * @param {Date} date - Fecha a evaluar
 * @returns {number} Índice del día (0-6) según Date.getDay()
 */
export function getWeekdayIndex(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Fecha inválida')
  }

  return date.getDay()
}

/**
 * Calcula los minutos transcurridos desde medianoche (00:00)
 * @param {Date} date - Fecha a evaluar
 * @returns {number} Minutos desde medianoche (0-1439)
 */
export function minutesFromMidnight(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Fecha inválida')
  }

  const hours = date.getHours()
  const minutes = date.getMinutes()
  return hours * 60 + minutes
}

/**
 * Verifica si un tiempo (en minutos desde medianoche) está dentro de un rango
 * El rango es [start, end) - incluye start, excluye end
 * No soporta horarios nocturnos (start > end) - devuelve false en ese caso
 * @param {number} minutes - Minutos desde medianoche a verificar
 * @param {number} startMinutes - Inicio del rango (minutos desde medianoche)
 * @param {number} endMinutes - Fin del rango (minutos desde medianoche)
 * @returns {boolean} true si minutes está en [start, end), false en caso contrario
 */
export function isTimeInRange(minutes, startMinutes, endMinutes) {
  if (typeof minutes !== 'number' || isNaN(minutes)) {
    return false
  }
  if (typeof startMinutes !== 'number' || isNaN(startMinutes)) {
    return false
  }
  if (typeof endMinutes !== 'number' || isNaN(endMinutes)) {
    return false
  }

  if (startMinutes >= endMinutes) {
    return false
  }

  if (minutes < 0 || minutes >= 1440) {
    return false
  }
  if (startMinutes < 0 || startMinutes >= 1440) {
    return false
  }
  if (endMinutes < 0 || endMinutes > 1440) {
    return false
  }

  return minutes >= startMinutes && minutes < endMinutes
}
