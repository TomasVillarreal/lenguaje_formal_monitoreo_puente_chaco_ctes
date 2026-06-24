import { 
  Token, 
  TokenType,
  tiposIncidente,
  ubicaciones,
  prioridades,
  notificaciones,
  acciones 
} from './lexer'

// =============================================================================
// INTERFACES DEL ÁRBOL DE SINTAXIS ABSTRACTA (AST)
// =============================================================================

export interface ASTNode {
  tipo: string
}

export interface ProgramaNode extends ASTNode {
  tipo: 'Programa'
  instrucciones: InstruccionNode[]
}

export type InstruccionNode = ReporteIncidenteNode | ReporteAlertaNode

export interface ReporteIncidenteNode extends ASTNode {
  tipo: 'ReporteIncidente'
  tipoIncidente: string
  ubicacion: string
  prioridad: string
  respuesta: RespuestaNode
  linea: number
  columna: number
}

export interface ReporteAlertaNode extends ASTNode {
  tipo: 'ReporteAlerta'
  notificacion: string
  ubicacion: string
  linea: number
  columna: number
}

export interface RespuestaNode extends ASTNode {
  tipo: 'Respuesta'
  alertas: ReporteAlertaNode[] | null
  acciones: string[] | null
  orden: 'alertas_acciones' | 'acciones_alertas' | 'solo_alertas' | 'solo_acciones'
}

// =============================================================================
// ANALIZADOR SINTÁCTICO (PARSER)
// =============================================================================

/**
 * Clase Parser (Analizador Sintáctico).
 * Toma la lista de Tokens generada por el Lexer, verifica la sintaxis de acuerdo a las
 * reglas gramaticales y construye un AST, realizando también validaciones semánticas.
 */
export class Parser {
  private tokens: Token[]
  private posicion = 0

  constructor(tokens: Token[]) {
    this.tokens = tokens
  }

  /**
   * Retorna el token que se encuentra en la posición actual de lectura.
   */
  private actual(): Token {
    return this.tokens[this.posicion]
  }

  /**
   * Avanza a la siguiente posición en la lista de tokens.
   */
  private avanzar(): void {
    if (this.posicion < this.tokens.length - 1) {
      this.posicion++
    }
  }

  /**
   * Consume un token del tipo esperado.
   * Si el token actual coincide con `tipoEsperado`, avanza de posición.
   * De lo contrario, lanza un error sintáctico detallado.
   */
  private consumir(tipoEsperado: TokenType): Token {
    const token = this.actual()

    if (token.tipo === tipoEsperado) {
      this.avanzar()
      return token
    }

    throw new Error(
      `Error sintáctico en línea ${token.linea}, columna ${token.columna}. ` +
      `Se esperaba ${tipoEsperado}, pero se encontró ${token.tipo} (${token.valor || 'fin de archivo'})`
    )
  }

  /**
   * Método de entrada principal para iniciar el análisis sintáctico.
   * Retorna el AST raíz de tipo ProgramaNode.
   */
  public analizar(): ProgramaNode {
    return this.programa()
  }

  /**
   * Regla: <Programa> ::= "REGISTRAR" "{" <ListaInstrucciones> "}" EOF
   * Valida la estructura general del archivo que debe empezar con REGISTRAR { ... }
   */
  private programa(): ProgramaNode {
    this.consumir('REGISTRAR')
    this.consumir('LLAVE_ABRE')
    const instrucciones = this.listaInstrucciones()
    this.consumir('LLAVE_CIERRA')
    this.consumir('EOF')

    return {
      tipo: 'Programa',
      instrucciones,
    }
  }

  /**
   * Regla: <ListaInstrucciones> ::= <Instruccion> <ListaInstrucciones> | <Instruccion>
   * Procesa una o más instrucciones consecutivas (INCIDENTE o ALERTA).
   */
  private listaInstrucciones(): InstruccionNode[] {
    const instrucciones: InstruccionNode[] = []
    while (
      this.actual().tipo === 'INCIDENTE' ||
      this.actual().tipo === 'ALERTA'
    ) {
      instrucciones.push(this.instruccion())
    }
    return instrucciones
  }

  /**
   * Regla: <Instruccion> ::= <ReporteIncidente> | <ReporteAlerta>
   * Decide qué regla procesar según el tipo de token actual.
   */
  private instruccion(): InstruccionNode {
    if (this.actual().tipo === 'INCIDENTE') {
      return this.reporteIncidente()
    } else if (this.actual().tipo === 'ALERTA') {
      return this.reporteAlerta()
    } else {
      const token = this.actual()
      throw new Error(
        `Error sintáctico en línea ${token.linea}, columna ${token.columna}. ` +
        `Se esperaba INCIDENTE o ALERTA`
      )
    }
  }

