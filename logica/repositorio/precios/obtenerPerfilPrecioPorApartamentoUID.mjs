import { conexion } from "../../componentes/db.mjs";

export const obtenerPerfilPrecioPorApartamentoUID = async (apartamentoIDV) => {
    try {
        const consulta =`
        SELECT 
        * 
        FROM "preciosApartamentos"
        WHERE "apartamentoIDV" = $1`
        const resuelve = await conexion.query(consulta, [apartamentoIDV]);
        if (resuelve.rowCount === 0) {
            const error = "No hay ningun perfil de precio de este apartamento en el sistema, vuelva a crear al configuracion de alojamiento.";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        const error = "Error en el adaptador obtenerCamasPorHabitacion"
        throw new Error(error)
    }

}