# Gramática del Lenguaje de Monitoreo de Incidentes Viales (BNF)

```bnf
<Programa> ::= "REGISTRAR" "{" <ListaInstrucciones> "}"

<ListaInstrucciones> ::= <Instruccion> <ListaInstrucciones>
                       | <Instruccion>

<Instruccion> ::= <ReporteIncidente>
                | <ReporteAlerta>

<ReporteIncidente> ::= "INCIDENTE" ":" <TipoIncidente>
                       "EN" <Ubicacion>
                       "PRIORIDAD" <NivelPrioridad>
                       <Respuesta> ";"

<Respuesta> ::= <ReporteAlerta>
              | <AccionRespuesta>
              | <ListaAlertas> <AccionRespuesta>
              | <AccionRespuesta> <ListaAlertas>

<AccionRespuesta> ::= "ACCION" <ListaAcciones>

<ListaAlertas> ::= <ReporteAlerta>
                 | <ReporteAlerta> <ListaAlertas>

<ListaAcciones> ::= <Accion_recomendada>
                  | <Accion_recomendada> "," <ListaAcciones>

<ReporteAlerta> ::= "ALERTA" ":" <Notificacion> "EN" <Ubicacion>

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