  /**
   * Regla: <ReporteIncidente> ::= "INCIDENTE" ":" <TipoIncidente> "EN" <Ubicacion> "PRIORIDAD" <NivelPrioridad> <Respuesta> ";"
   * Procesa la declaración detallada de un incidente.
   */
  private reporteIncidente(): ReporteIncidenteNode {
    const tokenIncidente = this.consumir('INCIDENTE')
    this.consumir('DOS_PUNTOS')
    
    // Consumir IDENTIFICADOR en lugar de TIPO_INCIDENTE
    const tokenTipo = this.consumir('IDENTIFICADOR')
    const valTipo = tokenTipo.valor || ''
    // VALIDACIÓN SEMÁNTICA
    if (!tiposIncidente.includes(valTipo)) {
      throw new Error(
        `Error semántico en línea ${tokenTipo.linea}, columna ${tokenTipo.columna}. ` +
        `El tipo de incidente '${valTipo}' no es válido. Valores permitidos: ${tiposIncidente.join(', ')}`
      )
    }

    this.consumir('EN')
    
    // Consumir IDENTIFICADOR en lugar de UBICACION
    const tokenUbi = this.consumir('IDENTIFICADOR')
    const valUbi = tokenUbi.valor || ''
    // VALIDACIÓN SEMÁNTICA
    if (!ubicaciones.includes(valUbi)) {
      throw new Error(
        `Error semántico en línea ${tokenUbi.linea}, columna ${tokenUbi.columna}. ` +
        `La ubicación '${valUbi}' no es válida. Valores permitidos: ${ubicaciones.join(', ')}`
      )
    }

    this.consumir('PRIORIDAD')
    
    // Consumir IDENTIFICADOR en lugar de NIVEL_PRIORIDAD
    const tokenPrio = this.consumir('IDENTIFICADOR')
    const valPrio = tokenPrio.valor || ''
    // VALIDACIÓN SEMÁNTICA
    if (!prioridades.includes(valPrio)) {
      throw new Error(
        `Error semántico en línea ${tokenPrio.linea}, columna ${tokenPrio.columna}. ` +
        `El nivel de prioridad '${valPrio}' no es válido. Valores permitidos: ${prioridades.join(', ')}`
      )
    }

    const resp = this.respuesta()
    this.consumir('PUNTO_COMA')

    return {
      tipo: 'ReporteIncidente',
      tipoIncidente: valTipo,
      ubicacion: valUbi,
      prioridad: valPrio,
      respuesta: resp,
      linea: tokenIncidente.linea,
      columna: tokenIncidente.columna,
    }
  }

  /**
   * Regla: <ReporteAlerta> ::= "ALERTA" ":" <Notificacion> "EN" <Ubicacion>
   * Procesa una alerta individual que termina en punto y coma cuando actúa como instrucción independiente.
   */
  private reporteAlerta(): ReporteAlertaNode {
    const alerta = this.alertaRespuesta()
    this.consumir('PUNTO_COMA')
    return alerta
  }

  /**
   * Regla: <Respuesta> ::= <ListaAlertas> <OpcionalAccionRespuesta> | <AccionRespuesta> <OpcionalListaAlertas>
   * Analiza la respuesta o acciones a tomar frente a un incidente de manera LL(1) libre de conflictos.
   */
  private respuesta(): RespuestaNode {
    if (this.actual().tipo === 'ACCION') {
      const accs = this.accionRespuesta()
      let alts: ReporteAlertaNode[] | null = null
      let orden: 'solo_acciones' | 'acciones_alertas' = 'solo_acciones'

      // Si después de la acción viene una ALERTA, procesamos la lista de alertas (OpcionalListaAlertas)
      if (this.actual().tipo === 'ALERTA') {
        alts = this.listaAlertas()
        orden = 'acciones_alertas'
      }

      return {
        tipo: 'Respuesta',
        alertas: alts,
        acciones: accs,
        orden,
      }

    } else if (this.actual().tipo === 'ALERTA') {
      const alts = this.listaAlertas()
      let accs: string[] | null = null
      let orden: 'solo_alertas' | 'alertas_acciones' = 'solo_alertas'

      // Si después de las alertas viene una ACCION, la procesamos (OpcionalAccionRespuesta)
      if (this.actual().tipo === 'ACCION') {
        accs = this.accionRespuesta()
        orden = 'alertas_acciones'
      }

      return {
        tipo: 'Respuesta',
        alertas: alts,
        acciones: accs,
        orden,
      }

    } else {
      const token = this.actual()
      throw new Error(
        `Error sintáctico en línea ${token.linea}, columna ${token.columna}. ` +
        `Se esperaba ACCION o ALERTA`
      )
    }
  }

