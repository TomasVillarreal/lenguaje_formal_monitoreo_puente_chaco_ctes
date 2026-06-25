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