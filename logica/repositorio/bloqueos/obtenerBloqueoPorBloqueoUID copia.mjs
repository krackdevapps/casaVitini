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
        apartamento,
        "tipoBloqueo",
        motivo,
        zona
        FROM "bloqueosApartamentos"
        WHERE apartamento = $1 AND uid = $2;`;

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