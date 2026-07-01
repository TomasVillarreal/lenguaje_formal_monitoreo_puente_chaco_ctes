// =============================================================================
// CONFIGURACIÓN DE DATOS DE SIMULACIÓN (CÁMARAS Y CÓDIGO)
// =============================================================================

const codigosCamaras = {
  1: `REGISTRAR {
  // Reporte automático generado por telemetría de IA - Zona Puente Sur
  INCIDENTE: accidente EN puente_sur PRIORIDAD alta
    ACCION llamar_policia, llamar_ambulancia
    ALERTA: desviar EN puente_sur, ALERTA: evacuar EN acceso_corrientes;
}`,
  2: `REGISTRAR {
  // Reporte automático generado por telemetría de IA - Acceso Corrientes
  INCIDENTE: congestion EN acceso_corrientes PRIORIDAD media
    ALERTA: reducir_velocidad EN puente_norte
    ACCION llamar_gendarmeria;
}`,
  3: `REGISTRAR {
  // Tránsito óptimo detectado en Puente Norte. Sistema operando sin novedades.
  ALERTA: habilitar_desvio EN puente_norte;
}`
};

const datosIA = {
  1: {
    label: "CAM_PUENTE_SUR_01",
    src: "assets/puente_sur_accidente.png",
    box: { top: "18%", left: "25%", width: "40%", height: "45%", label: "ACCIDENTE DETECTADO (CONF: 0.96)", type: "accident" },
    logs: [
      "SYSTEM: Iniciando análisis de flujo CCTV...",
      "TELEMETRÍA: Cargando pesos ResNet-50 v2 (CPU/GPU)...",
      "ANÁLISIS: Anomalía detectada en carril izquierdo.",
      "DETECCIÓN: Colisión lateral entre dos vehículos comerciales.",
      "MÉTRICA: Bounding box establecido. Coeficiente de confianza: 0.963.",
      "DSL: Traduciendo anomalía visual a especificación formal v1.0...",
      "SISTEMA: Estructura DSL enviada al analizador sintáctico."
    ]
  },
  2: {
    label: "CAM_ACCESO_CORRIENTES_02",
    src: "assets/acceso_corrientes_congestion.png",
    box: { top: "25%", left: "15%", width: "65%", height: "50%", label: "CONGESTION VIAL (CONF: 0.91)", type: "congestion" },
    logs: [
      "SYSTEM: Iniciando análisis de flujo CCTV...",
      "TELEMETRÍA: Velocidad promedio vehicular estimada en 8.4 km/h.",
      "ANÁLISIS: Densidad vehicular por encima de rango operacional.",
      "DETECCIÓN: Congestión de tránsito severa.",
      "MÉTRICA: Bounding box establecido. Coeficiente de confianza: 0.912.",
      "DSL: Traduciendo congestión vial a especificación formal v1.0...",
      "SISTEMA: Estructura DSL enviada al analizador sintáctico."
    ]
  },
  3: {
    label: "CAM_PUENTE_NORTE_03",
    src: "assets/puente_norte_normal.png",
    box: null,
    logs: [
      "SYSTEM: Iniciando análisis de flujo CCTV...",
      "TELEMETRÍA: Velocidad promedio vehicular estimada en 76.2 km/h.",
      "ANÁLISIS: Flujo óptimo en ambos carriles.",
      "DETECCIÓN: No se detectan anomalías ni riesgos operacionales.",
      "DSL: Generando reporte estándar de mantenimiento operacional...",
      "SISTEMA: Estructura DSL enviada al analizador sintáctico."
    ]
  }
};

let camaraActiva = 1;
let logTimeout = null;

// =============================================================================
// ORQUESTACIÓN DE LA INTERFAZ DE USUARIO
// =============================================================================

