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

try {
  const tokens = lexer(codigo)

  const parser = new Parser(tokens)

  parser.analizar()

  console.log('Cadena válida: análisis sintáctico correcto.')
} catch (error) {
  console.error('Cadena inválida.')
  console.error((error as Error).message)
}
