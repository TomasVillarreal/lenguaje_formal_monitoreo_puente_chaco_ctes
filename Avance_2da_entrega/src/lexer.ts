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
  | 'TIPO_INCIDENTE'
  | 'UBICACION'
  | 'NIVEL_PRIORIDAD'
  | 'NOTIFICACION'
  | 'ACCION_RECOMENDADA'
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

const tiposIncidente = [
  'accidente',
  'vehiculo_detenido',
  'congestion',
  'vehiculo_averiado',
  'autolisis',
  'persona_riesgo',
  'operativo_policial',
  'manifestacion',
  'arreglos',
  'objeto_en_calzada',
  'clima_extremo',
  'emergencia_medica',
]

const ubicaciones = [
  'puente_sur',
  'puente_norte',
  'puente_zona_central',
  'km3',
  'km4',
  'acceso_corrientes',
  'acceso_resistencia',
]

const prioridades = ['baja', 'media', 'alta', 'critica']

const notificaciones = [
  'desviar',
  'evacuar',
  'reducir_velocidad',
  'cerrar_acceso',
  'habilitar_desvio',
]

const acciones = [
  'llamar_policia',
  'llamar_grua',
  'llamar_gendarmeria',
  'llamar_ambulancia',
  'llamar_angeles',
  'llamar_bomberos',
]

export function lexer(input: string): Token[] {
  const tokens: Token[] = []

  let i = 0
  let linea = 1
  let columna = 1

  while (i < input.length) {
    const char = input[i]

    if (char === ' ' || char === '\t' || char === '\r') {
      i++
      columna++
      continue
    }

    if (char === '\n') {
      i++
      linea++
      columna = 1
      continue
    }

    if (char === '/' && input[i + 1] === '/') {
      while (i < input.length && input[i] !== '\n') {
        i++
        columna++
      }
      continue
    }

    if (char === '{') {
      tokens.push({ tipo: 'LLAVE_ABRE', valor: char, linea, columna })
      i++
      columna++
      continue
    }

    if (char === '}') {
      tokens.push({ tipo: 'LLAVE_CIERRA', valor: char, linea, columna })
      i++
      columna++
      continue
    }

    if (char === ':') {
      tokens.push({ tipo: 'DOS_PUNTOS', valor: char, linea, columna })
      i++
      columna++
      continue
    }

    if (char === ';') {
      tokens.push({ tipo: 'PUNTO_COMA', valor: char, linea, columna })
      i++
      columna++
      continue
    }

    if (char === ',') {
      tokens.push({ tipo: 'COMA', valor: char, linea, columna })
      i++
      columna++
      continue
    }

    if (/[a-zA-Z_]/.test(char)) {
      const inicioColumna = columna
      let palabra = ''

      while (i < input.length && /[a-zA-Z0-9_]/.test(input[i])) {
        palabra += input[i]
        i++
        columna++
      }

      tokens.push({
        tipo: clasificarPalabra(palabra),
        valor: palabra,
        linea,
        columna: inicioColumna,
      })

      continue
    }

    tokens.push({
      tipo: 'ERROR',
      valor: char,
      linea,
      columna,
    })

    i++
    columna++
  }

  tokens.push({
    tipo: 'EOF',
    valor: null,
    linea,
    columna,
  })

  return tokens
}

function clasificarPalabra(palabra: string): TokenType {
  if (palabrasReservadas[palabra]) return palabrasReservadas[palabra]
  if (tiposIncidente.includes(palabra)) return 'TIPO_INCIDENTE'
  if (ubicaciones.includes(palabra)) return 'UBICACION'
  if (prioridades.includes(palabra)) return 'NIVEL_PRIORIDAD'
  if (notificaciones.includes(palabra)) return 'NOTIFICACION'
  if (acciones.includes(palabra)) return 'ACCION_RECOMENDADA'

  return 'ERROR'
}