import { isOpenAt } from './isOpenAt.js'
import { parseOpeningHours } from './schedule.js'

const testCases = [
  {
    description: '24h siempre abierto - cualquier hora',
    schedule: { type: '24h' },
    arrivalDate: new Date('2024-01-15T10:30:00'),
    expected: true,
  },
  {
    description: '24h siempre abierto - medianoche',
    schedule: { type: '24h' },
    arrivalDate: new Date('2024-01-15T00:00:00'),
    expected: true,
  },
  {
    description: '24h siempre abierto - 23:59',
    schedule: { type: '24h' },
    arrivalDate: new Date('2024-01-15T23:59:00'),
    expected: true,
  },
  {
    description: 'weekly abierto dentro del rango - lunes 10:00',
    schedule: parseOpeningHours('L-V 08:00-22:00'),
    arrivalDate: new Date('2024-01-15T10:00:00'),
    expected: true,
  },
  {
    description: 'weekly abierto dentro del rango - miércoles 15:30',
    schedule: parseOpeningHours('L-V 08:00-22:00'),
    arrivalDate: new Date('2024-01-17T15:30:00'),
    expected: true,
  },
  {
    description: 'weekly cerrado fuera del rango - antes de apertura',
    schedule: parseOpeningHours('L-V 08:00-22:00'),
    arrivalDate: new Date('2024-01-15T07:59:00'),
    expected: false,
  },
  {
    description: 'weekly cerrado fuera del rango - después de cierre',
    schedule: parseOpeningHours('L-V 08:00-22:00'),
    arrivalDate: new Date('2024-01-15T22:01:00'),
    expected: false,
  },
  {
    description: 'borde exacto de apertura (08:00) - debe estar abierto',
    schedule: parseOpeningHours('L-V 08:00-22:00'),
    arrivalDate: new Date('2024-01-15T08:00:00'),
    expected: true,
  },
  {
    description: 'borde exacto de cierre (22:00) - debe estar cerrado',
    schedule: parseOpeningHours('L-V 08:00-22:00'),
    arrivalDate: new Date('2024-01-15T22:00:00'),
    expected: false,
  },
  {
    description: 'día no cubierto - domingo con horario L-V',
    schedule: parseOpeningHours('L-V 08:00-22:00'),
    arrivalDate: new Date('2024-01-14T12:00:00'),
    expected: false,
  },
  {
    description: 'sábado vs lunes - sábado con horario L-V',
    schedule: parseOpeningHours('L-V 08:00-22:00'),
    arrivalDate: new Date('2024-01-13T12:00:00'),
    expected: false,
  },
  {
    description: 'sábado vs lunes - lunes con horario L-V',
    schedule: parseOpeningHours('L-V 08:00-22:00'),
    arrivalDate: new Date('2024-01-15T12:00:00'),
    expected: true,
  },
  {
    description: 'sábado con horario específico',
    schedule: parseOpeningHours('L-V 08:00-22:00; S 09:00-14:00'),
    arrivalDate: new Date('2024-01-13T12:00:00'),
    expected: true,
  },
  {
    description: 'sábado fuera de horario específico',
    schedule: parseOpeningHours('L-V 08:00-22:00; S 09:00-14:00'),
    arrivalDate: new Date('2024-01-13T15:00:00'),
    expected: false,
  },
  {
    description: 'llegada exactamente a medianoche',
    schedule: parseOpeningHours('L-D 00:00-23:59'),
    arrivalDate: new Date('2024-01-15T00:00:00'),
    expected: true,
  },
  {
    description: 'unknown schedule - debe devolver unknown',
    schedule: { type: 'unknown' },
    arrivalDate: new Date('2024-01-15T12:00:00'),
    expected: 'unknown',
  },
  {
    description: 'schedule vacío/null - debe devolver unknown',
    schedule: null,
    arrivalDate: new Date('2024-01-15T12:00:00'),
    expected: 'unknown',
  },
  {
    description: 'arrivalDate inválida - debe devolver unknown',
    schedule: parseOpeningHours('L-V 08:00-22:00'),
    arrivalDate: new Date('invalid'),
    expected: 'unknown',
  },
  {
    description: 'múltiples intervalos - dentro del primero',
    schedule: parseOpeningHours('L-V 08:00-12:00; L-V 14:00-18:00'),
    arrivalDate: new Date('2024-01-15T10:00:00'),
    expected: true,
  },
  {
    description: 'múltiples intervalos - dentro del segundo',
    schedule: parseOpeningHours('L-V 08:00-12:00; L-V 14:00-18:00'),
    arrivalDate: new Date('2024-01-15T15:00:00'),
    expected: true,
  },
  {
    description: 'múltiples intervalos - entre intervalos (cerrado)',
    schedule: parseOpeningHours('L-V 08:00-12:00; L-V 14:00-18:00'),
    arrivalDate: new Date('2024-01-15T13:00:00'),
    expected: false,
  },
]

function runIsOpenAtTests() {
  console.group('Ejecutando pruebas de isOpenAt')
  console.log('='.repeat(60))

  let passed = 0
  let failed = 0

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i]
    const { description, schedule, arrivalDate, expected } = testCase

    let result
    try {
      result = isOpenAt(arrivalDate, schedule)
    } catch (error) {
      console.error(`\n[FAIL] Test ${i + 1}: ${description}`)
      console.error(`   Error: ${error.message}`)
      console.error(`   Stack: ${error.stack}`)
      failed++
      continue
    }

    const success = result === expected

    if (success) {
      console.log(`\n[OK] Test ${i + 1}: ${description}`)
      console.log(`   Arrival: ${arrivalDate.toISOString()}`)
      console.log(`   Schedule type: ${schedule?.type || 'null'}`)
      console.log(`   Result: ${result}`)
      passed++
    } else {
      console.error(`\n[FAIL] Test ${i + 1}: ${description}`)
      console.error(`   Arrival: ${arrivalDate.toISOString()}`)
      console.error(`   Schedule type: ${schedule?.type || 'null'}`)
      console.error(`   Expected: ${expected}`)
      console.error(`   Got: ${result}`)
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
  window.runIsOpenAtTests = runIsOpenAtTests
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runIsOpenAtTests }
}

export { runIsOpenAtTests }

runIsOpenAtTests()
