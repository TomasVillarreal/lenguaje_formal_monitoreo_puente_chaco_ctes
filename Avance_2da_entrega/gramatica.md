# Gramática del Lenguaje de Monitoreo de Incidentes Viales (EBNF / LL(1))

Esta gramática ha sido adaptada para cumplir estrictamente con las condiciones de una gramática **LL(1)** (eliminando la recursión a la izquierda y aplicando factorización a la izquierda). Adicionalmente, se ha removido por completo el conector `"Y"`, utilizando únicamente comas (`","`) como separadores de listas.

## Gramática en Formato BNF Adaptada a LL(1)

```bnf
<Programa> ::= "REGISTRAR" "{" <ListaInstrucciones> "}"

<ListaInstrucciones> ::= <Instruccion> <ListaInstrucciones_Tail>
<ListaInstrucciones_Tail> ::= <Instruccion> <ListaInstrucciones_Tail>
                            | ε

<Instruccion> ::= <ReporteIncidente>
                | <ReporteAlerta_Instruccion>

<ReporteIncidente> ::= "INCIDENTE" ":" <TipoIncidente> "EN" <Ubicacion> "PRIORIDAD" <NivelPrioridad> <Respuesta> ";"

<ReporteAlerta_Instruccion> ::= <AlertaRespuesta> ";"

<AlertaRespuesta> ::= "ALERTA" ":" <Notificacion> "EN" <Ubicacion>

<Respuesta> ::= <AccionRespuesta> <Respuesta_Tail_Accion>
              | <ListaAlertas> <Respuesta_Tail_Alerta>

<Respuesta_Tail_Accion> ::= <ListaAlertas>
                          | ε

<Respuesta_Tail_Alerta> ::= <AccionRespuesta>
                          | ε

<AccionRespuesta> ::= "ACCION" <ListaAcciones>

<ListaAlertas> ::= <AlertaRespuesta> <ListaAlertas_Tail>
<ListaAlertas_Tail> ::= "," <AlertaRespuesta> <ListaAlertas_Tail>
                      | ε

<ListaAcciones> ::= <Accion_recomendada> <ListaAcciones_Tail>
<ListaAcciones_Tail> ::= "," <Accion_recomendada> <ListaAcciones_Tail>
                       | ε

<TipoIncidente> ::= "accidente"
                   | "vehiculo_detenido"
                   | "congestion"
                   | "vehiculo_averiado"
                   | "autolisis"
                   | "persona_riesgo"
                   | "operativo_policial"
                   | "manifestacion"
                   | "arreglos"
                   | "objeto_en_calzada"
                   | "clima_extremo"
                   | "emergencia_medica"

<Notificacion> ::= "desviar"
                 | "evacuar"
                 | "reducir_velocidad"
                 | "cerrar_acceso"
                 | "habilitar_desvio"

<Accion_recomendada> ::= "llamar_policia"
                       | "llamar_grua"
                       | "llamar_gendarmeria"
                       | "llamar_ambulancia"
                       | "llamar_angeles"
                       | "llamar_bomberos"

<Ubicacion> ::= "puente_sur"
              | "puente_norte"
              | "puente_zona_central"
              | "km3"
              | "km4"
              | "acceso_corrientes"
              | "acceso_resistencia"

<NivelPrioridad> ::= "baja"
                   | "media"
                   | "alta"
                   | "critica"
```

---

## Conjuntos de Símbolos

### Símbolos Terminales ($T$)
Los tokens devueltos por el analizador léxico:
- `REGISTRAR` (palabra reservada `"REGISTRAR"`)
- `LLAVE_ABRE` (carácter `"{"`)
- `LLAVE_CIERRA` (carácter `"}"`)
- `DOS_PUNTOS` (carácter `":"`)
- `PUNTO_COMA` (carácter `";"`)
- `COMA` (carácter `","`)
- `INCIDENTE` (palabra reservada `"INCIDENTE"`)
- `ALERTA` (palabra reservada `"ALERTA"`)
- `EN` (palabra reservada `"EN"`)
- `PRIORIDAD` (palabra reservada `"PRIORIDAD"`)
- `ACCION` (palabra reservada `"ACCION"`)
- `TIPO_INCIDENTE` (ej. `"accidente"`, `"congestion"`, etc.)
- `NOTIFICACION` (ej. `"desviar"`, `"evacuar"`, etc.)
- `ACCION_RECOMENDADA` (ej. `"llamar_policia"`, etc.)
- `UBICACION` (ej. `"puente_sur"`, etc.)
- `NIVEL_PRIORIDAD` (ej. `"baja"`, `"media"`, etc.)

