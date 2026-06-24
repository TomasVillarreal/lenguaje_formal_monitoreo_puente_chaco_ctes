# Gramática del Lenguaje de Monitoreo de Incidentes Viales (BNF)

```bnf
<Programa> ::= "REGISTRAR" "{" <ListaInstrucciones> "}"

<ListaInstrucciones> ::= <Instruccion> <ListaInstrucciones>
                       | <Instruccion>

<Instruccion> ::= <ReporteIncidente>
                | <ReporteAlerta>

<ReporteIncidente> ::= "INCIDENTE" ":" IDENTIFICADOR
                       "EN" IDENTIFICADOR
                       "PRIORIDAD" IDENTIFICADOR
                       <Respuesta> ";"

<Respuesta> ::= <ListaAlertas> <OpcionalAccionRespuesta>
              | <AccionRespuesta> <OpcionalListaAlertas>

<OpcionalAccionRespuesta> ::= <AccionRespuesta>
                            | λ

<OpcionalListaAlertas> ::= <ListaAlertas>
                         | λ

<AccionRespuesta> ::= "ACCION" <ListaAcciones>

<ListaAlertas> ::= <ReporteAlerta>
                 | <ReporteAlerta> "," <ListaAlertas>

<ListaAcciones> ::= IDENTIFICADOR
                  | IDENTIFICADOR "," <ListaAcciones>

<ReporteAlerta> ::= "ALERTA" ":" IDENTIFICADOR "EN" IDENTIFICADOR
```

*Nota: Los terminales de valores específicos como tipo de incidente, ubicación, nivel de prioridad, notificación y acción recomendada se han unificado sintácticamente en la categoría genérica `IDENTIFICADOR`. Esto resuelve el problema de las listas cerradas hardcodeadas en la sintaxis, permitiendo la extensibilidad del lenguaje. La validación de que un `IDENTIFICADOR` pertenezca a los valores permitidos se realiza en la etapa de **Análisis Semántico**.*

---

## Verificación y Propiedad LL(1) de la Producción `<Respuesta>`

En la versión anterior de la gramática, la producción `<Respuesta>` se definía como:
```bnf
<Respuesta> ::= <ReporteAlerta>
              | <AccionRespuesta>
              | <ListaAlertas> <AccionRespuesta>
              | <AccionRespuesta> <ListaAlertas>
```
Esta estructura violaba la propiedad LL(1) debido a que múltiples alternativas compartían el mismo conjunto `FIRST`:
*   `FIRST(<ReporteAlerta>) = { ALERTA }`
*   `FIRST(<AccionRespuesta>) = { ACCION }`
*   `FIRST(<ListaAlertas> <AccionRespuesta>) = FIRST(<ListaAlertas>) = { ALERTA }`
*   `FIRST(<AccionRespuesta> <ListaAlertas>) = FIRST(<AccionRespuesta>) = { ACCION }`

Bajo un lookahead de 1, si el parser veía `ALERTA`, no podía decidir de forma determinista entre derivar por la alternativa 1 o la 3. Del mismo modo, si veía `ACCION`, no podía decidir entre la 2 o la 4. Esto generaba conflictos First/First.

### Gramática Factorizada (Solución)

Para resolver los conflictos, se factorizaron las reglas por la izquierda, introduciendo reglas opcionales con derivaciones vacías ($\lambda$):
1.  `<Respuesta> ::= <ListaAlertas> <OpcionalAccionRespuesta> | <AccionRespuesta> <OpcionalListaAlertas>`
2.  `<OpcionalAccionRespuesta> ::= <AccionRespuesta> | λ`
3.  `<OpcionalListaAlertas> ::= <ListaAlertas> | λ`

### Análisis Formal de Conflictos LL(1)

#### 1. Conjuntos FIRST y FOLLOW
*   `FIRST(<ListaAlertas>) = { ALERTA }`
*   `FIRST(<AccionRespuesta>) = { ACCION }`
*   `FOLLOW(<Respuesta>) = { PUNTO_COMA }`
*   `FOLLOW(<OpcionalAccionRespuesta>) = FOLLOW(<Respuesta>) = { PUNTO_COMA }`
*   `FOLLOW(<OpcionalListaAlertas>) = FOLLOW(<Respuesta>) = { PUNTO_COMA }`

#### 2. Verificación de la Regla `<Respuesta>`
La producción `<Respuesta>` tiene 2 alternativas:
*   **Alt 1**: `<ListaAlertas> <OpcionalAccionRespuesta>`
    *   `FIRST(Alt 1) = FIRST(<ListaAlertas>) = { ALERTA }`
*   **Alt 2**: `<AccionRespuesta> <OpcionalListaAlertas>`
    *   `FIRST(Alt 2) = FIRST(<AccionRespuesta>) = { ACCION }`

$$\text{Intersección: } FIRST(\text{Alt 1}) \cap FIRST(\text{Alt 2}) = \{ \text{ALERTA} \} \cap \{ \text{ACCION} \} = \emptyset$$

No hay conflicto First/First. La decisión es 100% determinista.

#### 3. Verificación de la Regla `<OpcionalAccionRespuesta>`
La producción tiene 2 alternativas (una de ellas es $\lambda$):
*   **Alt 1**: `<AccionRespuesta>` $\rightarrow FIRST = \{ \text{ACCION} \}$
*   **Alt 2**: $\lambda$ $\rightarrow FIRST = \{ \lambda \}$

