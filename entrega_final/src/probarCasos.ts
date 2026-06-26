import { lexer } from './lexer'
import { Parser } from './parser'

console.log('======================================================================')
console.log('            SISTEMA DE MONITOREO VIAL - CASOS DE PRUEBA              ')
console.log('======================================================================\n')

console.log('======================================================================')
console.log('   PARTE 1: CASOS DE PRUEBA VÁLIDOS (CP 1 a CP 8)                     ')
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

// CP 7: Verificar la correcta tokenización de identificadores alfanuméricos (que contienen números, como las ubicaciones km3 o km4)
const cp7Input = 'REGISTRAR { km3 }'
console.log('[CP 7] Datos de entrada:', JSON.stringify(cp7Input))
const cp7Tokens = lexer(cp7Input)
console.log('Tokens generados:', cp7Tokens.map(t => t.tipo))
const cp7Esperados = ['REGISTRAR', 'LLAVE_ABRE', 'IDENTIFICADOR', 'LLAVE_CIERRA', 'EOF']
const cp7Ok = cp7Tokens.length === cp7Esperados.length && cp7Tokens.every((t, idx) => t.tipo === cp7Esperados[idx])
console.log('¿Resultado esperado coincide?', cp7Ok ? 'SÍ (PASÓ)' : 'NO (FALLÓ)')
console.log('----------------------------------------------------------------------\n')

// CP 3: Análisis sintáctico de reporte de incidente básico con múltiples alertas y acciones
const cp3Input = `REGISTRAR {
  INCIDENTE: accidente EN puente_sur PRIORIDAD alta
    ACCION llamar_policia, llamar_ambulancia
    ALERTA: desviar EN puente_sur;
}`
console.log('[CP 3] Datos de entrada:\n' + cp3Input)
let cp3Ast: any = null
try {
  const tokens = lexer(cp3Input)
  const parser = new Parser(tokens)
  cp3Ast = parser.analizar()
  console.log('¿Resultado sintáctico correcto?', cp3Ast !== null ? 'SÍ (PASÓ)' : 'NO (FALLÓ)')
} catch (error) {
  console.error('¿Resultado sintáctico correcto? NO (FALLÓ: Error inesperado)', (error as Error).message)
}
console.log('----------------------------------------------------------------------\n')

// CP 4: Análisis sintáctico de reporte de alerta autónoma
const cp4Input = `REGISTRAR {
  ALERTA: reducir_velocidad EN puente_norte;
}`
console.log('[CP 4] Datos de entrada:\n' + cp4Input)
let cp4Ast: any = null
try {
  const tokens = lexer(cp4Input)
  const parser = new Parser(tokens)
  cp4Ast = parser.analizar()
  console.log('¿Resultado sintáctico correcto?', cp4Ast !== null ? 'SÍ (PASÓ)' : 'NO (FALLÓ)')
} catch (error) {
  console.error('¿Resultado sintáctico correcto? NO (FALLÓ: Error inesperado)', (error as Error).message)
}
console.log('----------------------------------------------------------------------\n')

// CP 5: Estructura jerárquica del AST para el CP 3
console.log('[CP 5 - AST de CP 3] Verificando estructura del AST:')
if (cp3Ast) {
  const inst = cp3Ast.instrucciones[0]
  if (inst && inst.tipo === 'ReporteIncidente') {
    const resp = inst.respuesta
    const esValido = 
      inst.tipoIncidente === 'accidente' &&
      inst.ubicacion === 'puente_sur' &&
      inst.prioridad === 'alta' &&
      resp.acciones?.includes('llamar_policia') &&
      resp.acciones?.includes('llamar_ambulancia') &&
      resp.alertas?.[0].notificacion === 'desviar' &&
      resp.orden === 'acciones_alertas'
    
    console.log('Tipo de incidente:', inst.tipoIncidente)
    console.log('Acciones a tomar:', resp.acciones)
    console.log('Alertas a emitir:', resp.alertas?.map((a: any) => a.notificacion))
    console.log('Orden de respuesta:', resp.orden)
    console.log('¿Estructura esperada coincide?', esValido ? 'SÍ (PASÓ)' : 'NO (FALLÓ)')
  } else {
    console.log('¿Estructura esperada coincide? NO (FALLÓ: Tipo de instrucción no es ReporteIncidente)')
  }
} else {
  console.log('¿Estructura esperada coincide? NO (FALLÓ: AST de CP 3 es null)')
}
console.log('----------------------------------------------------------------------\n')

// CP 6: Estructura del AST para la alerta autónoma (CP 4)
console.log('[CP 6 - AST de CP 4] Verificando estructura del AST:')
if (cp4Ast) {
  const inst = cp4Ast.instrucciones[0]
  if (inst && inst.tipo === 'ReporteAlerta') {
    const esValido = 
      inst.notificacion === 'reducir_velocidad' &&
      inst.ubicacion === 'puente_norte'
    
    console.log('Notificación de alerta:', inst.notificacion)
    console.log('Ubicación de alerta:', inst.ubicacion)
    console.log('¿Estructura esperada coincide?', esValido ? 'SÍ (PASÓ)' : 'NO (FALLÓ)')
  } else {
    console.log('¿Estructura esperada coincide? NO (FALLÓ: Tipo de instrucción no es ReporteAlerta)')
  }
} else {
  console.log('¿Estructura esperada coincide? NO (FALLÓ: AST de CP 4 es null)')
}
console.log('----------------------------------------------------------------------\n')

