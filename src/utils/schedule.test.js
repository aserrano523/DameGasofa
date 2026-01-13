import { parseOpeningHours } from './schedule.js'

const testCases = [
  {
    input: '24H',
    expectedType: '24h',
    description: 'Formato simple 24H',
  },
  {
    input: 'Abierto 24 horas',
    expectedType: '24h',
    description: 'Formato descriptivo 24 horas',
  },
  {
    input: '24 HORAS',
    expectedType: '24h',
    description: 'Formato 24 HORAS en mayúsculas',
  },
  {
    input: 'L-D 08:00-22:00',
    expectedType: 'weekly',
    description: 'Todos los días mismo horario (L-D)',
  },
  {
    input: 'Lunes a Domingo 07:00-23:00',
    expectedType: 'weekly',
    description: 'Todos los días mismo horario (texto completo)',
  },
  {
    input: 'L-V 08:00-22:00; S 09:00-14:00',
    expectedType: 'weekly',
    description: 'Laborables y sábado diferenciados',
  },
  {
    input: 'L-S 06:00-23:00; D 08:00-22:00',
    expectedType: 'weekly',
    description: 'Lunes a sábado y domingo diferenciados',
  },
  {
    input: 'L-V 08:00-22:00',
    expectedType: 'weekly',
    description: 'Solo laborables',
  },
  {
    input: 'M 10:00-20:00',
    expectedType: 'weekly',
    description: 'Día individual (martes)',
  },
  {
    input: 'L-X 08:00-18:00; J-V 09:00-19:00',
    expectedType: 'weekly',
    description: 'Múltiples rangos de días',
  },
  {
    input: 'Horario variable',
    expectedType: 'unknown',
    description: 'Texto ambiguo - horario variable',
  },
  {
    input: 'Consultar',
    expectedType: 'unknown',
    description: 'Texto ambiguo - consultar',
  },
  {
    input: 'Según disponibilidad',
    expectedType: 'unknown',
    description: 'Texto ambiguo - según disponibilidad',
  },
  {
    input: '',
    expectedType: 'unknown',
    description: 'String vacío',
  },
  {
    input: null,
    expectedType: 'unknown',
    description: 'Valor null',
  },
  {
    input: 'L-V 25:00-30:00',
    expectedType: 'unknown',
    description: 'Horas inválidas (25:00, 30:00)',
  },
  {
    input: 'L-X 08:00',
    expectedType: 'unknown',
    description: 'Formato incompleto (falta hora fin)',
  },
  {
    input: 'L-D',
    expectedType: 'unknown',
    description: 'Solo días sin horario',
  },
  {
    input: '08:00-22:00',
    expectedType: 'unknown',
    description: 'Solo horario sin días',
  },
  {
    input: 'L-V 22:00-08:00',
    expectedType: 'unknown',
    description: 'Horario nocturno (end < start)',
  },
  {
    input: 'L-V 08:00-08:00',
    expectedType: 'unknown',
    description: 'Horario inválido (start = end)',
  },
  {
    input: 'XYZ 10:00-20:00',
    expectedType: 'unknown',
    description: 'Días inválidos',
  },
  {
    input: 'L-V 8:0-22:0',
    expectedType: 'weekly',
    description: 'Formato de hora sin ceros (debe normalizarse)',
  },
  {
    input: 'L-V 08:00-22:00; S-D 09:00-14:00',
    expectedType: 'weekly',
    description: 'Múltiples partes con punto y coma',
  },
  {
    input: '   L-V   08:00-22:00   ',
    expectedType: 'weekly',
    description: 'Espacios extra alrededor',
  },
  {
    input: 'L-V 08:00 - 22:00',
    expectedType: 'weekly',
    description: 'Espacios alrededor del guion de horas',
  },
]

function runScheduleTests() {
  console.log('Ejecutando pruebas de parseOpeningHours\n')
  console.log('='.repeat(60))

  let passed = 0
  let failed = 0

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i]
    const { input, expectedType, description } = testCase

    let result
    try {
      result = parseOpeningHours(input)
    } catch (error) {
      console.log(`\n[FAIL] Test ${i + 1}: ${description}`)
      console.log(`   Input: ${JSON.stringify(input)}`)
      console.log(`   Error: ${error.message}`)
      failed++
      continue
    }

    const actualType = result ? result.type : 'undefined'
    const success = actualType === expectedType

    if (success) {
      console.log(`\n[OK] Test ${i + 1}: ${description}`)
      console.log(`   Input: ${JSON.stringify(input)}`)
      console.log(`   Result: type=${actualType}`)
      if (actualType === 'weekly' && result.intervals) {
        const dayCount = Object.keys(result.intervals).length
        console.log(`   Intervals: ${dayCount} día(s) configurado(s)`)
      }
      passed++
    } else {
      console.log(`\n[FAIL] Test ${i + 1}: ${description}`)
      console.log(`   Input: ${JSON.stringify(input)}`)
      console.log(`   Expected: type=${expectedType}`)
      console.log(`   Got: type=${actualType}`)
      if (result && result.intervals) {
        console.log(`   Intervals: ${JSON.stringify(result.intervals)}`)
      }
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
    console.log('Algunas pruebas fallaron. Revisa los resultados arriba.\n')
  }
}

if (typeof window !== 'undefined') {
  window.runScheduleTests = runScheduleTests
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runScheduleTests }
}

export { runScheduleTests }

runScheduleTests();
