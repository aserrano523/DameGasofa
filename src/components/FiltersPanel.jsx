function FiltersPanel({
  availableCompanies,
  selectedCompany,
  onCompanyChange,
  maxRadiusKm,
  onMaxRadiusKmChange,
  fuelType,
  onFuelTypeChange,
  onFindCheapest,
  cheapestStation,
  hasSearched,
  showCompanyFilter = true,
  showCheapestSearch = false,
}) {
  function handleCompanyChange(e) {
    onCompanyChange(e.target.value)
  }

  function handleRadiusChange(e) {
    const value = parseFloat(e.target.value)
    if (!isNaN(value) && value > 0) {
      onMaxRadiusKmChange(value)
    }
  }

  function handleFuelTypeChange(e) {
    onFuelTypeChange(e.target.value)
  }

  return (
    <div>
      {showCompanyFilter && (
        <div>
          {availableCompanies.length === 0 ? (
            <p>No hay empresas disponibles</p>
          ) : (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Empresa:
                <select
                  value={selectedCompany || ''}
                  onChange={handleCompanyChange}
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                >
                  <option value="">Todas las empresas</option>
                  {availableCompanies.map((company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </div>
      )}

      {showCheapestSearch && (
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Radio (km):
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={maxRadiusKm}
                onChange={handleRadiusChange}
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Tipo de carburante:
              <select
                value={fuelType}
                onChange={handleFuelTypeChange}
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
              >
                <option value="fuel95">Gasolina 95</option>
                <option value="fuelDiesel">Gasóleo A</option>
              </select>
            </label>
          </div>
          <button
            onClick={onFindCheapest}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Buscar más barata
          </button>

          {hasSearched && cheapestStation !== null && (
            <div
              style={{
                marginTop: '1.5rem',
                padding: '1.5rem',
                backgroundColor: '#1a1a1a',
                border: '3px solid #28a745',
                borderRadius: '8px',
                color: '#ffffff',
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  marginBottom: '1rem',
                  fontSize: '1.3rem',
                  color: '#28a745',
                  fontWeight: 'bold',
                }}
              >
                Gasolinera más barata
              </h3>
              <p
                style={{
                  margin: '0.5rem 0',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: '#ffffff',
                }}
              >
                {cheapestStation.name}
              </p>
              <p style={{ margin: '0.5rem 0', color: '#cccccc' }}>
                <strong>Municipio:</strong> {cheapestStation.municipality}
              </p>
              <p style={{ margin: '0.5rem 0', color: '#cccccc' }}>
                <strong>Distancia:</strong> {cheapestStation.distanceKm.toFixed(2)} km
              </p>
              <p
                style={{
                  margin: '0.5rem 0',
                  fontSize: '1.4rem',
                  fontWeight: 'bold',
                  color: '#28a745',
                }}
              >
                Precio: {cheapestStation[fuelType]?.toFixed(3)} €
              </p>
              {cheapestStation.arrivalTime && (
                <p style={{ margin: '0.5rem 0', color: '#cccccc' }}>
                  <strong>Hora estimada:</strong>{' '}
                  {cheapestStation.arrivalTime.toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
              {cheapestStation.isOpenAtArrival !== undefined && (
                <p style={{ margin: '0.5rem 0', color: '#cccccc' }}>
                  <strong>Estado al llegar:</strong>{' '}
                  {cheapestStation.isOpenAtArrival === true
                    ? '✅ Abierta'
                    : cheapestStation.isOpenAtArrival === false
                      ? '❌ Cerrada'
                      : '❓ Desconocido'}
                </p>
              )}
            </div>
          )}

          {hasSearched && cheapestStation === null && (
            <div
              style={{
                marginTop: '1.5rem',
                padding: '1rem',
                backgroundColor: '#ffffff',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                color: '#6c757d',
              }}
            >
              <p style={{ margin: 0 }}>
                No hay gasolineras con datos disponibles en ese radio.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default FiltersPanel
