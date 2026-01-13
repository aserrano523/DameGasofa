import { useState, useEffect, useMemo } from 'react'
import InputSection from './components/InputSection'
import OutputSection from './components/OutputSection'
import Header from './components/Header'
import { fetchStations } from './services/fuelApi'
import { haversineDistance, distancePointToPolylineKm } from './utils/geo'
import { parseOpeningHours } from './utils/schedule'
import { isOpenAt } from './utils/isOpenAt'
import { getRouteToWaypoint, getDurationSeconds, getRoute, geocodePlace } from './services/mapbox'
import { rankRouteStations } from './utils/rankStations'
import './styles/app.css'

function App() {
  const [userLocation, setUserLocation] = useState(null)
  const [stations, setStations] = useState([])
  const [stationsWithDistance, setStationsWithDistance] = useState([])
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [maxRadiusKm, setMaxRadiusKm] = useState(5)
  const [fuelType, setFuelType] = useState('fuel95')
  const [cheapestStation, setCheapestStation] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [destination, setDestination] = useState(null) // Keep for geocoded result
  const [destinationQuery, setDestinationQuery] = useState('') // New: Raw input text
  const [route, setRoute] = useState(null)
  const [routeStatus, setRouteStatus] = useState('idle')
  const [routeError, setRouteError] = useState(null)
  const [routeStations, setRouteStations] = useState([])
  const [rankedRouteStations, setRankedRouteStations] = useState([])
  const [routeCorridorKm, setRouteCorridorKm] = useState(1)
  // Estado de control de modo: null | 'nearby' | 'cheapest' | 'route'
  // SOLO controla QUÉ SE MUESTRA en OutputSection, NO recalcula nada
  const [activeMode, setActiveMode] = useState(null)

  useEffect(() => {
    async function loadStations() {
      try {
        const stationsData = await fetchStations()
        setStations(stationsData)
        console.log(`Número total de estaciones cargadas: ${stationsData.length}`)
        if (stationsData.length > 0) {
          console.log('Ejemplo del primer objeto normalizado:', stationsData[0])
        }
      } catch (error) {
        console.error('Error al cargar estaciones:', error)
      }
    }

    loadStations()
  }, [])

  useEffect(() => {
    if (!userLocation || !stations.length) {
      setStationsWithDistance([])
      return
    }

    const stationsWithDist = stations
      .map((station) => {
        if (station.lat === null || station.lng === null) {
          return null
        }

        const distance = haversineDistance(
          userLocation.lat,
          userLocation.lng,
          station.lat,
          station.lng
        )

        if (distance === null) {
          return null
        }

        return {
          ...station,
          distanceKm: distance,
        }
      })
      .filter((station) => station !== null)
      .sort((a, b) => a.distanceKm - b.distanceKm)

    setStationsWithDistance(stationsWithDist)

    console.log(`Número de estaciones con distancia calculada: ${stationsWithDist.length}`)
    if (stationsWithDist.length > 0) {
      console.log('Ejemplo del objeto más cercano:', stationsWithDist[0])
    }
  }, [userLocation, stations])

  // Removed useEffect for route calculation. Logic moved to handleCalculateFullRoute.

  async function handleCalculateFullRoute() {
    if (!userLocation) {
      setRouteError('Debes establecer tu ubicación primero.')
      return
    }
    if (!destinationQuery.trim()) {
      setRouteError('Debes introducir un destino.')
      return
    }

    setActiveMode('route')
    setRouteStatus('loading')
    setRouteError(null)
    setRoute(null)
    setRouteStations([])
    setRankedRouteStations([])

    try {
      // 1. Geocode
      const geocoded = await geocodePlace(destinationQuery)
      setDestination(geocoded) // Store geocoded result

      // 2. Get Route
      const routeData = await getRoute(
        { lng: userLocation.lng, lat: userLocation.lat },
        geocoded
      )
      setRoute(routeData)

      // 3. Process Stations (Logic adapted from deleted useEffect)
      if (!routeData.geometry || !routeData.geometry.coordinates) {
        setRouteStatus('ready')
        return
      }

      const now = new Date()

      // Filter stations in corridor
      // Use stationsWithDistance if available directly, or re-calc distance?
      // stationsWithDistance depends on userLocation, so it should be up to date.
      const stationsInRoute = stationsWithDistance
        .map((station) => {
          if (station.lat === null || station.lng === null) {
            return null
          }

          const distanceToRoute = distancePointToPolylineKm(
            { lat: station.lat, lng: station.lng },
            routeData.geometry.coordinates
          )

          if (distanceToRoute === null || distanceToRoute > routeCorridorKm) {
            return null
          }

          return {
            ...station,
            distanceToRouteKm: distanceToRoute,
          }
        })
        .filter((station) => station !== null)
        .sort((a, b) => a.distanceToRouteKm - b.distanceToRouteKm)

      console.log(`Calculando arrival times para ${stationsInRoute.length} gasolineras...`)

      const stationsWithArrival = await Promise.all(
        stationsInRoute.map(async (station) => {
          try {
            const durationToStation = await getRouteToWaypoint(
              userLocation,
              { lng: station.lng, lat: station.lat },
              geocoded // Use geocoded destination
            )

            if (!durationToStation || isNaN(durationToStation)) {
              // Fallback or ignore
              return { ...station, arrivalTime: null, isOpenAtArrival: 'unknown' }
            }

            const arrivalDate = new Date(now.getTime() + durationToStation * 1000)
            const parsedSchedule = parseOpeningHours(station.horario || null)
            const isOpenAtArrival = isOpenAt(arrivalDate, parsedSchedule)

            return {
              ...station,
              arrivalTime: arrivalDate,
              isOpenAtArrival,
            }
          } catch (error) {
            return {
              ...station,
              arrivalTime: null,
              isOpenAtArrival: 'unknown',
            }
          }
        })
      )

      setRouteStations(stationsWithArrival)
      const ranked = rankRouteStations(stationsWithArrival, fuelType)
      setRankedRouteStations(ranked)
      setRouteStatus('ready')

    } catch (error) {
      console.error("Error calculating route:", error)
      setRouteError(error.message || "Error al calcular la ruta")
      setRouteStatus('error')
    }
  }

  function detectLocation() {
    if (!navigator.geolocation) {
      console.warn('Geolocalización no disponible en este navegador')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          source: 'geolocation',
        })
      },
      (error) => {
        console.warn('Error al obtener la ubicación:', error.message)
      }
    )
  }

  function setManualLocation(lat, lng) {
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      console.warn('Las coordenadas deben ser números')
      return
    }

    if (isNaN(lat) || isNaN(lng)) {
      console.warn('Las coordenadas no son válidas')
      return
    }

    setUserLocation({
      lat,
      lng,
      source: 'manual',
    })
  }

  function onCompanyChange(company) {
    setSelectedCompany(company === '' ? null : company)
  }

  async function findCheapestStation() {
    setHasSearched(true)
    let filtered = stationsWithDistance

    if (selectedCompany !== null) {
      filtered = filtered.filter((station) => {
        if (!station.name) return false
        const normalizedName = station.name.trim().toUpperCase().replace(/\s+/g, ' ')
        return normalizedName === selectedCompany
      })
    }

    filtered = filtered
      .filter((station) => station.distanceKm <= maxRadiusKm)
      .filter((station) => station[fuelType] !== null)

    if (filtered.length === 0) {
      setCheapestStation(null)
      return
    }

    const cheapest = filtered.reduce((prev, current) => {
      const prevPrice = prev[fuelType]
      const currentPrice = current[fuelType]
      return currentPrice < prevPrice ? current : prev
    })

    if (!userLocation || !cheapest.lat || !cheapest.lng) {
      setCheapestStation(cheapest)
      return
    }

    try {
      const durationSeconds = await getDurationSeconds(userLocation, {
        lng: cheapest.lng,
        lat: cheapest.lat,
      })

      if (durationSeconds !== null && !isNaN(durationSeconds)) {
        const arrivalDate = new Date(Date.now() + durationSeconds * 1000)
        const parsedSchedule = parseOpeningHours(cheapest.horario || null)
        const isOpenAtArrival = isOpenAt(arrivalDate, parsedSchedule)

        setCheapestStation({
          ...cheapest,
          arrivalTime: arrivalDate,
          isOpenAtArrival,
        })
      } else {
        setCheapestStation({
          ...cheapest,
          arrivalTime: null,
          isOpenAtArrival: 'unknown',
        })
      }
    } catch (error) {
      console.warn('Error enriqueciendo cheapestStation:', error)
      setCheapestStation({
        ...cheapest,
        arrivalTime: null,
        isOpenAtArrival: 'unknown',
      })
    }
  }

  // Callbacks explícitos que activan modos
  function handleShowNearby() {
    setActiveMode('nearby')
  }

  async function handleShowCheapest() {
    setActiveMode('cheapest')
    // Reset cheapest station to avoid showing stale data while calculating? 
    // Or let it be. Taking a safe approach: simple switch.
    await findCheapestStation()
  }

  // handleShowRoute replaced by handleCalculateFullRoute

  const availableCompanies = Array.from(
    new Set(
      stationsWithDistance
        .map((station) => {
          if (!station.name) return null
          const normalized = station.name.trim().toUpperCase()
          if (!normalized) return null
          if (normalized === '(SIN RÓTULO)') return null
          if (/^\*+$/.test(normalized)) return null
          return normalized.replace(/\s+/g, ' ')
        })
        .filter((name) => name)
    )
  ).sort()

  const filteredStations =
    selectedCompany === null
      ? stationsWithDistance
      : stationsWithDistance.filter((station) => {
        if (!station.name) return false
        const normalizedName = station.name.trim().toUpperCase().replace(/\s+/g, ' ')
        return normalizedName === selectedCompany
      })

  const nearestStations = filteredStations.slice(0, 10)

  return (
    <>
      <Header />
      <main>
        <InputSection
          userLocation={userLocation}
          onDetectLocation={detectLocation}
          onSetManualLocation={setManualLocation}
          availableCompanies={availableCompanies}
          selectedCompany={selectedCompany}
          onCompanyChange={onCompanyChange}
          maxRadiusKm={maxRadiusKm}
          onMaxRadiusKmChange={setMaxRadiusKm}
          fuelType={fuelType}
          onFuelTypeChange={setFuelType}
          routeCorridorKm={routeCorridorKm}
          onRouteCorridorKmChange={setRouteCorridorKm}
          // Changed Props for Route
          destinationQuery={destinationQuery}
          setDestinationQuery={setDestinationQuery}
          onCalculateRoute={handleCalculateFullRoute} // The single handler 
          routeStatus={routeStatus}
          routeError={routeError}
          // Handlers for other modes remain
          onShowNearby={handleShowNearby}
          onShowCheapest={handleShowCheapest}
        />

        <OutputSection
          activeMode={activeMode}
          userLocation={userLocation}
          nearestStations={nearestStations}
          cheapestStation={cheapestStation}
          fuelType={fuelType}
          route={route}
          routeStatus={routeStatus}
          destination={destination}
          rankedRouteStations={rankedRouteStations}
          routeCorridorKm={routeCorridorKm}
          setRouteCorridorKm={setRouteCorridorKm}
        />

        <footer className="py-8 mt-12 border-t border-gray-200 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm space-y-2">
            <p className="font-medium">Actividad 3: Uso de una API en aplicación de componentes</p>
            <p>Desarrollo de Aplicaciones en Red – Grado en Ingeniería Informática</p>
            <p>Universidad Internacional de La Rioja (UNIR)</p>
            <div className="mt-4 pt-4 border-t border-gray-200 w-1/2 mx-auto">
              <p className="font-semibold text-gray-700">Grupo Nº 2:</p>
              <p>Marta Álvarez Jaén · Carlos García Acevedo · Antonio Serrano Fernández</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}

export default App
