import { conexion } from "../../componentes/db.mjs";

export const obtenerPerfilPrecioPorApartamentoUID = async (apartamentoIDV) => {
    try {
        const consulta =`
        SELECT 
        * 
        FROM "preciosApartamentos"
        WHERE apartamento = $1`
        const resuelve = await conexion.query(consulta, [apartamentoIDV]);
        return resuelve.rows
    } catch (errorAdaptador) {
        const error = "Error en el adaptador obtenerCamasPorHabitacion"
        throw new Error(error)
    }

}