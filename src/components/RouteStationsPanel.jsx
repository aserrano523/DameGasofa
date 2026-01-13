function RouteStationsPanel({ routeStations, routeCorridorKm, setRouteCorridorKm, fuelType = 'fuel95' }) {
  function handleCorridorChange(e) {
    const value = parseFloat(e.target.value)
    if (!isNaN(value) && value > 0) {
      setRouteCorridorKm(value)
    }
  }

  return (
    <section>
      <h2>Gasolineras en la ruta</h2>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
          Radio del corredor (km):
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={routeCorridorKm}
            onChange={handleCorridorChange}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </label>
      </div>

      {routeStations.length === 0 ? (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '4px',
            color: '#856404',
          }}
        >
          <p style={{ margin: 0 }}>
            No hay gasolineras dentro del corredor seleccionado.
          </p>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                Nombre
              </th>
              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                Municipio
              </th>
              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                Empresa
              </th>
              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                Precio
              </th>
              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                Desviación (km)
              </th>
              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                Hora estimada
              </th>
              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                Abierta al llegar
              </th>
            </tr>
          </thead>
          <tbody>
            {routeStations.map((station) => {
              let openStatusDisplay = '❓ Desconocido'
              if (station.isOpenAtArrival === true) {
                openStatusDisplay = '✅ Abierta'
              } else if (station.isOpenAtArrival === false) {
                openStatusDisplay = '❌ Cerrada'
              }

              const price = station[fuelType]
              const priceDisplay = price !== null && price !== undefined ? `${price.toFixed(3)} €` : '—'

              const arrivalTimeDisplay = station.arrivalTime
                ? station.arrivalTime.toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '—'

              const companyName = station.name
                ? station.name.trim().toUpperCase().replace(/\s+/g, ' ')
                : 'N/A'

              return (
                <tr key={station.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '0.75rem' }}>{station.name}</td>
                  <td style={{ padding: '0.75rem' }}>{station.municipality}</td>
                  <td style={{ padding: '0.75rem' }}>{companyName}</td>
                  <td style={{ padding: '0.75rem' }}>{priceDisplay}</td>
                  <td style={{ padding: '0.75rem' }}>
                    {station.distanceToRouteKm?.toFixed(2) || 'N/A'}
                  </td>
                  <td style={{ padding: '0.75rem' }}>{arrivalTimeDisplay}</td>
                  <td style={{ padding: '0.75rem' }}>{openStatusDisplay}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </section>
  )
}

export default RouteStationsPanel
