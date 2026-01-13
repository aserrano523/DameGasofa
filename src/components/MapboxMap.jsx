import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

function MapboxMap({ mode, userLocation, stations, routeGeometry, destination }) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const markersRef = useRef([])
  const routeSourceAdded = useRef(false)

  useEffect(() => {
    if (!mapContainer.current) return

    const token = import.meta.env.VITE_MAPBOX_TOKEN

    if (!token || token === 'TU_TOKEN_PUBLICO_DE_MAPBOX') {
      console.warn('Mapbox token no configurado. Configura VITE_MAPBOX_TOKEN en .env')
      return
    }

    mapboxgl.accessToken = token

    const defaultCenter = [-3.7, 40.4]
    const center = userLocation
      ? [userLocation.lng, userLocation.lat]
      : defaultCenter
    const zoom = userLocation ? 13 : 5

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: center,
      zoom: zoom,
    })

    map.current.on('load', () => {
      if (!map.current.getSource('route')) {
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [],
            },
          },
        })

        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#007bff',
            'line-width': 4,
          },
        })

        routeSourceAdded.current = true
      }
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
        routeSourceAdded.current = false
      }
    }
  }, [])

  useEffect(() => {
    if (!map.current) return

    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    const bounds = new mapboxgl.LngLatBounds()
    let pointCount = 0

    if (userLocation) {
      const userMarker = new mapboxgl.Marker({ color: '#007bff' })
        .setLngLat([userLocation.lng, userLocation.lat])
        .setPopup(
          new mapboxgl.Popup().setHTML('<strong>Tu ubicación</strong>')
        )
        .addTo(map.current)

      markersRef.current.push(userMarker)
      bounds.extend([userLocation.lng, userLocation.lat])
      pointCount++
    }

    if (destination) {
      const destMarker = new mapboxgl.Marker({ color: '#28a745' })
        .setLngLat([destination.lng, destination.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>Destino</strong><br/>${destination.label}`))
        .addTo(map.current)

      markersRef.current.push(destMarker)
      bounds.extend([destination.lng, destination.lat])
      pointCount++
    }

    if (stations && stations.length > 0) {
      stations.forEach((station) => {
        if (station.lat === null || station.lng === null) return

        const priceInfo = []
        if (station.fuel95 !== null) {
          priceInfo.push(`Gasolina 95: ${station.fuel95.toFixed(3)} €`)
        }
        if (station.fuelDiesel !== null) {
          priceInfo.push(`Gasóleo A: ${station.fuelDiesel.toFixed(3)} €`)
        }

        const distanceInfo = station.distanceKm
          ? `Distancia: ${station.distanceKm.toFixed(2)} km<br/>`
          : station.distanceToRouteKm
            ? `Distancia a la ruta: ${station.distanceToRouteKm.toFixed(2)} km<br/>`
            : ''

        let openStatusInfo = ''
        if (station.isOpenAtArrival !== undefined) {
          if (station.isOpenAtArrival === true) {
            openStatusInfo = '✅ Abierta al llegar<br/>'
          } else if (station.isOpenAtArrival === false) {
            openStatusInfo = '❌ Cerrada al llegar<br/>'
          } else {
            openStatusInfo = '❓ Estado desconocido<br/>'
          }
        }

        const arrivalTimeInfo = station.arrivalTime
          ? `Hora estimada: ${station.arrivalTime.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
          })}<br/>`
          : ''

        const popupContent = `
          <div>
            <strong>${station.name || 'Sin nombre'}</strong><br/>
            ${station.municipality || ''}<br/>
            ${distanceInfo}
            ${arrivalTimeInfo}
            ${openStatusInfo}
            ${priceInfo.length > 0 ? priceInfo.join('<br/>') : 'Sin precios'}
          </div>
        `

        let markerColor = '#007bff'
        if (mode === 'route' && station.isOpenAtArrival !== undefined) {
          if (station.isOpenAtArrival === true) {
            markerColor = '#28a745'
          } else if (station.isOpenAtArrival === false) {
            markerColor = '#dc3545'
          } else {
            markerColor = '#ffc107'
          }
        } else if (mode === 'route') {
          markerColor = '#28a745'
        } else if (mode === 'cheapest') {
          // Cheaper station distinct color
          markerColor = '#fd7e14' // Orange/Red-ish distinct from Blue user marker
        }

        const marker = new mapboxgl.Marker({
          color: markerColor,
        })
          .setLngLat([station.lng, station.lat])
          .setPopup(new mapboxgl.Popup().setHTML(popupContent))
          .addTo(map.current)

        markersRef.current.push(marker)
        bounds.extend([station.lng, station.lat])
        pointCount++
      })
    }

    if (routeGeometry && routeGeometry.coordinates) {
      routeGeometry.coordinates.forEach((coord) => {
        bounds.extend(coord)
      })
    }

    if (pointCount >= 2 || routeGeometry) {
      map.current.fitBounds(bounds, { padding: 60 })
    } else if (pointCount === 1) {
      const center = bounds.getCenter()
      map.current.setCenter([center.lng, center.lat])
      map.current.setZoom(13)
    }
  }, [userLocation, stations, destination, routeGeometry])

  useEffect(() => {
    if (!map.current || !routeSourceAdded.current) return

    if (!map.current.isStyleLoaded()) {
      return
    }

    const source = map.current.getSource('route')
    if (source) {
      if (routeGeometry) {
        source.setData({
          type: 'Feature',
          properties: {},
          geometry: routeGeometry,
        })
      } else {
        source.setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [],
          },
        })
      }
    }
  }, [routeGeometry])

  return (
    <section className="mb-6">
      <h2>Mapa</h2>
      {!userLocation && <p>Ubicación no disponible</p>}
      <div ref={mapContainer} className="w-full" style={{ height: '400px' }} />
    </section>
  )
}

export default MapboxMap
