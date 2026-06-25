import { lexer } from './lexer'

console.log('======================================================================')
console.log('   PRUEBA DE CASOS DE PRUEBA DEL ANALIZADOR LÉXICO (LEXER)            ')
console.log('======================================================================\n')

// CP 1: Verificar tokenización básica de la estructura REGISTRAR y llaves de apertura/cierre
const cp1Input = 'REGISTRAR { }'
console.log('[CP 1] Datos de entrada:', JSON.stringify(cp1Input))
const cp1Tokens = lexer(cp1Input)
console.log('Tokens generados:', cp1Tokens.map(t => t.tipo))
const cp1Esperados = ['REGISTRAR', 'LLAVE_ABRE', 'LLAVE_CIERRA', 'EOF']
const cp1Ok = cp1Tokens.length === cp1Esperados.length && cp1Tokens.every((t, idx) => t.tipo === cp1Esperados[idx])
console.log('¿Resultado esperado coincide?', cp1Ok ? 'SÍ (PASÓ)' : 'NO (FALLÓ)')
console.log('----------------------------------------------------------------------\n')

// CP 2: Verificar la correcta omisión de comentarios de línea en el análisis léxico
const cp2Input = `// Choque leve
REGISTRAR { }`
console.log('[CP 2] Datos de entrada:', JSON.stringify(cp2Input))
const cp2Tokens = lexer(cp2Input)
console.log('Tokens generados:', cp2Tokens.map(t => t.tipo))
const cp2Ok = cp2Tokens.length === cp1Esperados.length && cp2Tokens.every((t, idx) => t.tipo === cp1Esperados[idx])
console.log('¿Resultado esperado coincide?', cp2Ok ? 'SÍ (PASÓ)' : 'NO (FALLÓ)')
console.log('----------------------------------------------------------------------\n')

// CP 9 (Inválido): Verificar que el tokenizador detecta caracteres no válidos (arroba)
const cp9Input = 'REGISTRAR { @ }'
console.log('[CP 9 - INVÁLIDO] Datos de entrada:', JSON.stringify(cp9Input))
const cp9Tokens = lexer(cp9Input)
console.log('Tokens generados:', cp9Tokens.map(t => t.tipo))
const tieneError = cp9Tokens.some(t => t.tipo === 'ERROR')
const tokenError = cp9Tokens.find(t => t.tipo === 'ERROR')
console.log('¿Se detectó token de ERROR?', tieneError ? `SÍ (PASÓ) -> Encontrado: "${tokenError?.valor}"` : 'NO (FALLÓ)')
console.log('----------------------------------------------------------------------\n')
