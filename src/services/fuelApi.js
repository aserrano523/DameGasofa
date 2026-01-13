export async function fetchStations() {
  const apiUrl = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/'

  const response = await fetch(apiUrl, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Error al obtener datos: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  if (!data.ListaEESSPrecio || !Array.isArray(data.ListaEESSPrecio)) {
    throw new Error('Formato de datos inválido')
  }

  return normalizeStations(data.ListaEESSPrecio)
}

function normalizeStations(stations) {
  return stations.map((station) => {
    const parsePrice = (priceStr) => {
      if (!priceStr || priceStr.trim() === '') return null
      const normalized = priceStr.replace(',', '.')
      const parsed = parseFloat(normalized)
      return isNaN(parsed) ? null : parsed
    }

    const parseCoordinate = (coordStr) => {
      if (!coordStr || coordStr.trim() === '') return null
      const normalized = coordStr.replace(',', '.')
      const parsed = parseFloat(normalized)
      return isNaN(parsed) ? null : parsed
    }

    return {
      id: station.IDEESS,
      name: station.Rótulo,
      address: station.Dirección,
      municipality: station.Municipio,
      province: station.Provincia,
      lat: parseCoordinate(station.Latitud),
      lng: parseCoordinate(station['Longitud (WGS84)']),
      fuel95: parsePrice(station['Precio Gasolina 95 E5']),
      fuelDiesel: parsePrice(station['Precio Gasoleo A']),
      horario: station.Horario || null,
    }
  })
}