// CP 8: Análisis sintáctico y generación de AST con orden alternativo de respuesta (ALERTA primero, luego ACCION)
const cp8Input = `REGISTRAR {
  INCIDENTE: congestion EN acceso_corrientes PRIORIDAD media
    ALERTA: reducir_velocidad EN acceso_corrientes
    ACCION llamar_grua;
}`
console.log('[CP 8] Datos de entrada:\n' + cp8Input)
try {
  const tokens = lexer(cp8Input)
  const parser = new Parser(tokens)
  const ast = parser.analizar()
  console.log('¿Resultado sintáctico correcto?', ast !== null ? 'SÍ (PASÓ)' : 'NO (FALLÓ)')

  const inst = ast.instrucciones[0]
  if (inst && inst.tipo === 'ReporteIncidente') {
    const resp = inst.respuesta
    const esValido = 
      resp.orden === 'alertas_acciones' &&
      resp.alertas?.[0].notificacion === 'reducir_velocidad' &&
      resp.acciones?.includes('llamar_grua')
    console.log('Orden de respuesta:', resp.orden)
    console.log('¿Estructura esperada coincide?', esValido ? 'SÍ (PASÓ)' : 'NO (FALLÓ)')
  } else {
    console.log('¿Estructura esperada coincide? NO (FALLÓ: Tipo de instrucción no es ReporteIncidente)')
  }
} catch (error) {
  console.error('¿Resultado sintáctico correcto? NO (FALLÓ: Error inesperado)', (error as Error).message)
}
console.log('----------------------------------------------------------------------\n')


console.log('======================================================================')
console.log('   PARTE 2: CASOS DE PRUEBA INVÁLIDOS (CP 9 a CP 12)                  ')
console.log('======================================================================\n')

// CP 9 (Inválido): Verificar que el tokenizador detecta caracteres no válidos (arroba)
const cp9Input = 'REGISTRAR { @ }'
console.log('[CP 9 - INVÁLIDO] Datos de entrada:', JSON.stringify(cp9Input))
const cp9Tokens = lexer(cp9Input)
console.log('Tokens generados:', cp9Tokens.map(t => t.tipo))
const tieneError = cp9Tokens.some(t => t.tipo === 'ERROR')
const tokenError = cp9Tokens.find(t => t.tipo === 'ERROR')
console.log('¿Se detectó token de ERROR?', tieneError ? `SÍ (PASÓ) -> Encontrado: "${tokenError?.valor}"` : 'NO (FALLÓ)')
console.log('----------------------------------------------------------------------\n')

// CP 10 (Inválido): Falta de delimitación estructural por llaves
const cp10Input = `REGISTRAR
  ALERTA: desviar EN puente_sur;`
console.log('[CP 10 - INVÁLIDO] Datos de entrada:\n' + cp10Input)
try {
  const tokens = lexer(cp10Input)
  const parser = new Parser(tokens)
  parser.analizar()
  console.log('¿Se detectó el error sintáctico?', 'NO (FALLÓ: Debería haber fallado)')
} catch (error) {
  console.log('¿Se detectó el error sintáctico?', `SÍ (PASÓ) -> Mensaje de error: "${(error as Error).message}"`)
}
console.log('----------------------------------------------------------------------\n')

// CP 11 (Inválido): Error semántico por identificadores no registrados
const cp11Input = `REGISTRAR {
  INCIDENTE: ovni EN puente_sur PRIORIDAD alta;
}`
console.log('[CP 11 - INVÁLIDO] Datos de entrada:\n' + cp11Input)
try {
  const tokens = lexer(cp11Input)
  const parser = new Parser(tokens)
  parser.analizar()
  console.log('¿Se detectó el error semántico?', 'NO (FALLÓ: Debería haber fallado)')
} catch (error) {
  console.log('¿Se detectó el error semántico?', `SÍ (PASÓ) -> Mensaje de error: "${(error as Error).message}"`)
}
console.log('----------------------------------------------------------------------\n')

// CP 12 (Inválido): Error sintáctico por omisión del punto y coma final
const cp12Input = `REGISTRAR {
  ALERTA: desviar EN puente_sur
}`
console.log('[CP 12 - INVÁLIDO] Datos de entrada:\n' + cp12Input)
try {
  const tokens = lexer(cp12Input)
  const parser = new Parser(tokens)
  parser.analizar()
  console.log('¿Se detectó el error sintáctico?', 'NO (FALLÓ: Debería haber fallado)')
} catch (error) {
  console.log('¿Se detectó el error sintáctico?', `SÍ (PASÓ) -> Mensaje de error: "${(error as Error).message}"`)
}
console.log('----------------------------------------------------------------------\n')
