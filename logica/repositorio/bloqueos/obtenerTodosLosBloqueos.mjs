import { conexion } from "../../componentes/db.mjs";

export const obtenerTodosLosBloqueos = async () => {
    try {

        const consulta = `
        SELECT
        "bloqueoUID",
        to_char("fechaInicio", 'DD/MM/YYYY') as "fechaInicio", 
        to_char("fechaFin", 'DD/MM/YYYY') as "fechaFin", 
        "apartamentoIDV",
        "tipoBloqueoIDV"
        FROM 
        "bloqueosApartamentos";`;
        const resuelve = await conexion.query(consulta)
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}