  /**
   * Regla: <AccionRespuesta> ::= "ACCION" <ListaAcciones>
   */
  private accionRespuesta(): string[] {
    this.consumir('ACCION')
    return this.listaAcciones()
  }

  /**
   * Regla: <ListaAcciones> ::= <Accion_recomendada> | <Accion_recomendada> "," <ListaAcciones>
   */
  private listaAcciones(): string[] {
    const accs: string[] = []
    
    // Consumir IDENTIFICADOR en lugar de ACCION_RECOMENDADA
    const tokenAcc = this.consumir('IDENTIFICADOR')
    const valAcc = tokenAcc.valor || ''
    // VALIDACIÓN SEMÁNTICA
    if (!acciones.includes(valAcc)) {
      throw new Error(
        `Error semántico en línea ${tokenAcc.linea}, columna ${tokenAcc.columna}. ` +
        `La acción recomendada '${valAcc}' no es válida. Valores permitidos: ${acciones.join(', ')}`
      )
    }
    accs.push(valAcc)

    // Mientras el siguiente token sea una coma (COMA), seguimos consumiendo más acciones
    while (this.actual().tipo === 'COMA') {
      this.consumir('COMA')
      
      const tokenAccSig = this.consumir('IDENTIFICADOR')
      const valAccSig = tokenAccSig.valor || ''
      // VALIDACIÓN SEMÁNTICA
      if (!acciones.includes(valAccSig)) {
        throw new Error(
          `Error semántico en línea ${tokenAccSig.linea}, columna ${tokenAccSig.columna}. ` +
          `La acción recomendada '${valAccSig}' no es válida. Valores permitidos: ${acciones.join(', ')}`
        )
      }
      accs.push(valAccSig)
    }

    return accs
  }

  /**
   * Regla: <ListaAlertas> ::= <ReporteAlerta> | <ReporteAlerta> <ListaAlertas>
   */
  private listaAlertas(): ReporteAlertaNode[] {
    const alts: ReporteAlertaNode[] = []
    alts.push(this.alertaRespuesta())

    // Mientras el siguiente token sea una coma (COMA), seguimos consumiendo más alertas
    while (this.actual().tipo === 'COMA') {
      this.consumir('COMA')
      alts.push(this.alertaRespuesta())
    }

    return alts
  }

  /**
   * Regla auxiliar para leer la estructura de una alerta dentro de otras reglas (sin consumir ';').
   * Estructura: "ALERTA" ":" <Notificacion> "EN" <Ubicacion>
   */
  private alertaRespuesta(): ReporteAlertaNode {
    const tokenAlerta = this.consumir('ALERTA')
    this.consumir('DOS_PUNTOS')
    
    // Consumir IDENTIFICADOR en lugar de NOTIFICACION
    const tokenNotif = this.consumir('IDENTIFICADOR')
    const valNotif = tokenNotif.valor || ''
    // VALIDACIÓN SEMÁNTICA
    if (!notificaciones.includes(valNotif)) {
      throw new Error(
        `Error semántico en línea ${tokenNotif.linea}, columna ${tokenNotif.columna}. ` +
        `La notificación '${valNotif}' no es válida. Valores permitidos: ${notificaciones.join(', ')}`
      )
    }

    this.consumir('EN')
    
    // Consumir IDENTIFICADOR en lugar de UBICACION
    const tokenUbi = this.consumir('IDENTIFICADOR')
    const valUbi = tokenUbi.valor || ''
    // VALIDACIÓN SEMÁNTICA
    if (!ubicaciones.includes(valUbi)) {
      throw new Error(
        `Error semántico en línea ${tokenUbi.linea}, columna ${tokenUbi.columna}. ` +
        `La ubicación '${valUbi}' no es válida. Valores permitidos: ${ubicaciones.join(', ')}`
      )
    }

    return {
      tipo: 'ReporteAlerta',
      notificacion: valNotif,
      ubicacion: valUbi,
      linea: tokenAlerta.linea,
      columna: tokenAlerta.columna,
    }
  }
}