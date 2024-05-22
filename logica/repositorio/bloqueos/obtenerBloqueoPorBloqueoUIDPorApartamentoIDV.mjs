import { conexion } from "../../componentes/db.mjs";

export const obtenerBloqueoPorBloqueoUIDPorApartamentoIDV = async (data) => {
    try {

        const apartamentoIDV = data.apartamentoIDV
        const bloqueoUID = data.bloqueoUID
      
        const consulta = `
        SELECT
        to_char("fechaInicio", 'DD/MM/YYYY') as "fechaInicio", 
        to_char("fechaFin", 'DD/MM/YYYY') as "fechaFin", 
        "apartamentoIDV",
        "tipoBloqueoIDV",
        motivo,
        "zonaIDV"
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