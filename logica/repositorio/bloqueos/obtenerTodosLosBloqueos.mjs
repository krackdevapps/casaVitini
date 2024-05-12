import { conexion } from "../../componentes/db.mjs";

export const obtenerTodosLosBloqueos = async (apartmamentoIDV) => {
    try {

        const consulta = `
        SELECT
        uid,
        to_char(entrada, 'DD/MM/YYYY') as entrada, 
        to_char(salida, 'DD/MM/YYYY') as salida, 
        apartamento,
        "tipoBloqueo"
        FROM "bloqueosApartamentos";`;
        const resuelve = await conexion.query(consulta, [apartmamentoIDV])
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}