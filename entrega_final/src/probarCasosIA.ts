import { lexer } from './lexer'
import { Parser } from './parser'

console.log('======================================================================')
console.log('   PRUEBA DE CASOS DE PRUEBA DE INTEGRACIÓN DE IA Y ACTUADORES         ')
console.log('======================================================================\n')

interface DeteccionCamaraIA {
  idCamara: string
  ubicacion: string
  eventoDetectado: string
  confianza: number
  fechaHora: string
}

// Generador de código idéntico al de demostracionIA.ts
function generarCodigoDSL(deteccion: DeteccionCamaraIA): string {
  let prioridad = 'media'
  if (deteccion.eventoDetectado === 'accidente' && deteccion.confianza > 0.8) {
    prioridad = 'alta'
  } else if (deteccion.eventoDetectado === 'autolisis') {
    prioridad = 'critica'
  }

  let respuestaDSL = ''
  if (deteccion.eventoDetectado === 'accidente') {
    respuestaDSL = `
    ACCION llamar_policia, llamar_ambulancia
    ALERTA: desviar EN ${deteccion.ubicacion}`
  } else if (deteccion.eventoDetectado === 'congestion') {
    respuestaDSL = `
    ALERTA: reducir_velocidad EN ${deteccion.ubicacion}`
  } else if (deteccion.eventoDetectado === 'autolisis') {
    respuestaDSL = `
    ACCION llamar_ambulancia, llamar_policia, llamar_bomberos
    ALERTA: cerrar_acceso EN ${deteccion.ubicacion}`
  } else {
    respuestaDSL = `
    ACCION llamar_policia`
  }

  return `REGISTRAR {
  // Generado automaticamente por IA
  INCIDENTE: ${deteccion.eventoDetectado} EN ${deteccion.ubicacion} PRIORIDAD ${prioridad} ${respuestaDSL};
}`
}

// Simuladores de actuadores físicos
let llamadasRealizadas: string[] = []
let cartelLEDMensaje = ''

function ejecutarDespachoVial(nodoAST: any) {
  llamadasRealizadas = []
  cartelLEDMensaje = ''

  if (!nodoAST || nodoAST.tipo !== 'Programa') return

  nodoAST.instrucciones.forEach((inst: any) => {
    if (inst.tipo === 'ReporteIncidente') {
      const resp = inst.respuesta
      if (resp) {
        if (resp.acciones) {
          resp.acciones.forEach((accion: string) => {
            llamadasRealizadas.push(accion)
          })
        }
        if (resp.alertas && resp.alertas.length > 0) {
          cartelLEDMensaje = `ALERTA: ${resp.alertas[0].notificacion.toUpperCase()} EN ${resp.alertas[0].ubicacion.toUpperCase()}`
        }
      }
    }
  })
}

// CP 7: Mapeo de autolisis a prioridad critica y despacho correcto de ambulancia, policia y bomberos
const deteccionAutolisis: DeteccionCamaraIA = {
  idCamara: 'CAM_ZONE_B_04',
  ubicacion: 'puente_sur',
  eventoDetectado: 'autolisis',
  confianza: 0.99,
  fechaHora: new Date().toISOString()
}

console.log('[CP 7] Datos de entrada (Autolisis en Puente Sur):')
console.log(JSON.stringify(deteccionAutolisis, null, 2))
try {
  const dslGenerated = generarCodigoDSL(deteccionAutolisis)
  const tokens = lexer(dslGenerated)
  const parser = new Parser(tokens)
  const ast = parser.analizar()
  
  ejecutarDespachoVial(ast)
  
  console.log('Llamadas de emergencia activadas:', llamadasRealizadas)
  console.log('Mensaje en Cartel LED:', cartelLEDMensaje)
  
  const esCorrecto = 
    llamadasRealizadas.includes('llamar_ambulancia') &&
    llamadasRealizadas.includes('llamar_policia') &&
    llamadasRealizadas.includes('llamar_bomberos') &&
    cartelLEDMensaje === 'ALERTA: CERRAR_ACCESO EN PUENTE_SUR'
  
  console.log('¿Despacho y prioridad correctos?', esCorrecto ? 'SÍ (PASÓ)' : 'NO (FALLÓ)')

} catch (error) {
  console.error('¿Despacho correcto? NO (FALLÓ: Error inesperado)', (error as Error).message)
}
console.log('----------------------------------------------------------------------\n')

// CP 8: Actualización de mensaje del cartel LED al detectar congestión
const deteccionCongestion: DeteccionCamaraIA = {
  idCamara: 'CAM_ZONE_A_01',
  ubicacion: 'acceso_corrientes',
  eventoDetectado: 'congestion',
  confianza: 0.92,
  fechaHora: new Date().toISOString()
}

console.log('[CP 8] Datos de entrada (Congestión en Acceso Corrientes):')
console.log(JSON.stringify(deteccionCongestion, null, 2))
try {
  const dslGenerated = generarCodigoDSL(deteccionCongestion)
  const tokens = lexer(dslGenerated)
  const parser = new Parser(tokens)
  const ast = parser.analizar()
  
  ejecutarDespachoVial(ast)
  
  console.log('Mensaje en Cartel LED:', cartelLEDMensaje)
  
  const esCorrecto = cartelLEDMensaje === 'ALERTA: REDUCIR_VELOCIDAD EN ACCESO_CORRIENTES'
  console.log('¿Mensaje de cartel LED correcto?', esCorrecto ? 'SÍ (PASÓ)' : 'NO (FALLÓ)')

} catch (error) {
  console.error('¿Mensaje correcto? NO (FALLÓ: Error inesperado)', (error as Error).message)
}
console.log('----------------------------------------------------------------------\n')

// CP 12 (Inválido): Comportamiento del motor ante un AST vacío o null
console.log('[CP 12 - INVÁLIDO] Datos de entrada: AST es null')
try {
  ejecutarDespachoVial(null)
  console.log('Llamadas de emergencia activadas:', llamadasRealizadas)
  console.log('Mensaje en Cartel LED:', cartelLEDMensaje)
  
  const esCorrecto = llamadasRealizadas.length === 0 && cartelLEDMensaje === ''
  console.log('¿Se abortó el despacho de manera segura?', esCorrecto ? 'SÍ (PASÓ)' : 'NO (FALLÓ)')

} catch (error) {
  console.error('¿Abortado seguro? NO (FALLÓ: Lanzó error en lugar de abortar de forma segura)', (error as Error).message)
}
console.log('----------------------------------------------------------------------\n')
