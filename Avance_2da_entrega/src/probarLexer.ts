import { lexer } from './lexer'

const codigo = `
REGISTRAR {
INCIDENTE: accidente EN puente_sur PRIORIDAD alta
ACCION llamar_policia Y llamar_ambulancia
ALERTA: desviar EN puente_sur Y ALERTA: evacuar EN acceso_corrientes;

INCIDENTE: congestion EN acceso_corrientes PRIORIDAD media
ALERTA: reducir_velocidad EN puente_norte
ACCION llamar_gendarmeria;

ALERTA: cerrar_acceso EN acceso_resistencia;
}
`

const tokens = lexer(codigo)

console.log(tokens)