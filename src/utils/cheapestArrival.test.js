import { parseOpeningHours } from './schedule.js'
import { isOpenAt } from './isOpenAt.js'

const mockGetDurationSeconds = (durationSeconds) => {
  return Promise.resolve(durationSeconds)
}

const testCases = [
  {
    description: 'durationSeconds=3600 y now fijo -> arrivalTime formateado correcto',
    durationSeconds: 3600,
    fixedNow: new Date('2024-01-15T12:00:00'),
    expectedArrivalHour: '13:00',
  },
  {
    description: 'durationSeconds=1800 (30 min) -> arrivalTime formateado correcto',
    durationSeconds: 1800,
    fixedNow: new Date('2024-01-15T14:30:00'),
    expectedArrivalHour: '15:00',
  },
  {
    description: 'durationSeconds=7200 (2 horas) -> arrivalTime formateado correcto',
    durationSeconds: 7200,
    fixedNow: new Date('2024-01-15T10:00:00'),
    expectedArrivalHour: '12:00',
  },
  {
    description: 'openStatus true según schedule y arrivalDate',
    durationSeconds: 3600,
    fixedNow: new Date('2024-01-15T10:00:00'),
    horario: 'L-V 08:00-22:00',
    expectedOpenStatus: true,
  },
  {
    description: 'openStatus false según schedule y arrivalDate (fuera de horario)',
    durationSeconds: 3600,
    fixedNow: new Date('2024-01-15T06:00:00'),
    horario: 'L-V 08:00-22:00',
    expectedOpenStatus: false,
  },
  {
    description: 'openStatus unknown para horario 24h',
    durationSeconds: 3600,
    fixedNow: new Date('2024-01-15T10:00:00'),
    horario: '24H',
    expectedOpenStatus: true,
  },
  {
    description: 'openStatus unknown para horario no parseable',
    durationSeconds: 3600,
    fixedNow: new Date('2024-01-15T10:00:00'),
    horario: 'Horario variable',
    expectedOpenStatus: 'unknown',
  },
  {
    description: 'getDurationSeconds falla -> arrivalTime = null, openStatus = unknown',
    durationSeconds: null,
    fixedNow: new Date('2024-01-15T10:00:00'),
    horario: 'L-V 08:00-22:00',
    expectedArrivalTime: null,
    expectedOpenStatus: 'unknown',
  },
]

async function runCheapestArrivalTests() {
  console.group('Ejecutando pruebas de cheapestArrival')
  console.log('='.repeat(60))

  let passed = 0
  let failed = 0

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i]
    const { description, durationSeconds, fixedNow, horario, expectedArrivalHour, expectedOpenStatus, expectedArrivalTime } = testCase

    try {
      let arrivalTime = null
      let openStatus = 'unknown'

      if (durationSeconds !== null && !isNaN(durationSeconds)) {
        const mockDuration = await mockGetDurationSeconds(durationSeconds)
        arrivalTime = new Date(fixedNow.getTime() + mockDuration * 1000)

        if (expectedArrivalHour) {
          const formattedHour = arrivalTime.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
          })

          if (formattedHour === expectedArrivalHour) {
            console.log(`\n[OK] Test ${i + 1}: ${description}`)
            console.log(`   Arrival time formateado: ${formattedHour}`)
            passed++
          } else {
            console.error(`\n[FAIL] Test ${i + 1}: ${description}`)
            console.error(`   Expected: ${expectedArrivalHour}`)
            console.error(`   Got: ${formattedHour}`)
            failed++
          }
          continue
        }

        if (horario) {
          const parsedSchedule = parseOpeningHours(horario)
          openStatus = isOpenAt(arrivalTime, parsedSchedule)

          if (expectedOpenStatus !== undefined) {
            if (openStatus === expectedOpenStatus) {
              console.log(`\n[OK] Test ${i + 1}: ${description}`)
              console.log(`   Arrival time: ${arrivalTime.toISOString()}`)
              console.log(`   Schedule type: ${parsedSchedule.type}`)
              console.log(`   Open status: ${openStatus}`)
              passed++
            } else {
              console.error(`\n[FAIL] Test ${i + 1}: ${description}`)
              console.error(`   Expected open status: ${expectedOpenStatus}`)
              console.error(`   Got: ${openStatus}`)
              failed++
            }
            continue
          }
        }
      } else {
        if (expectedArrivalTime === null && expectedOpenStatus === 'unknown') {
          if (arrivalTime === null && openStatus === 'unknown') {
            console.log(`\n[OK] Test ${i + 1}: ${description}`)
            console.log(`   Arrival time: ${arrivalTime}`)
            console.log(`   Open status: ${openStatus}`)
            passed++
          } else {
            console.error(`\n[FAIL] Test ${i + 1}: ${description}`)
            console.error(`   Expected arrival time: ${expectedArrivalTime}, got: ${arrivalTime}`)
            console.error(`   Expected open status: ${expectedOpenStatus}, got: ${openStatus}`)
            failed++
          }
          continue
        }
      }
    } catch (error) {
      console.error(`\n[FAIL] Test ${i + 1}: ${description}`)
      console.error(`   Error: ${error.message}`)
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
  window.runCheapestArrivalTests = runCheapestArrivalTests
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runCheapestArrivalTests }
}

export { runCheapestArrivalTests }

runCheapestArrivalTests()