function seleccionarCamara(id) {
  if (logTimeout) {
    clearTimeout(logTimeout);
  }

  camaraActiva = id;
  
  const botones = document.querySelectorAll('.cam-btn');
  botones.forEach((btn, idx) => {
    if (idx === id - 1) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  const scanline = document.getElementById('scanline');
  const box = document.getElementById('aiBoundingBox');
  const img = document.getElementById('cctvImage');
  const label = document.getElementById('cctvLabel');
  
  scanline.style.display = 'block';
  box.style.display = 'none';
  img.style.filter = 'brightness(0.4) blur(1px)';
  
  const camInfo = datosIA[id];
  label.innerText = camInfo.label;
  img.src = camInfo.src;

  const logsContainer = document.getElementById('aiLogs');
  logsContainer.innerHTML = '';
  
  let logIndex = 0;
  function printNextLog() {
    if (logIndex < camInfo.logs.length) {
      const p = document.createElement('div');
      p.className = 'log-line';
      
      const text = camInfo.logs[logIndex];
      const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
      
      if (text.includes('DETECCIÓN') || text.includes('Anomalía')) {
        p.classList.add('danger');
      } else if (text.includes('OK') || text.includes('Flujo óptimo') || text.includes('SISTEMA')) {
        p.classList.add('success');
      } else if (text.includes('DSL')) {
        p.classList.add('system');
      }
      
      p.innerText = `[${timestamp}] ${text}`;
      logsContainer.appendChild(p);
      logsContainer.scrollTop = logsContainer.scrollHeight;
      logIndex++;
      logTimeout = setTimeout(printNextLog, 150);
    } else {
      scanline.style.display = 'none';
      img.style.filter = 'none';
      
      if (camInfo.box) {
        box.style.top = camInfo.box.top;
        box.style.left = camInfo.box.left;
        box.style.width = camInfo.box.width;
        box.style.height = camInfo.box.height;
        box.style.display = 'block';
        
        const boxLabel = document.getElementById('aiBoxLabel');
        boxLabel.innerText = camInfo.box.label;
        
        if (camInfo.box.type === 'congestion') {
          box.className = 'bounding-box congestion';
        } else {
          box.className = 'bounding-box';
        }
      }

      document.getElementById('dslEditor').value = codigosCamaras[id];
      compilarCodigo();
    }
  }
  
  printNextLog();
}

function restablecerCodigo() {
  document.getElementById('dslEditor').value = codigosCamaras[camaraActiva];
  compilarCodigo();
}

// =============================================================================
// COMPILADOR (PROCESAMIENTO Y EJECUCIÓN)
// =============================================================================

function compilarCodigo() {
  const codigo = document.getElementById('dslEditor').value;
  const output = document.getElementById('compilerOutput');
  const astViewer = document.getElementById('astViewer');

  document.getElementById('sirenPolicia').classList.remove('active');
  document.getElementById('sirenAmbulancia').classList.remove('active');
  document.getElementById('sirenBomberos').classList.remove('active');
  
  const led = document.getElementById('ledDisplay');
  led.innerText = 'SISTEMA OPERATIVO - SIN ALERTAS';
  led.className = 'led-text empty';

  try {
    const tokens = window.runLexer(codigo);

    const erroresLexicos = tokens.filter(t => t.tipo === 'ERROR');

    if (erroresLexicos.length > 0) {
        let mensaje = "Errores léxicos:\n";

        erroresLexicos.forEach(e => {
            mensaje +=
                `Línea ${e.linea}, columna ${e.columna}: ` +
                `carácter '${e.valor}' no válido.\n`;
        });

        throw new Error(mensaje);
    }

    const parser = new window.BrowserParser(tokens);
    const ast = parser.analizar();

    output.className = 'compiler-output success';
    output.innerText = 'ESTADO: Compilación exitosa. Sintaxis y semántica correctas. AST generado.';

    renderAST(ast, astViewer);
    ejecutarActuadores(ast);

  } catch (error) {
    output.className = 'compiler-output error';
    output.innerText = `ERROR: ${error.message}`;
    astViewer.innerHTML = '<div style="color: #ff453a; padding: 15px; font-family: monospace;">Fallo en la generación del árbol. Verifique el log de errores sintácticos/semánticos.</div>';
  }
}

// =============================================================================
// DIBUJADO DE AST EN PANTALLA
// =============================================================================

function renderAST(node, container) {
  container.innerHTML = '';
  
  function buildHTML(currNode, parentEl) {
    if (!currNode) return;

    const nodeEl = document.createElement('div');
    nodeEl.className = 'ast-node';

    const headerEl = document.createElement('div');
    headerEl.className = 'ast-node-header';
    headerEl.innerText = currNode.tipo || 'Nodo';
    
    headerEl.addEventListener('click', (e) => {
      e.stopPropagation();
      nodeEl.classList.toggle('collapsed');
    });

    nodeEl.appendChild(headerEl);

    const bodyEl = document.createElement('div');
    bodyEl.className = 'ast-node-body';

    for (let key in currNode) {
      if (key === 'tipo' || key === 'linea') continue;

      const propEl = document.createElement('div');
      propEl.style.marginLeft = '15px';
      propEl.style.marginTop = '4px';

      const keySpan = document.createElement('span');
      keySpan.className = 'ast-key';
      keySpan.innerText = `${key}: `;
      propEl.appendChild(keySpan);

      const val = currNode[key];

      if (val === null) {
        const valSpan = document.createElement('span');
        valSpan.className = 'ast-val-bool';
        valSpan.innerText = 'null';
        propEl.appendChild(valSpan);
      } else if (typeof val === 'string') {
        const valSpan = document.createElement('span');
        valSpan.className = 'ast-val-str';
        valSpan.innerText = `"${val}"`;
        propEl.appendChild(valSpan);
      } else if (typeof val === 'number') {
        const valSpan = document.createElement('span');
        valSpan.className = 'ast-val-num';
        valSpan.innerText = val;
        propEl.appendChild(valSpan);
      } else if (Array.isArray(val)) {
        const arrSpan = document.createElement('span');
        arrSpan.className = 'ast-key';
        arrSpan.innerText = `[Array(${val.length})]`;
        propEl.appendChild(arrSpan);

        const arrContainer = document.createElement('div');
        val.forEach(item => {
          if (typeof item === 'object') {
            buildHTML(item, arrContainer);
          } else {
            const itemEl = document.createElement('div');
            itemEl.style.marginLeft = '15px';
            itemEl.className = 'ast-val-str';
            itemEl.innerText = `"${item}"`;
            arrContainer.appendChild(itemEl);
          }
        });
        propEl.appendChild(arrContainer);
      } else if (typeof val === 'object') {
        buildHTML(val, propEl);
      }

      bodyEl.appendChild(propEl);
    }

    nodeEl.appendChild(bodyEl);
    parentEl.appendChild(nodeEl);
  }

  buildHTML(node, container);
}

// =============================================================================
// CONTROL DE DISPOSITIVOS FÍSICOS (ACTUADORES)
// =============================================================================

function ejecutarActuadores(ast) {
  if (ast.tipo !== 'Programa') return;

  let alertaTexto = '';
  let ubicacionAlerta = '';

  ast.instrucciones.forEach(inst => {
    if (inst.tipo === 'ReporteIncidente') {
      const resp = inst.respuesta;
      if (resp) {
        if (resp.acciones) {
          resp.acciones.forEach(accion => {
            if (accion === 'llamar_policia' || accion === 'llamar_gendarmeria') {
              document.getElementById('sirenPolicia').classList.add('active');
            }
            if (accion === 'llamar_ambulancia') {
              document.getElementById('sirenAmbulancia').classList.add('active');
            }
            if (accion === 'llamar_bomberos' || accion === 'llamar_angeles') {
              document.getElementById('sirenBomberos').classList.add('active');
            }
          });
        }

        if (resp.alertas && resp.alertas.length > 0) {
          alertaTexto = resp.alertas[0].notificacion;
          ubicacionAlerta = resp.alertas[0].ubicacion;
        }
      }
    } else if (inst.tipo === 'ReporteAlerta') {
      alertaTexto = inst.notificacion;
      ubicacionAlerta = inst.ubicacion;
    }
  });

  const led = document.getElementById('ledDisplay');
  if (alertaTexto && ubicacionAlerta) {
    const formattedAlerta = alertaTexto.toUpperCase().replace(/_/g, ' ');
    const formattedUbicacion = ubicacionAlerta.toUpperCase().replace(/_/g, ' ');
    led.innerHTML = `ALERTA: ${formattedAlerta}<br><span style="font-size: 0.95rem; color: #ffaa00; font-weight: 500;">DESVÍOS EN ${formattedUbicacion}</span>`;
    led.className = 'led-text';
  }
}

// Asignar funciones globales para los onclick de los botones HTML
window.seleccionarCamara = seleccionarCamara;
window.restablecerCodigo = restablecerCodigo;
window.compilarCodigo = compilarCodigo;

// Cargar estado inicial al arrancar
window.addEventListener('DOMContentLoaded', () => {
  seleccionarCamara(1);
});
