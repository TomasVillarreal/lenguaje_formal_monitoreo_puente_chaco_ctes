import { lexer } from './lexer'
import { Parser } from './parser'

const codigo = `
REGISTRAR {
  INCIDENTE: accidente EN puente_sur PRIORIDAD alta
  ACCION llamar_policia, llamar_ambulancia
  ALERTA: desviar EN puente_sur, ALERTA: evacuar EN acceso_corrientes;

  INCIDENTE: congestion EN acceso_corrientes PRIORIDAD media
  ALERTA: reducir_velocidad EN puente_norte
  ACCION llamar_gendarmeria;

  ALERTA: cerrar_acceso EN acceso_resistencia;
}
`

function printAST(node: any, indent = ''): void {
  if (!node) return
  
  if (node.tipo === 'Programa') {
    console.log(`${indent}📂 Programa`)
    node.instrucciones.forEach((inst: any) => printAST(inst, indent + '  '))
  } else if (node.tipo === 'ReporteIncidente') {
    console.log(`${indent}⚠️ ReporteIncidente (línea ${node.linea})`)
    console.log(`${indent}  ├── Tipo: ${node.tipoIncidente}`)
    console.log(`${indent}  ├── Ubicación: ${node.ubicacion}`)
    console.log(`${indent}  ├── Prioridad: ${node.prioridad}`)
    console.log(`${indent}  └── Respuesta:`)
    printAST(node.respuesta, indent + '      ')
  } else if (node.tipo === 'ReporteAlerta') {
    console.log(`${indent}📢 ReporteAlerta: [${node.notificacion}] en [${node.ubicacion}] (línea ${node.linea})`)
  } else if (node.tipo === 'Respuesta') {
    console.log(`${indent}⚙️ Respuesta (Orden: ${node.orden})`)
    if (node.acciones) {
      console.log(`${indent}  ├── Acciones a Tomar: [${node.acciones.join(', ')}]`)
    }
    if (node.alertas) {
      console.log(`${indent}  └── Alertas a Emitir:`)
      node.alertas.forEach((al: any) => printAST(al, indent + '      ├── '))
    }
  }
}

try {
  console.log('=== ANALIZANDO Y GENERANDO AST ===')
  const tokens = lexer(codigo)
  const parser = new Parser(tokens)
  const ast = parser.analizar()

  console.log('\n=== VISTA JERÁRQUICA DEL AST ===')
  printAST(ast)

  console.log('\n=== AST EN FORMATO JSON ===')
  console.log(JSON.stringify(ast, null, 2))

  console.log('\n¡Análisis sintáctico y semántico correctos!')
} catch (error) {
  console.error('\n❌ ERROR DETECTADO:')
  console.error((error as Error).message)
}

// --- CASO DE PRUEBA DE ERROR SEMÁNTICO (Extensiones no permitidas en validación semántica) ---
const codigoInvalidoSemantico = `
REGISTRAR {
  INCIDENTE: ovni EN puente_sur PRIORIDAD alta
  ACCION llamar_policia;
}
`

console.log('\n\n=== CASO DE PRUEBA: DETECCIÓN DE ERROR SEMÁNTICO ===')
try {
  const tokens = lexer(codigoInvalidoSemantico)
  const parser = new Parser(tokens)
  parser.analizar()
} catch (error) {
  console.log('Detectado correctamente el error semántico esperado:')
  console.error((error as Error).message)
}
