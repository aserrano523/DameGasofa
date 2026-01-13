import { rankRouteStations } from './rankStations.js'

const testCases = [
  {
    description: 'Abiertas antes que desconocidas',
    stations: [
      {
        id: 1,
        name: 'Cerrada',
        isOpenAtArrival: false,
        distanceToRouteKm: 0.5,
        fuel95: 1.5,
      },
      {
        id: 2,
        name: 'Desconocida',
        isOpenAtArrival: 'unknown',
        distanceToRouteKm: 0.3,
        fuel95: 1.4,
      },
      {
        id: 3,
        name: 'Abierta',
        isOpenAtArrival: true,
        distanceToRouteKm: 0.7,
        fuel95: 1.6,
      },
    ],
    fuelType: 'fuel95',
    expectedOrder: [3, 2, 1],
  },
  {
    description: 'Desconocidas antes que cerradas',
    stations: [
      {
        id: 1,
        name: 'Cerrada',
        isOpenAtArrival: false,
        distanceToRouteKm: 0.1,
        fuel95: 1.3,
      },
      {
        id: 2,
        name: 'Desconocida',
        isOpenAtArrival: 'unknown',
        distanceToRouteKm: 0.5,
        fuel95: 1.5,
      },
    ],
    fuelType: 'fuel95',
    expectedOrder: [2, 1],
  },
  {
    description: 'Entre abiertas: menor desvío primero',
    stations: [
      {
        id: 1,
        name: 'Abierta Lejos',
        isOpenAtArrival: true,
        distanceToRouteKm: 1.5,
        fuel95: 1.5,
      },
      {
        id: 2,
        name: 'Abierta Cerca',
        isOpenAtArrival: true,
        distanceToRouteKm: 0.3,
        fuel95: 1.6,
      },
      {
        id: 3,
        name: 'Abierta Media',
        isOpenAtArrival: true,
        distanceToRouteKm: 0.8,
        fuel95: 1.4,
      },
    ],
    fuelType: 'fuel95',
    expectedOrder: [2, 3, 1],
  },
  {
    description: 'A igual desvío: menor precio primero',
    stations: [
      {
        id: 1,
        name: 'Abierta Cara',
        isOpenAtArrival: true,
        distanceToRouteKm: 0.5,
        fuel95: 1.8,
      },
      {
        id: 2,
        name: 'Abierta Barata',
        isOpenAtArrival: true,
        distanceToRouteKm: 0.5,
        fuel95: 1.4,
      },
      {
        id: 3,
        name: 'Abierta Media',
        isOpenAtArrival: true,
        distanceToRouteKm: 0.5,
        fuel95: 1.6,
      },
    ],
    fuelType: 'fuel95',
    expectedOrder: [2, 3, 1],
  },
  {
    description: 'Casos con precio faltante (colocar al final del grupo)',
    stations: [
      {
        id: 1,
        name: 'Abierta Sin Precio',
        isOpenAtArrival: true,
        distanceToRouteKm: 0.5,
        fuel95: null,
      },
      {
        id: 2,
        name: 'Abierta Con Precio',
        isOpenAtArrival: true,
        distanceToRouteKm: 0.5,
        fuel95: 1.5,
      },
      {
        id: 3,
        name: 'Abierta Sin Precio 2',
        isOpenAtArrival: true,
        distanceToRouteKm: 0.5,
        fuel95: null,
      },
    ],
    fuelType: 'fuel95',
    expectedOrder: [2, 1, 3],
  },
  {
    description: 'Orden completo: abiertas > desconocidas > cerradas, luego desvío, luego precio',
    stations: [
      {
        id: 1,
        name: 'Cerrada Cerca',
        isOpenAtArrival: false,
        distanceToRouteKm: 0.1,
        fuel95: 1.3,
      },
      {
        id: 2,
        name: 'Abierta Lejos',
        isOpenAtArrival: true,
        distanceToRouteKm: 1.5,
        fuel95: 1.8,
      },
      {
        id: 3,
        name: 'Desconocida',
        isOpenAtArrival: 'unknown',
        distanceToRouteKm: 0.2,
        fuel95: 1.2,
      },
      {
        id: 4,
        name: 'Abierta Cerca',
        isOpenAtArrival: true,
        distanceToRouteKm: 0.3,
        fuel95: 1.6,
      },
    ],
    fuelType: 'fuel95',
    expectedOrder: [4, 2, 3, 1],
  },
  {
    description: 'FuelDiesel como tipo de combustible',
    stations: [
      {
        id: 1,
        name: 'Abierta Diesel Caro',
        isOpenAtArrival: true,
        distanceToRouteKm: 0.5,
        fuelDiesel: 1.8,
        fuel95: 1.5,
      },
      {
        id: 2,
        name: 'Abierta Diesel Barato',
        isOpenAtArrival: true,
        distanceToRouteKm: 0.5,
        fuelDiesel: 1.4,
        fuel95: 1.6,
      },
    ],
    fuelType: 'fuelDiesel',
    expectedOrder: [2, 1],
  },
  {
    description: 'Array vacío',
    stations: [],
    fuelType: 'fuel95',
    expectedOrder: [],
  },
  {
    description: 'Una sola gasolinera',
    stations: [
      {
        id: 1,
        name: 'Sola',
        isOpenAtArrival: true,
        distanceToRouteKm: 0.5,
        fuel95: 1.5,
      },
    ],
    fuelType: 'fuel95',
    expectedOrder: [1],
  },
]

function runRankStationsTests() {
  console.group('Ejecutando pruebas de rankRouteStations')
  console.log('='.repeat(60))

  let passed = 0
  let failed = 0

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i]
    const { description, stations, fuelType, expectedOrder } = testCase

    let result
    try {
      result = rankRouteStations(stations, fuelType)
    } catch (error) {
      console.error(`\n[FAIL] Test ${i + 1}: ${description}`)
      console.error(`   Error: ${error.message}`)
      console.error(`   Stack: ${error.stack}`)
      failed++
      continue
    }

    const resultIds = result.map((s) => s.id)
    const success = JSON.stringify(resultIds) === JSON.stringify(expectedOrder)

    if (success) {
      console.log(`\n[OK] Test ${i + 1}: ${description}`)
      console.log(`   Orden esperado: [${expectedOrder.join(', ')}]`)
      console.log(`   Orden obtenido: [${resultIds.join(', ')}]`)
      passed++
    } else {
      console.error(`\n[FAIL] Test ${i + 1}: ${description}`)
      console.error(`   Orden esperado: [${expectedOrder.join(', ')}]`)
      console.error(`   Orden obtenido: [${resultIds.join(', ')}]`)
      console.error(`   Detalles:`)
      result.forEach((station, idx) => {
        console.error(
          `     ${idx + 1}. ${station.name}: open=${station.isOpenAtArrival}, detour=${station.distanceToRouteKm}, price=${station[fuelType]}`
        )
      })
      failed++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log(`\nResumen:`)
  console.log(`   Pasados: ${passed}`)
  console.log(`   Fallidos: ${failed}`)
  console.log(`   Total: ${testCases.length}`)
  console.log(`   Tasa de éxito: ${((passed / testCases.length) * 100).toFixed(1)}%\n`)

  if (failed === 0) {
    console.log('¡Todas las pruebas pasaron!\n')
  } else {
    console.error('Algunas pruebas fallaron. Revisa los resultados arriba.\n')
  }

  console.groupEnd()
}

if (typeof window !== 'undefined') {
  window.runRankStationsTests = runRankStationsTests
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runRankStationsTests }
}

export { runRankStationsTests }

runRankStationsTests()
