import { conexion } from "../../../componentes/db.mjs";

export const eliminarCamaDeLaHabitacionPorCamaUID = async (camaUID) => {
    try {

        const consulta =`
        DELETE FROM "configuracionCamasEnHabitacion"
        WHERE "componenteUID" = $1
        RETURNING *;`;
        const resuelve = await conexion.query(consulta, [camaUID])
        return resuelve.rows[0] 
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}