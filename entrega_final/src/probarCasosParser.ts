import { lexer } from './lexer'
import { Parser } from './parser'

console.log('======================================================================')
console.log('   PRUEBA DE CASOS DE PRUEBA DEL PARSER Y GENERACIÓN DE AST           ')
console.log('======================================================================\n')

// CP 3: Análisis sintáctico de reporte de incidente básico con múltiples alertas y acciones
const cp3Input = `REGISTRAR {
  INCIDENTE: accidente EN puente_sur PRIORIDAD alta
    ACCION llamar_policia, llamar_ambulancia
    ALERTA: desviar EN puente_sur;
}`
console.log('[CP 3] Datos de entrada:\n' + cp3Input)
try {
  const tokens = lexer(cp3Input)
  const parser = new Parser(tokens)
  const ast = parser.analizar()
  console.log('¿Resultado sintáctico correcto?', ast !== null ? 'SÍ (PASÓ)' : 'NO (FALLÓ)')

  // CP 5: Estructura jerárquica del AST para el CP 3
  console.log('\n[CP 5 - AST de CP 3] Verificando estructura del AST:')
  const inst = ast.instrucciones[0]
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
    console.log('Alertas a emitir:', resp.alertas?.map(a => a.notificacion))
    console.log('Orden de respuesta:', resp.orden)
    console.log('¿Estructura esperada coincide?', esValido ? 'SÍ (PASÓ)' : 'NO (FALLÓ)')
  } else {
    console.log('¿Estructura esperada coincide? NO (FALLÓ: Tipo de instrucción no es ReporteIncidente)')
  }

} catch (error) {
  console.error('¿Resultado sintáctico correcto? NO (FALLÓ: Error inesperado)', (error as Error).message)
}
console.log('----------------------------------------------------------------------\n')

// CP 4: Análisis sintáctico de reporte de alerta autónoma
const cp4Input = `REGISTRAR {
  ALERTA: reducir_velocidad EN puente_norte;
}`
console.log('[CP 4] Datos de entrada:\n' + cp4Input)
try {
  const tokens = lexer(cp4Input)
  const parser = new Parser(tokens)
  const ast = parser.analizar()
  console.log('¿Resultado sintáctico correcto?', ast !== null ? 'SÍ (PASÓ)' : 'NO (FALLÓ)')

  // CP 6: Estructura del AST para la alerta autónoma (CP 4)
  console.log('\n[CP 6 - AST de CP 4] Verificando estructura del AST:')
  const inst = ast.instrucciones[0]
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

} catch (error) {
  console.error('¿Resultado sintáctico correcto? NO (FALLÓ: Error inesperado)', (error as Error).message)
}
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