---

## Conjuntos FIRST (Primero) y FOLLOW (Siguiente)

A continuación se detallan los conjuntos calculados matemáticamente para cada símbolo no terminal:

| No Terminal ($A$) | $FIRST(A)$ | $FOLLOW(A)$ |
| :--- | :--- | :--- |
| **`Programa`** | { `REGISTRAR` } | { `$` } |
| **`ListaInstrucciones`** | { `INCIDENTE`, `ALERTA` } | { `LLAVE_CIERRA` } |
| **`ListaInstrucciones_Tail`** | { `INCIDENTE`, `ALERTA`, `ε` } | { `LLAVE_CIERRA` } |
| **`Instruccion`** | { `INCIDENTE`, `ALERTA` } | { `INCIDENTE`, `ALERTA`, `LLAVE_CIERRA` } |
| **`ReporteIncidente`** | { `INCIDENTE` } | { `INCIDENTE`, `ALERTA`, `LLAVE_CIERRA` } |
| **`ReporteAlerta_Instruccion`**| { `ALERTA` } | { `INCIDENTE`, `ALERTA`, `LLAVE_CIERRA` } |
| **`AlertaRespuesta`** | { `ALERTA` } | { `PUNTO_COMA`, `ACCION`, `COMA` } |
| **`Respuesta`** | { `ACCION`, `ALERTA` } | { `PUNTO_COMA` } |
| **`Respuesta_Tail_Accion`** | { `ALERTA`, `ε` } | { `PUNTO_COMA` } |
| **`Respuesta_Tail_Alerta`** | { `ACCION`, `ε` } | { `PUNTO_COMA` } |
| **`AccionRespuesta`** | { `ACCION` } | { `ALERTA`, `PUNTO_COMA` } |
| **`ListaAlertas`** | { `ALERTA` } | { `ACCION`, `PUNTO_COMA` } |
| **`ListaAlertas_Tail`** | { `COMA`, `ε` } | { `ACCION`, `PUNTO_COMA` } |
| **`ListaAcciones`** | { `ACCION_RECOMENDADA` } | { `ALERTA`, `PUNTO_COMA` } |
| **`ListaAcciones_Tail`** | { `COMA`, `ε` } | { `ALERTA`, `PUNTO_COMA` } |
| **`TipoIncidente`** | { `TIPO_INCIDENTE` } | { `EN` } |
| **`Notificacion`** | { `NOTIFICACION` } | { `EN` } |
| **`Accion_recomendada`** | { `ACCION_RECOMENDADA` } | { `COMA`, `ALERTA`, `PUNTO_COMA` } |
| **`Ubicacion`** | { `UBICACION` } | { `PRIORIDAD`, `PUNTO_COMA`, `ACCION`, `COMA` } |
| **`NivelPrioridad`** | { `NIVEL_PRIORIDAD` } | { `ACCION`, `ALERTA` } |

---

## Verificación de las Condiciones LL(1) (No Ambigüedad)

Para que una gramática sea catalogada como **LL(1)** y sea analizable predictivamente sin ambigüedad mediante un parser de descenso recursivo con 1 token de preanálisis (lookahead), debe cumplir que para toda producción de la forma $A \to \alpha_1 \mid \alpha_2 \mid \dots \mid \alpha_k$:

1. **Intersección vacía de FIRST:** Los conjuntos $FIRST(\alpha_i)$ de todas las alternativas deben ser disjuntos dos a dos.
2. **Propiedad de nulabilidad (si $\alpha_i \Rightarrow^* \epsilon$):**
   - Si $\alpha_i$ puede derivar en la cadena vacía $\epsilon$, entonces $FIRST(A) \cap FOLLOW(A) = \emptyset$.
   - Adicionalmente, para cualquier otra alternativa $\alpha_j$, se debe cumplir que $FIRST(\alpha_j) \cap FOLLOW(A) = \emptyset$.

