// =============================================================================
// COMPILADOR DE MONITOREO VIAL - MÓDULO DE ANALIZADOR LÉXICO Y SINTÁCTICO
// =============================================================================

// Cargar la configuración dinámica desde el objeto global configuracion.js (file://)
const config = window.configuracionVial || {};

const palabrasReservadas = {
  REGISTRAR: 'REGISTRAR',
  INCIDENTE: 'INCIDENTE',
  ALERTA: 'ALERTA',
  EN: 'EN',
  PRIORIDAD: 'PRIORIDAD',
  ACCION: 'ACCION',
};

const tiposIncidente = config.tiposIncidente || [];
const ubicaciones = config.ubicaciones || [];
const prioridades = config.prioridades || [];
const notificaciones = config.notificaciones || [];
const acciones = config.acciones || [];

/**
 * Analizador Léxico (Lexer)
 */
function runLexer(input) {
  const tokens = [];
  let i = 0;
  let linea = 1;
  let columna = 1;

  while (i < input.length) {
    const char = input[i];

    if (char === ' ' || char === '\t' || char === '\r') {
      i++;
      columna++;
      continue;
    }

    if (char === '\n') {
      i++;
      linea++;
      columna = 1;
      continue;
    }

    if (char === '/' && input[i + 1] === '/') {
      while (i < input.length && input[i] !== '\n') {
        i++;
        columna++;
      }
      continue;
    }

    if (char === '{') {
      tokens.push({ tipo: 'LLAVE_ABRE', valor: char, linea, columna });
      i++; columna++; continue;
    }
    if (char === '}') {
      tokens.push({ tipo: 'LLAVE_CIERRA', valor: char, linea, columna });
      i++; columna++; continue;
    }
    if (char === ':') {
      tokens.push({ tipo: 'DOS_PUNTOS', valor: char, linea, columna });
      i++; columna++; continue;
    }
    if (char === ';') {
      tokens.push({ tipo: 'PUNTO_COMA', valor: char, linea, columna });
      i++; columna++; continue;
    }
    if (char === ',') {
      tokens.push({ tipo: 'COMA', valor: char, linea, columna });
      i++; columna++; continue;
    }

    if (/[a-zA-Z_]/.test(char)) {
      const inicioColumna = columna;
      let palabra = '';
      while (i < input.length && /[a-zA-Z0-9_]/.test(input[i])) {
        palabra += input[i];
        i++;
        columna++;
      }

      let tipo = 'IDENTIFICADOR';
      if (palabrasReservadas[palabra]) {
        tipo = palabrasReservadas[palabra];
      }

      tokens.push({ tipo, valor: palabra, linea, columna: inicioColumna });
      continue;
    }

    tokens.push({ tipo: 'ERROR', valor: char, linea, columna });
    i++;
    columna++;
  }

  tokens.push({ tipo: 'EOF', valor: null, linea, columna });
  return tokens;
}

/**
 * Analizador Sintáctico y Semántico (Parser)
 */
class BrowserParser {
  constructor(tokens) {
    this.tokens = tokens;
    this.posicion = 0;
  }

  actual() {
    return this.tokens[this.posicion];
  }

  avanzar() {
    if (this.posicion < this.tokens.length - 1) {
      this.posicion++;
    }
  }

  consumir(tipoEsperado) {
    const token = this.actual();
    if (token.tipo === tipoEsperado) {
      this.avanzar();
      return token;
    }
    throw new Error(
      `Error sintáctico en línea ${token.linea}, columna ${token.columna}. ` +
      `Se esperaba ${tipoEsperado}, pero se encontró ${token.tipo} (${token.valor || 'fin de archivo'})`
    );
  }

  analizar() {
    return this.programa();
  }

  programa() {
    this.consumir('REGISTRAR');
    this.consumir('LLAVE_ABRE');
    const instrucciones = this.listaInstrucciones();
    this.consumir('LLAVE_CIERRA');
    this.consumir('EOF');
    return { tipo: 'Programa', instrucciones };
  }

  listaInstrucciones() {
    const instrucciones = [];
    while (this.actual().tipo === 'INCIDENTE' || this.actual().tipo === 'ALERTA') {
      instrucciones.push(this.instruccion());
    }
    return instrucciones;
  }

  instruccion() {
    if (this.actual().tipo === 'INCIDENTE') {
      return this.reporteIncidente();
    } else {
      return this.reporteAlerta();
    }
  }

