import MapboxMap from './MapboxMap'
import ResultsTable from './ResultsTable'
import RouteStationsPanel from './RouteStationsPanel'

/**
 * OutputSection - Componente presentacional que renderiza RESULTADOS
 * 
 * Solo se muestra cuando activeMode !== null
 * El mapa SIEMPRE aparece ANTES que los resultados
 */
function OutputSection({
  activeMode,
  userLocation,
  nearestStations,
  cheapestStation,
  fuelType,
  route,
  routeStatus,
  destination,
  rankedRouteStations,
  routeCorridorKm,
  setRouteCorridorKm,
}) {
  if (activeMode === null) {
    return null
  }

  switch (activeMode) {
    case 'nearby':
      return (
        <section className="bg-white py-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="space-y-8">
              {/* MAPA PRIMERO - Estilo redondeado y sombra */}
              <div className="rounded-xl overflow-hidden shadow-md border border-[#5B9BD5]/30">
                <MapboxMap
                  mode="nearby"
                  userLocation={userLocation}
                  stations={nearestStations}
                />
              </div>

              <div id="results-nearby">
                <h2 className="text-2xl font-bold text-[#365F91] mb-6 border-b border-[#5B9BD5]/30 pb-2">Gasolineras más cercanas</h2>
                {nearestStations && nearestStations.length > 0 ? (
                  /* Grid de Cards para 'Nearby' */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {nearestStations.map(station => (
                      <div key={station.id} className="bg-white rounded-lg shadow-sm border border-[#5B9BD5]/20 p-5 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg text-[#365F91] truncate" title={station.name}>{station.name}</h3>
                          <span className="bg-[#5B9BD5]/10 text-[#365F91] text-xs font-semibold px-2 py-1 rounded">
                            {(station.distanceKm || 0).toFixed(1)} km
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">{station.municipality}</p>
                        <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                          <span className="text-sm text-gray-600">Precio</span>
                          <span className="text-xl font-bold text-[#365F91]">
                            {/* Mostrar precio según fuelType, o ambos? user requirement implies "Precio" generic or specific? 
                                       Current context doesn't pass fuelType to this view easily, ah wait, App passes it to OutputSection YES.
                                   */}
                            {station[fuelType] ? `${station[fuelType].toFixed(3)} €` : 'N/A'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic p-4 text-center bg-gray-50 rounded-lg">No se encontraron gasolineras cercanas.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      )

    case 'cheapest':
      return (
        <section className="bg-white py-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="space-y-8">
              {/* MAPA PRIMERO */}
              <div className="rounded-xl overflow-hidden shadow-md border border-[#5B9BD5]/30">
                <MapboxMap
                  mode="cheapest"
                  userLocation={userLocation}
                  stations={cheapestStation ? [cheapestStation] : []}
                />
              </div>

              <div id="results-cheapest">
                <h2 className="text-2xl font-bold text-[#365F91] mb-6 border-b border-[#5B9BD5]/30 pb-2">Gasolinera más barata</h2>
                {cheapestStation ? (
                  /* HERO CARD */
                  <div className="bg-white max-w-2xl mx-auto rounded-xl shadow-lg border-2 border-[#F5A623] overflow-hidden transform transition-all hover:scale-[1.01]">
                    <div className="bg-[#F5A623]/10 px-6 py-4 border-b border-[#F5A623]/20 flex justify-between items-center">
                      <span className="text-[#D99015] font-bold tracking-wider uppercase text-sm">Mejor opción</span>
                      <span className="text-[#D99015] font-bold bg-[#F5A623]/20 px-3 py-1 rounded-full text-xs">
                        {(cheapestStation.distanceKm || 0).toFixed(1)} km de ti
                      </span>
                    </div>
                    <div className="p-8">
                      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-center md:text-left">
                          <h3 className="text-3xl font-bold text-gray-900 mb-1">{cheapestStation.name}</h3>
                          <p className="text-gray-500 text-lg">{cheapestStation.municipality}</p>
                          {/* Estado al llegar */}
                          {cheapestStation.isOpenAtArrival !== undefined && (
                            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-sm">
                              <span className="mr-2">
                                {cheapestStation.isOpenAtArrival === true ? '✅' : cheapestStation.isOpenAtArrival === false ? '❌' : '❓'}
                              </span>
                              {cheapestStation.isOpenAtArrival === true ? 'Abierta al llegar' : cheapestStation.isOpenAtArrival === false ? 'Cerrada al llegar' : 'Horario desconocido'}
                            </div>
                          )}
                        </div>
                        <div className="text-right bg-gray-50 p-6 rounded-xl min-w-[180px] flex flex-col items-center justify-center border border-gray-100">
                          <span className="text-sm text-gray-500 uppercase font-semibold mb-1">Precio Litro</span>
                          <span className="text-4xl font-extrabold text-blue-600">
                            {cheapestStation[fuelType]?.toFixed(3) || '---'}
                          </span>
                          <span className="text-gray-400 text-sm mt-1">Euros</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-red-500 p-4 text-center bg-red-50 rounded-lg">No se encontró ninguna gasolinera barata con los criterios seleccionados.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      )

    case 'route':
      return (
        <section className="bg-white py-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="space-y-8">
              {/* MAPA PRIMERO */}
              {(route || routeStatus === 'loading') && (
                <div className="rounded-xl overflow-hidden shadow-md border border-gray-200">
                  <MapboxMap
                    mode="route"
                    userLocation={userLocation}
                    destination={destination}
                    routeGeometry={route?.geometry}
                    stations={rankedRouteStations || []}
                  />
                </div>
              )}

              <div id="results-route">
                {routeStatus === 'loading' && (
                  <div className="text-center py-12">
                    <p className="text-xl text-gray-500 animate-pulse">Calculando ruta óptima...</p>
                  </div>
                )}

                {routeStatus === 'error' && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <p className="text-red-700">Error al calcular la ruta.</p>
                  </div>
                )}

                {routeStatus === 'ready' && route && (
                  <>
                    {/* ROUTE SUMMARY CARD */}
                    <div className="bg-[#365F91]/5 border border-[#365F91]/20 rounded-xl p-6 mb-8 flex flex-col md:flex-row justify-between items-center shadow-sm">
                      <div>
                        <h3 className="text-lg font-bold text-[#365F91] mb-1">Resumen del Viaje</h3>
                        <p className="text-[#2A4E7A]">
                          Hacia <span className="font-semibold">{destination?.label || 'Destino seleccionado'}</span>
                        </p>
                      </div>
                      <div className="flex gap-6 mt-4 md:mt-0">
                        <div className="text-center">
                          <span className="block text-2xl font-bold text-[#365F91]">{(route.distanceMeters / 1000).toFixed(1)}</span>
                          <span className="text-xs uppercase text-gray-500 font-semibold">Kilómetros</span>
                        </div>
                        <div className="text-center">
                          <span className="block text-2xl font-bold text-[#365F91]">{Math.round(route.durationSeconds / 60)}</span>
                          <span className="text-xs uppercase text-gray-500 font-semibold">Minutos</span>
                        </div>
                      </div>
                    </div>

                    {/* LISTA DE ESTACIONES DE RUTA - COMO CARDS */}
                    <h3 className="text-xl font-bold text-[#365F91] mb-4">Paradas recomendadas en ruta</h3>

                    {rankedRouteStations.length > 0 ? (
                      <div className="space-y-4">
                        {rankedRouteStations.map((station, index) => (
                          <div key={station.id} className="bg-white border border-[#5B9BD5]/20 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="bg-[#5B9BD5]/10 text-[#365F91] font-bold rounded-full w-8 h-8 flex items-center justify-center text-sm">
                                {index + 1}
                              </div>
                              <div>
                                <h4 className="font-bold text-[#365F91]">{station.name}</h4>
                                <p className="text-sm text-gray-500">{station.municipality}</p>
                                <p className="text-xs text-gray-400 mt-1">Desvío: {station.distanceToRouteKm.toFixed(2)} km</p>
                              </div>
                            </div>

                            <div className="flex gap-6 items-center w-full md:w-auto justify-between md:justify-end">
                              <div className="text-right">
                                <span className="block font-bold text-lg text-[#365F91]">
                                  {station[fuelType] ? station[fuelType].toFixed(3) : '---'} €
                                </span>
                                <span className="text-xs text-gray-400">/ litro</span>
                              </div>
                              <div>
                                {station.isOpenAtArrival ? (
                                  <span className="px-2 py-1 bg-[#66D2B3]/20 text-[#2F6F5E] text-xs font-bold rounded">Abierta</span>
                                ) : (
                                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded">Cerrada</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic p-4 text-center border border-dashed border-[#5B9BD5]/30 rounded-lg">No se encontraron gasolineras en esta ruta con el corredor actual.</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      )

    default:
      return null
  }
}

export default OutputSection
