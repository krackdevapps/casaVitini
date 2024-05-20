import { conexion } from "../../componentes/db.mjs";

export const obtenerBloqueoPorBloqueoUID = async (data) => {
    try {

        const apartamentoIDV = data.apartamentoIDV
        const bloqueoUID = data.bloqueoUID
      
        const consulta = `
        SELECT
        uid,
        to_char(entrada, 'DD/MM/YYYY') as entrada, 
        to_char(salida, 'DD/MM/YYYY') as salida, 
        "apartamentoIDV",
        "tipoBloqueo",
        motivo,
        zona
        FROM 
        "bloqueosApartamentos"
        WHERE 
        "apartamentoIDV" = $1 
        AND 
        "bloqueoUID" = $2;`;

        const parametros = [
            apartamentoIDV,
            bloqueoUID
        ];
        const resuelve = await conexion.query(consulta, parametros)
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}