### Comprobación de Producciones con Alternativas (Decisiones)

* **`ListaInstrucciones_Tail`** $\to$ `Instruccion` `ListaInstrucciones_Tail` $\mid$ $\epsilon$
  - $FIRST(\text{Instruccion } \text{ListaInstrucciones\_Tail}) = \{ \text{INCIDENTE}, \text{ALERTA} \}$
  - $FIRST(\epsilon) = \{ \epsilon \}$
  - $FOLLOW(\text{ListaInstrucciones\_Tail}) = \{ \text{LLAVE\_CIERRA} \}$
  - Comprobación: $\{ \text{INCIDENTE}, \text{ALERTA} \} \cap \{ \text{LLAVE\_CIERRA} \} = \emptyset$. **Cumple.**

* **`Instruccion`** $\to$ `ReporteIncidente` $\mid$ `ReporteAlerta_Instruccion`
  - $FIRST(\text{ReporteIncidente}) = \{ \text{INCIDENTE} \}$
  - $FIRST(\text{ReporteAlerta\_Instruccion}) = \{ \text{ALERTA} \}$
  - Comprobación: $\{ \text{INCIDENTE} \} \cap \{ \text{ALERTA} \} = \emptyset$. **Cumple.**

* **`Respuesta`** $\to$ `AccionRespuesta` `Respuesta_Tail_Accion` $\mid$ `ListaAlertas` `Respuesta_Tail_Alerta`
  - $FIRST(\text{AccionRespuesta } \dots) = \{ \text{ACCION} \}$
  - $FIRST(\text{ListaAlertas } \dots) = \{ \text{ALERTA} \}$
  - Comprobación: $\{ \text{ACCION} \} \cap \{ \text{ALERTA} \} = \emptyset$. **Cumple.**

* **`Respuesta_Tail_Accion`** $\to$ `ListaAlertas` $\mid$ $\epsilon$
  - $FIRST(\text{ListaAlertas}) = \{ \text{ALERTA} \}$
  - $FIRST(\epsilon) = \{ \epsilon \}$
  - $FOLLOW(\text{Respuesta\_Tail\_Accion}) = \{ \text{PUNTO\_COMA} \}$
  - Comprobación: $\{ \text{ALERTA} \} \cap \{ \text{PUNTO\_COMA} \} = \emptyset$. **Cumple.**

* **`Respuesta_Tail_Alerta`** $\to$ `AccionRespuesta` $\mid$ $\epsilon$
  - $FIRST(\text{AccionRespuesta}) = \{ \text{ACCION} \}$
  - $FIRST(\epsilon) = \{ \epsilon \}$
  - $FOLLOW(\text{Respuesta\_Tail\_Alerta}) = \{ \text{PUNTO\_COMA} \}$
  - Comprobación: $\{ \text{ACCION} \} \cap \{ \text{PUNTO\_COMA} \} = \emptyset$. **Cumple.**

* **`ListaAlertas_Tail`** $\to$ `","` `AlertaRespuesta` `ListaAlertas_Tail` $\mid$ $\epsilon$
  - $FIRST(\text{"," } \dots) = \{ \text{COMA} \}$
  - $FIRST(\epsilon) = \{ \epsilon \}$
  - $FOLLOW(\text{ListaAlertas\_Tail}) = \{ \text{ACCION}, \text{PUNTO\_COMA} \}$
  - Comprobación: $\{ \text{COMA} \} \cap \{ \text{ACCION}, \text{PUNTO\_COMA} \} = \emptyset$. **Cumple.**

* **`ListaAcciones_Tail`** $\to$ `","` `Accion_recomendada` `ListaAcciones_Tail` $\mid$ $\epsilon$
  - $FIRST(\text{"," } \dots) = \{ \text{COMA} \}$
  - $FIRST(\epsilon) = \{ \epsilon \}$
  - $FOLLOW(\text{ListaAcciones\_Tail}) = \{ \text{ALERTA}, \text{PUNTO\_COMA} \}$
  - Comprobación: $\{ \text{COMA} \} \cap \{ \text{ALERTA}, \text{PUNTO\_COMA} \} = \emptyset$. **Cumple.**

La gramática es matemáticamente **LL(1)** y está totalmente libre de ambigüedad.
