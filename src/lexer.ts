import * as fs from 'fs'
import * as path from 'path'

export type TokenType =
  | 'REGISTRAR'
  | 'INCIDENTE'
  | 'ALERTA'
  | 'EN'
  | 'PRIORIDAD'
  | 'ACCION'
  | 'LLAVE_ABRE'
  | 'LLAVE_CIERRA'
  | 'DOS_PUNTOS'
  | 'PUNTO_COMA'
  | 'COMA'
  | 'IDENTIFICADOR'
  | 'EOF'
  | 'ERROR'

export interface Token {
  tipo: TokenType
  valor: string | null
  linea: number
  columna: number
}

const palabrasReservadas: Record<string, TokenType> = {
  REGISTRAR: 'REGISTRAR',
  INCIDENTE: 'INCIDENTE',
  ALERTA: 'ALERTA',
  EN: 'EN',
  PRIORIDAD: 'PRIORIDAD',
  ACCION: 'ACCION',
}

// Cargar la configuración dinámica desde el archivo JSON central (Desacoplamiento Absoluto)
const configPath = path.resolve(__dirname, '../configuracion.json')
let config: any = {}

try {
  const fileContent = fs.readFileSync(configPath, 'utf-8')
  config = JSON.parse(fileContent)
} catch (error) {
  console.error('Error al cargar configuracion.json desde el Lexer:', (error as Error).message)
}

export const tiposIncidente: string[] = config.tiposIncidente || []
export const ubicaciones: string[] = config.ubicaciones || []
export const prioridades: string[] = config.prioridades || []
export const notificaciones: string[] = config.notificaciones || []
export const acciones: string[] = config.acciones || []

/**
 * Función principal del analizador léxico.
 * Convierte una cadena de texto en un arreglo de Tokens para que el Parser los procese.
 */
export function lexer(input: string): Token[] {
  const tokens: Token[] = []

  let i = 0
  let linea = 1
  let columna = 1

  // Recorremos todo el texto de entrada carácter por carácter
  while (i < input.length) {
    const char = input[i]

    // Ignorar espacios en blanco, tabulaciones y retornos de carro
    if (char === ' ' || char === '\t' || char === '\r') {
      i++
      columna++
      continue
    }

    // Ignorar saltos de línea e incrementar el contador de líneas
    if (char === '\n') {
      i++
      linea++
      columna = 1
      continue
    }

    // Omitir comentarios de una sola línea (ej: // comentario)
    if (char === '/' && input[i + 1] === '/') {
      while (i < input.length && input[i] !== '\n') {
        i++
        columna++
      }
      continue
    }

    // Token para abrir llaves '{'
    if (char === '{') {
      tokens.push({ tipo: 'LLAVE_ABRE', valor: char, linea, columna })
      i++
      columna++
      continue
    }

    // Token para cerrar llaves '}'
    if (char === '}') {
      tokens.push({ tipo: 'LLAVE_CIERRA', valor: char, linea, columna })
      i++
      columna++
      continue
    }

    // Token para dos puntos ':'
    if (char === ':') {
      tokens.push({ tipo: 'DOS_PUNTOS', valor: char, linea, columna })
      i++
      columna++
      continue
    }

    // Token para punto y coma ';'
    if (char === ';') {
      tokens.push({ tipo: 'PUNTO_COMA', valor: char, linea, columna })
      i++
      columna++
      continue
    }

    // Token para coma ',' (usado ahora para separar listas)
    if (char === ',') {
      tokens.push({ tipo: 'COMA', valor: char, linea, columna })
      i++
      columna++
      continue
    }

    // Identificar palabras completas (letras de la A a la Z, dígitos y guion bajo)
    if (/[a-zA-Z_]/.test(char)) {
      const inicioColumna = columna
      let palabra = ''

      // Continuamos leyendo mientras sea un carácter válido para palabras
      while (i < input.length && /[a-zA-Z0-9_]/.test(input[i])) {
        palabra += input[i]
        i++
        columna++
      }

      // Clasificamos la palabra encontrada y la guardamos como token
      tokens.push({
        tipo: clasificarPalabra(palabra),
        valor: palabra,
        linea,
        columna: inicioColumna,
      })

      continue
    }

    // Si encontramos un carácter desconocido, generamos un token de ERROR
    tokens.push({
      tipo: 'ERROR',
      valor: char,
      linea,
      columna,
    })

    i++
    columna++
  }

  // Al finalizar la cadena, agregamos el token EOF (End of File)
  tokens.push({
    tipo: 'EOF',
    valor: null,
    linea,
    columna,
  })

  return tokens
}

/**
 * Función auxiliar para clasificar una palabra detectada en su tipo correspondiente.
 */
function clasificarPalabra(palabra: string): TokenType {
  // 1. Verificamos si es una palabra reservada principal (REGISTRAR, INCIDENTE, etc.)
  if (palabrasReservadas[palabra]) return palabrasReservadas[palabra]

  // 2. Si no es palabra reservada, ahora es un IDENTIFICADOR genérico
  return 'IDENTIFICADOR'
}