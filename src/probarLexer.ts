import { lexer } from './lexer'

// --- EJEMPLO 1: Sintaxis Válida Actual (Usando comas ",") ---
const codigoValido = `
REGISTRAR {
  INCIDENTE: accidente EN puente_sur PRIORIDAD alta
  ACCION llamar_policia, llamar_ambulancia
  ALERTA: desviar EN puente_sur, ALERTA: evacuar EN acceso_corrientes;

INCIDENTE: congestion EN acceso_corrientes PRIORIDAD media
ALERTA: reducir_velocidad EN puente_norte
ACCION llamar_gendarmeria;

ALERTA: cerrar_acceso EN acceso_resistencia;
}
`

const tokens = lexer(codigoValido)

console.log('=== TOKENS CON SINTAXIS VÁLIDA (COMAS) ===')
console.log(tokens)

// --- EJEMPLO CON "Y" (SINTAXIS ANTIGUA) ---
const codigoConY = `
REGISTRAR {
  INCIDENTE: accidente EN puente_sur PRIORIDAD alta
  ACCION llamar_policia Y llamar_ambulancia;
}
`
console.log('\n=== TOKENS DE EJEMPLO CON "Y" (ERROR LÉXICO) ===')
console.log(lexer(codigoConY))

