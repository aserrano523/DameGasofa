/**
 * Obtiene la prioridad numérica del estado de apertura
 * PRIORIDAD 1 — Estado de apertura:
 * - Abierta al llegar (true)        → prioridad 0 (mejor)
 * - Estado desconocido ("unknown")  → prioridad 1
 * - Cerrada al llegar (false)       → prioridad 2 (peor)
 * @param {boolean | "unknown"} isOpenAtArrival - Estado de apertura
 * @returns {number} Prioridad numérica (0-2)
 */
function getOpenStatusPriority(isOpenAtArrival) {
  if (isOpenAtArrival === true) {
    return 0
  }
  if (isOpenAtArrival === 'unknown') {
    return 1
  }
  if (isOpenAtArrival === false) {
    return 2
  }
  return 2
}

/**
 * Comparador lexicográfico para ordenar gasolineras en ruta
 * Orden de prioridad:
 * 1) Estado de apertura (abierta > desconocido > cerrada)
 * 2) Desviación respecto a la ruta (menor es mejor)
 * 3) Precio del combustible (menor es mejor, null al final)
 * @param {Object} stationA - Primera gasolinera
 * @param {Object} stationB - Segunda gasolinera
 * @param {string} fuelType - Tipo de combustible ("fuel95" o "fuelDiesel")
 * @returns {number} Negativo si A < B, positivo si A > B, 0 si iguales
 */
function compareStations(stationA, stationB, fuelType) {
  const priorityA = getOpenStatusPriority(stationA.isOpenAtArrival)
  const priorityB = getOpenStatusPriority(stationB.isOpenAtArrival)

  if (priorityA !== priorityB) {
    return priorityA - priorityB
  }

  const detourA = stationA.distanceToRouteKm ?? Infinity
  const detourB = stationB.distanceToRouteKm ?? Infinity

  if (detourA !== detourB) {
    return detourA - detourB
  }

  const priceA = stationA[fuelType]
  const priceB = stationB[fuelType]

  if (priceA === null && priceB === null) {
    return 0
  }
  if (priceA === null) {
    return 1
  }
  if (priceB === null) {
    return -1
  }

  return priceA - priceB
}

/**
 * Ordena las gasolineras en ruta según criterios lexicográficos múltiples
 * PRIORIDAD 1 — Estado de apertura (abierta > desconocido > cerrada)
 * PRIORIDAD 2 — Desviación respecto a la ruta (menor es mejor)
 * PRIORIDAD 3 — Precio del combustible (menor es mejor, null al final)
 * @param {Array} stations - Array de gasolineras en ruta enriquecidas
 * @param {string} fuelType - Tipo de combustible a considerar ("fuel95" o "fuelDiesel")
 * @returns {Array} Nuevo array ordenado (no muta el original)
 */
export function rankRouteStations(stations, fuelType = 'fuel95') {
  if (!Array.isArray(stations)) {
    return []
  }

  return [...stations].sort((a, b) => compareStations(a, b, fuelType))
}