Para gramáticas con transiciones $\lambda$, debemos verificar que el conjunto `FIRST` de la alternativa no vacía no colisione con el conjunto `FOLLOW` de la producción principal:

$$\text{Intersección: } FIRST(<AccionRespuesta>) \cap FOLLOW(<OpcionalAccionRespuesta>) = \{ \text{ACCION} \} \cap \{ \text{PUNTO\COMA} \} = \emptyset$$

No hay conflicto First/Follow.

#### 4. Verificación de la Regla `<OpcionalListaAlertas>`
De igual manera:
*   **Alt 1**: `<ListaAlertas>` $\rightarrow FIRST = \{ \text{ALERTA} \}$
*   **Alt 2**: $\lambda$ $\rightarrow FIRST = \{ \lambda \}$

$$\text{Intersección: } FIRST(<ListaAlertas>) \cap FOLLOW(<OpcionalListaAlertas>) = \{ \text{ALERTA} \} \cap \{ \text{PUNTO\COMA} \} = \emptyset$$

No hay conflicto First/Follow.

**Conclusión:** La gramática factorizada es **estrictamente LL(1)**.

---

## Tabla Formal de Casos de Prueba

| ID | Código de Entrada | Tipo de Prueba | Resultado Esperado | Resultado Obtenido |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | `REGISTRAR { INCIDENTE: accidente EN puente_sur PRIORIDAD alta ACCION llamar_policia; }` | Sintáctica / AST | Válido. Genera AST de tipo `ReporteIncidente` con orden `solo_acciones`. | **Pasa**. AST generado y visualizado correctamente. |
| **TC-02** | `REGISTRAR { INCIDENTE: accidente EN puente_sur PRIORIDAD alta ALERTA: desviar EN puente_sur; }` | Sintáctica / AST | Válido. Genera AST de tipo `ReporteIncidente` con orden `solo_alertas`. | **Pasa**. AST generado y visualizado correctamente. |
| **TC-03** | `REGISTRAR { INCIDENTE: accidente EN puente_sur PRIORIDAD alta ACCION llamar_policia ALERTA: desviar EN puente_sur; }` | Sintáctica / AST | Válido. Genera AST de tipo `ReporteIncidente` con orden `acciones_alertas`. | **Pasa**. AST generado y visualizado correctamente. |
| **TC-04** | `REGISTRAR { INCIDENTE: accidente EN puente_sur PRIORIDAD alta ALERTA: desviar EN puente_sur ACCION llamar_policia; }` | Sintáctica / AST | Válido. Genera AST de tipo `ReporteIncidente` con orden `alertas_acciones`. | **Pasa**. AST generado y visualizado correctamente. |
| **TC-05** | `REGISTRAR { ALERTA: cerrar_acceso EN acceso_resistencia; }` | Sintáctica / AST | Válido. Genera AST de tipo `ReporteAlerta` como instrucción independiente. | **Pasa**. AST generado y visualizado correctamente. |
| **TC-06** | `REGISTRAR { INCIDENTE: ovni EN puente_sur PRIORIDAD alta ACCION llamar_policia; }` | Semántica | **Error semántico** en línea 3: El tipo de incidente 'ovni' no es válido. | **Pasa**. Se detiene el análisis y se emite el error semántico detallado de manera correcta. |
| **TC-07** | `REGISTRAR { INCIDENTE: accidente EN puente_oeste PRIORIDAD alta ACCION llamar_policia; }` | Semántica | **Error semántico**: La ubicación 'puente_oeste' no es válida. | **Pasa**. Se emite el error semántico con detalle de línea y columna. |
| **TC-08** | `REGISTRAR { INCIDENTE: accidente EN puente_sur PRIORIDAD super_alta ACCION llamar_policia; }` | Semántica | **Error semántico**: El nivel de prioridad 'super_alta' no es válido. | **Pasa**. Se emite el error semántico de prioridad de forma correcta. |
| **TC-09** | `REGISTRAR { INCIDENTE: accidente EN puente_sur PRIORIDAD alta ACCION llamar_policia Y llamar_ambulancia; }` | Léxica / Sintáctica | **Error léxico/sintáctico**: El token 'Y' ya no es válido, se esperan comas `,`. | **Pasa**. Se detecta y detiene con error sintáctico al procesar el token inválido. |

---

## Visualización del AST (Abstract Syntax Tree)

El AST estructurado jerárquicamente se representa mediante nodos de TypeScript de la siguiente manera:

*   **`ProgramaNode`**: Nodo raíz que contiene un arreglo de `instrucciones`.
*   **`ReporteIncidenteNode`**: Representa un reporte de incidente. Contiene `tipoIncidente`, `ubicacion`, `prioridad` (cuyos valores han sido validados semánticamente) y un nodo `RespuestaNode`.
*   **`ReporteAlertaNode`**: Representa una alerta individual, ya sea autónoma o parte de la respuesta a un incidente. Contiene `notificacion` y `ubicacion`.
*   **`RespuestaNode`**: Contiene la lista de alertas (`ReporteAlertaNode[]`), la lista de acciones recomendadas (`string[]`) y el `orden` de aparición para conservar la semántica del flujo original.
