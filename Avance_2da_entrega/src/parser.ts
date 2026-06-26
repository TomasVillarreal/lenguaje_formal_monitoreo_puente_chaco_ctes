import { Token, TokenType } from './lexer'

export class Parser {
  private tokens: Token[]
  private posicion = 0

  constructor(tokens: Token[]) {
    this.tokens = tokens
  }

  private actual(): Token {
    return this.tokens[this.posicion]
  }

  private avanzar(): void {
    if (this.posicion < this.tokens.length - 1) {
      this.posicion++
    }
  }

  private consumir(tipoEsperado: TokenType): Token {
    const token = this.actual()

    if (token.tipo === tipoEsperado) {
      this.avanzar()
      return token
    }

    throw new Error(
      `Error sintáctico en línea ${token.linea}, columna ${token.columna}. ` +
      `Se esperaba ${tipoEsperado}, pero se encontró ${token.tipo} (${token.valor})`
    )
  }

  public analizar(): void {
    this.programa()
  }

  private programa(): void {
    this.consumir('REGISTRAR')
    this.consumir('LLAVE_ABRE')
    this.listaInstrucciones()
    this.consumir('LLAVE_CIERRA')
    this.consumir('EOF')
  }

  private listaInstrucciones(): void {
    while (
      this.actual().tipo === 'INCIDENTE' ||
      this.actual().tipo === 'ALERTA'
    ) {
      this.instruccion()
    }
  }

  private instruccion(): void {
    if (this.actual().tipo === 'INCIDENTE') {
      this.reporteIncidente()
    } else if (this.actual().tipo === 'ALERTA') {
      this.reporteAlerta()
    } else {
      const token = this.actual()
      throw new Error(
        `Error sintáctico en línea ${token.linea}, columna ${token.columna}. ` +
        `Se esperaba INCIDENTE o ALERTA`
      )
    }
  }

  private reporteIncidente(): void {
    this.consumir('INCIDENTE')
    this.consumir('DOS_PUNTOS')
    this.consumir('TIPO_INCIDENTE')
    this.consumir('EN')
    this.consumir('UBICACION')
    this.consumir('PRIORIDAD')
    this.consumir('NIVEL_PRIORIDAD')
    this.respuesta()
    this.consumir('PUNTO_COMA')
  }

  private reporteAlerta(): void {
    this.alertaRespuesta()
    this.consumir('PUNTO_COMA')
  }

  private respuesta(): void {
    if (this.actual().tipo === 'ACCION') {
      this.accionRespuesta()

      if (this.actual().tipo === 'ALERTA') {
        this.listaAlertas()
      }

    } else if (this.actual().tipo === 'ALERTA') {
      this.listaAlertas()

      if (this.actual().tipo === 'ACCION') {
        this.accionRespuesta()
      }

    } else {
      const token = this.actual()
      throw new Error(
        `Error sintáctico en línea ${token.linea}, columna ${token.columna}. ` +
        `Se esperaba ACCION o ALERTA`
      )
    }
  }

  private accionRespuesta(): void {
    this.consumir('ACCION')
    this.listaAcciones()
  }

  private listaAcciones(): void {
    this.consumir('ACCION_RECOMENDADA')

    while (this.actual().tipo === 'COMA') {
      this.consumir('COMA')
      this.consumir('ACCION_RECOMENDADA')
    }
  }

  private listaAlertas(): void {
    this.alertaRespuesta()

    while (this.actual().tipo === 'COMA') {
      this.consumir('COMA')
      this.alertaRespuesta()
    }
  }

  private alertaRespuesta(): void {
    this.consumir('ALERTA')
    this.consumir('DOS_PUNTOS')
    this.consumir('NOTIFICACION')
    this.consumir('EN')
    this.consumir('UBICACION')
  }
}