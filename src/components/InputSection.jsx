import LocationPanel from './LocationPanel'
import RoutePanel from './RoutePanel'
import FiltersPanel from './FiltersPanel'

/**
 * InputSection - Componente presentacional que contiene TODOS los elementos de ENTRADA del usuario
 * 
 * Recibe callbacks por props para activar modos.
 * NO renderiza resultados ni mapas.
 */
function InputSection({
  userLocation,
  onDetectLocation,
  onSetManualLocation,
  availableCompanies,
  selectedCompany,
  onCompanyChange,
  maxRadiusKm,
  onMaxRadiusKmChange,
  fuelType,
  onFuelTypeChange,
  routeCorridorKm,
  onRouteCorridorKmChange,
  // Updated Props
  destinationQuery,
  setDestinationQuery,
  onCalculateRoute,
  routeStatus,
  // routeError, // Pass this to RoutePanel if needed or handle display here? 
  // Requirement: "InputSection vs OutputSection (HARD SEPARATION... MUST NOT display Results... Informational summaries...)"
  // Error messages are "Informational"? 
  // Typically form validation errors stay in Input. 
  // Route Calculation Error (e.g. "No route found") matches "Results".
  // However, simple "Enter a destination" validation is Input.
  // The user requirement says "Route summary appears inside InputSection -> WRONG".
  // "Route status... loading... error" might be border-line.
  // Let's keep minimal error display in InputSection if it relates to validation, 
  // but "Route Calculation Error" might belong to Output or be a Toast.
  // Existing code had `routeError` passed to `RoutePanel`.
  // Let's keep `routeError` in `InputSection` for feedback like "Destination required", 
  // BUT move "Route not found" to OutputSection?
  // User Prompt: "OutputSection... ONLY contains... Result cards... Route summary... Tables".
  // "MUST NOT display Results... Informational summaries".
  // Let's put the error in InputSection near the button for immediate feedback if it's validation, 
  // but large errors in Output.
  // Actually, let's keep it simple: pass routeError to display near button if it helps UX, purely text.
  routeError,
  // onShowNearby, onShowCheapest remain
  onShowNearby,
  onShowCheapest,
}) {
  return (
    <section className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="space-y-6">
          {/* BLOQUE DE UBICACIÓN (Full Width) */}
          <div className="w-full">
            <LocationPanel
              userLocation={userLocation}
              onDetectLocation={onDetectLocation}
              onSetManualLocation={onSetManualLocation}
            />
          </div>

          {/* DASHBOARD GRID: 3 Columnas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* COLUMNA 1: Gasolineras más cercanas */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-[#5B9BD5]/20 flex flex-col justify-between h-full">
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-[#365F91] border-b border-[#5B9BD5]/30 pb-2">Gasolineras Cercanas</h2>
                <FiltersPanel
                  availableCompanies={availableCompanies}
                  selectedCompany={selectedCompany}
                  onCompanyChange={onCompanyChange}
                />
              </div>
              <button
                onClick={onShowNearby}
                disabled={!userLocation}
                className="w-full mt-6 bg-[#365F91] hover:bg-[#2A4E7A] text-white font-bold py-3 px-4 rounded-md shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mostrar gasolineras
              </button>
            </div>

            {/* COLUMNA 2: Más barata */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-[#5B9BD5]/20 flex flex-col justify-between h-full">
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-[#365F91] border-b border-[#5B9BD5]/30 pb-2">Más Barata</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Radio (km)
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={maxRadiusKm}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value)
                      if (!isNaN(value) && value > 0) {
                        onMaxRadiusKmChange(value)
                      }
                    }}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Combustible
                  </label>
                  <select
                    value={fuelType}
                    onChange={(e) => onFuelTypeChange(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  >
                    <option value="fuel95">Gasolina 95</option>
                    <option value="fuelDiesel">Gasóleo A</option>
                  </select>
                </div>
              </div>
              <button
                onClick={onShowCheapest}
                disabled={!userLocation}
                className="w-full mt-6 bg-[#F5A623] hover:bg-[#D99015] text-white font-bold py-3 px-4 rounded-md shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mostrar la más barata
              </button>
            </div>

            {/* COLUMNA 3: Ruta */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-[#5B9BD5]/20 flex flex-col justify-between h-full">
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-[#365F91] border-b border-[#5B9BD5]/30 pb-2">Planificar Ruta</h2>
                <RoutePanel
                  destination={destinationQuery}
                  setDestination={setDestinationQuery}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Corredor (km)
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={routeCorridorKm}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value)
                      if (!isNaN(value) && value > 0) {
                        onRouteCorridorKmChange(value)
                      }
                    }}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  />
                </div>
              </div>
              <div>
                <button
                  onClick={onCalculateRoute}
                  disabled={!userLocation || routeStatus === 'loading'}
                  className="w-full mt-6 bg-[#365F91] hover:bg-[#2A4E7A] text-white font-bold py-3 px-4 rounded-md shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {routeStatus === 'loading' ? 'Calculando...' : 'Calcular ruta'}
                </button>
                {routeError && (
                  <p className="text-red-500 text-xs mt-2 text-center">{routeError}</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

export default InputSection