  reporteIncidente() {
    const tokenIncidente = this.consumir('INCIDENTE');
    this.consumir('DOS_PUNTOS');
    
    const tokenTipo = this.consumir('IDENTIFICADOR');
    const valTipo = tokenTipo.valor || '';
    if (!tiposIncidente.includes(valTipo)) {
      throw new Error(`Error semántico en línea ${tokenTipo.linea}, columna ${tokenTipo.columna}. El tipo de incidente '${valTipo}' no es válido. Permitidos: ${tiposIncidente.join(', ')}`);
    }

    this.consumir('EN');
    
    const tokenUbi = this.consumir('IDENTIFICADOR');
    const valUbi = tokenUbi.valor || '';
    if (!ubicaciones.includes(valUbi)) {
      throw new Error(`Error semántico en línea ${tokenUbi.linea}, columna ${tokenUbi.columna}. La ubicación '${valUbi}' no es válida. Permitidas: ${ubicaciones.join(', ')}`);
    }

    this.consumir('PRIORIDAD');
    
    const tokenPrio = this.consumir('IDENTIFICADOR');
    const valPrio = tokenPrio.valor || '';
    if (!prioridades.includes(valPrio)) {
      throw new Error(`Error semántico en línea ${tokenPrio.linea}, columna ${tokenPrio.columna}. La prioridad '${valPrio}' no es válida. Permitidas: ${prioridades.join(', ')}`);
    }

    const resp = this.respuesta();
    this.consumir('PUNTO_COMA');

    return {
      tipo: 'ReporteIncidente',
      tipoIncidente: valTipo,
      ubicacion: valUbi,
      prioridad: valPrio,
      respuesta: resp,
      linea: tokenIncidente.linea
    };
  }

  reporteAlerta() {
    const alerta = this.alertaRespuesta();
    this.consumir('PUNTO_COMA');
    return alerta;
  }

  respuesta() {
    if (this.actual().tipo === 'ACCION') {
      const accs = this.accionRespuesta();
      let alts = null;
      let orden = 'solo_acciones';

      if (this.actual().tipo === 'ALERTA') {
        alts = this.listaAlertas();
        orden = 'acciones_alertas';
      }

      return { tipo: 'Respuesta', alertas: alts, acciones: accs, orden };
    } else if (this.actual().tipo === 'ALERTA') {
      const alts = this.listaAlertas();
      let accs = null;
      let orden = 'solo_alertas';

      if (this.actual().tipo === 'ACCION') {
        accs = this.accionRespuesta();
        orden = 'alertas_acciones';
      }

      return { tipo: 'Respuesta', alertas: alts, acciones: accs, orden };
    } else {
      const token = this.actual();
      throw new Error(`Error sintáctico en línea ${token.linea}, columna ${token.columna}. Se esperaba ACCION o ALERTA`);
    }
  }

  accionRespuesta() {
    this.consumir('ACCION');
    return this.listaAcciones();
  }

  listaAcciones() {
    const accs = [];
    const tokenAcc = this.consumir('IDENTIFICADOR');
    const valAcc = tokenAcc.valor || '';
    
    if (!acciones.includes(valAcc)) {
      throw new Error(`Error semántico en línea ${tokenAcc.linea}, columna ${tokenAcc.columna}. La acción '${valAcc}' no es válida. Permitidas: ${acciones.join(', ')}`);
    }
    accs.push(valAcc);

    while (this.actual().tipo === 'COMA') {
      this.consumir('COMA');
      const tokenSig = this.consumir('IDENTIFICADOR');
      const valSig = tokenSig.valor || '';
      if (!acciones.includes(valSig)) {
        throw new Error(`Error semántico en línea ${tokenSig.linea}, columna ${tokenSig.columna}. La acción '${valSig}' no es válida.`);
      }
      accs.push(valSig);
    }

    return accs;
  }

  listaAlertas() {
    const alts = [this.alertaRespuesta()];
    while (this.actual().tipo === 'COMA') {
      this.consumir('COMA');
      alts.push(this.alertaRespuesta());
    }
    return alts;
  }

  alertaRespuesta() {
    const tokenAlerta = this.consumir('ALERTA');
    this.consumir('DOS_PUNTOS');
    
    const tokenNotif = this.consumir('IDENTIFICADOR');
    const valNotif = tokenNotif.valor || '';
    if (!notificaciones.includes(valNotif)) {
      throw new Error(`Error semántico en línea ${tokenNotif.linea}, columna ${tokenNotif.columna}. La notificación '${valNotif}' no es válida. Permitidas: ${notificaciones.join(', ')}`);
    }

    this.consumir('EN');
    
    const tokenUbi = this.consumir('IDENTIFICADOR');
    const valUbi = tokenUbi.valor || '';
    if (!ubicaciones.includes(valUbi)) {
      throw new Error(`Error semántico en línea ${tokenUbi.linea}, columna ${tokenUbi.columna}. La ubicación '${valUbi}' no es válida.`);
    }

    return {
      tipo: 'ReporteAlerta',
      notificacion: valNotif,
      ubicacion: valUbi,
      linea: tokenAlerta.linea
    };
  }
}

// Exponer al ámbito global
window.runLexer = runLexer;
window.BrowserParser = BrowserParser;
