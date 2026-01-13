function ResultsTable({ stations }) {
  if (!stations || stations.length === 0) {
    return (
      <section>
        <h2>Resultados</h2>
        <p>No hay resultados para mostrar</p>
      </section>
    )
  }

  return (
    <section>
      <h2>Resultados</h2>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Municipio</th>
            <th>Distancia (km)</th>
            <th>Precio Gasolina 95</th>
            <th>Precio Gasóleo A</th>
          </tr>
        </thead>
        <tbody>
          {stations.map((station) => (
            <tr key={station.id}>
              <td>{station.name}</td>
              <td>{station.municipality}</td>
              <td>{station.distanceKm.toFixed(2)}</td>
              <td>{station.fuel95 !== null ? station.fuel95.toFixed(3) : '—'}</td>
              <td>{station.fuelDiesel !== null ? station.fuelDiesel.toFixed(3) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export default ResultsTable
