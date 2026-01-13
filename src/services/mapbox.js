const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

export async function geocodePlace(query) {
  if (!query || query.trim() === '') {
    throw new Error('La búsqueda no puede estar vacía')
  }

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=1&country=es`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Error en geocodificación: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  if (!data.features || data.features.length === 0) {
    throw new Error('No se encontraron resultados para la búsqueda')
  }

  const feature = data.features[0]
  const [lng, lat] = feature.center

  return {
    lng,
    lat,
    label: feature.place_name || feature.text,
  }
}

export async function getRoute(origin, destination) {
  if (!origin || !destination) {
    throw new Error('Origen y destino son requeridos')
  }

  const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?access_token=${MAPBOX_TOKEN}&geometries=geojson&overview=full`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Error al calcular la ruta: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  if (!data.routes || data.routes.length === 0) {
    throw new Error('No se pudo calcular la ruta')
  }

  const route = data.routes[0]

  return {
    geometry: route.geometry,
    distanceMeters: route.distance,
    durationSeconds: route.duration,
  }
}

/**
 * Calcula la ruta desde el origen hasta una gasolinera (waypoint) y luego al destino
 * Devuelve la duración del primer tramo (origen → gasolinera)
 * @param {Object} origin - {lng, lat}
 * @param {Object} waypoint - {lng, lat} - La gasolinera
 * @param {Object} destination - {lng, lat}
 * @returns {Promise<number>} Duración en segundos del tramo origen → gasolinera
 */
export async function getRouteToWaypoint(origin, waypoint, destination) {
  if (!origin || !waypoint || !destination) {
    throw new Error('Origen, waypoint y destino son requeridos')
  }

  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.lng},${origin.lat};${waypoint.lng},${waypoint.lat};${destination.lng},${destination.lat}?access_token=${MAPBOX_TOKEN}&geometries=geojson&overview=full`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Error al calcular la ruta con waypoint: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  if (!data.routes || data.routes.length === 0) {
    throw new Error('No se pudo calcular la ruta con waypoint')
  }

  const route = data.routes[0]

  if (!route.legs || route.legs.length < 1) {
    throw new Error('Ruta sin tramos válidos')
  }

  return route.legs[0].duration
}

/**
 * Calcula la duración en segundos desde el origen hasta una gasolinera
 * @param {Object} origin - {lng, lat}
 * @param {Object} station - {lng, lat}
 * @returns {Promise<number|null>} Duración en segundos, o null si falla
 */
export async function getDurationSeconds(origin, station) {
  if (!origin || !station) {
    return null
  }

  try {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.lng},${origin.lat};${station.lng},${station.lat}?access_token=${MAPBOX_TOKEN}&geometries=geojson&overview=full`

    const response = await fetch(url)

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    if (!data.routes || data.routes.length === 0) {
      return null
    }

    const route = data.routes[0]

    return route.duration || null
  } catch (error) {
    console.warn('Error calculando duración:', error)
    return null
  }
}
