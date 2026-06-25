import { lexer } from './lexer'
import { Parser } from './parser'

// =============================================================================
// 1. SIMULACIÓN DE DETECCIÓN DE IA (CÁMARAS DE MONITOREO)
// =============================================================================

interface DeteccionCamaraIA {
  idCamara: string
  ubicacion: string // Ej: 'puente_sur'
  eventoDetectado: string // Ej: 'accidente'
  confianza: number // Porcentaje de certeza del modelo de IA (0.0 a 1.0)
  fechaHora: string
}

// Datos de ejemplo que enviaría la cámara inteligente al detectar un problema
const eventoDeteccionIA: DeteccionCamaraIA = {
  idCamara: 'CAM_ZONE_B_04',
  ubicacion: 'puente_sur',
  eventoDetectado: 'accidente',
  confianza: 0.96, // 96% de confianza
  fechaHora: new Date().toISOString()
}

console.log('======================================================================')
console.log('   SIMULACIÓN: DETECCIÓN DE INCIDENTES MEDIANTE IA Y DSL (EXPOSICIÓN) ')
console.log('======================================================================')
console.log('\n[1] 📷 Cámara inteligente en vivo reporta una detección:')
console.log(JSON.stringify(eventoDeteccionIA, null, 2))

// =============================================================================
// 2. GENERADOR AUTOMÁTICO DE DSL (TRADUCCIÓN DE IA A NUESTRO LENGUAJE)
// =============================================================================

function generarCodigoDSL(deteccion: DeteccionCamaraIA): string {
  // Mapeo dinámico de prioridades según la confianza o el tipo de evento
  let prioridad = 'media'
  if (deteccion.eventoDetectado === 'accidente' && deteccion.confianza > 0.8) {
    prioridad = 'alta'
  } else if (deteccion.eventoDetectado === 'autolisis') {
    prioridad = 'critica'
  }

  // Mapeo automático de respuestas según el tipo de incidente detectado por la IA
  let respuestaDSL = ''
  if (deteccion.eventoDetectado === 'accidente') {
    respuestaDSL = `
    ACCION llamar_policia, llamar_ambulancia
    ALERTA: desviar EN ${deteccion.ubicacion}`
  } else if (deteccion.eventoDetectado === 'congestion') {
    respuestaDSL = `
    ALERTA: reducir_velocidad EN ${deteccion.ubicacion}`
  } else {
    respuestaDSL = `
    ACCION llamar_policia`
  }

  // Generamos el programa final en nuestro lenguaje de monitoreo
  return `REGISTRAR {
  // Generado automáticamente por IA (Cámara: ${deteccion.idCamara})
  INCIDENTE: ${deteccion.eventoDetectado} EN ${deteccion.ubicacion} PRIORIDAD ${prioridad} ${respuestaDSL};
}`
}

const codigoGenerado = generarCodigoDSL(eventoDeteccionIA)
console.log('\n[2] 📝 Código del lenguaje (DSL) generado automáticamente por el sistema:')
console.log('--------------------------------------------------')
console.log(codigoGenerado)
console.log('--------------------------------------------------')

// =============================================================================
// 3. PROCESAMIENTO MEDIANTE EL COMPILADOR (LEXER + PARSER -> AST)
// =============================================================================

console.log('\n[3] ⚙️ Procesando el código a través del compilador...')
let ast: any = null

try {
  const tokens = lexer(codigoGenerado)
  const parser = new Parser(tokens)
  ast = parser.analizar()
  console.log('    ✅ Sintaxis y semántica validadas. AST generado correctamente.')
} catch (error) {
  console.error('    ❌ Error al procesar el código generado:', (error as Error).message)
  process.exit(1)
}

// =============================================================================
// 4. MOTOR DE EJECUCIÓN (DESPACHO DE ACCIONES REALES BASADO EN EL AST)
// =============================================================================

console.log('\n[4] 🚀 Motor de despacho en acción (Procesando el AST para ejecutar alertas reales):')

function ejecutarAccionesYAlertas(nodoAST: any) {
  if (nodoAST.tipo !== 'Programa') return

  nodoAST.instrucciones.forEach((inst: any) => {
    if (inst.tipo === 'ReporteIncidente') {
      console.log(`\n    [Procesando Incidente] -> ${inst.tipoIncidente.toUpperCase()} detectado en ${inst.ubicacion.toUpperCase()} (Prioridad: ${inst.prioridad.toUpperCase()})`)
      
      const resp = inst.respuesta
      if (resp) {
        // Ejecutar llamadas físicas/despachos si existen acciones recomendadas en el AST
        if (resp.acciones) {
          console.log('    --------------------------------------------------------------')
          console.log('    📞 DESPACHO DE EMERGENCIAS ACTIVADO:')
          resp.acciones.forEach((accion: string) => {
            console.log(`      * [EJECUTANDO]: Realizando llamada de emergencia a -> ${accion.toUpperCase()}`)
          })
        }

        // Enviar notificaciones digitales si existen alertas en el AST
        if (resp.alertas) {
          console.log('    --------------------------------------------------------------')
          console.log('    🖥️ SEÑALIZACIÓN VIAL Y NOTIFICACIONES DIGITALES:')
          resp.alertas.forEach((alerta: any) => {
            console.log(`      * [ACTUALIZANDO CARTEL LED EN ${alerta.ubicacion.toUpperCase()}]: Mostrar mensaje -> "ALERTA: ${alerta.notificacion.toUpperCase()}"`)
          })
          console.log('    --------------------------------------------------------------')
        }
      }
    } else if (inst.tipo === 'ReporteAlerta') {
      console.log(`\n    [Procesando Alerta Autónoma] -> Mostrar "${inst.notificacion.toUpperCase()}" en ${inst.ubicacion.toUpperCase()}`)
    }
  })
}

ejecutarAccionesYAlertas(ast)
console.log('\n======================================================================')
console.log('   PROCESO TERMINADO CON ÉXITO: Flujo extremo a extremo completado    ')
console.log('======================================================================\n')
