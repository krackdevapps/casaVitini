import { conexion } from "../../../componentes/db.mjs";

export const eliminarCamaDeLaHabitacionPorCamaUID = async (camaUID) => {
    try {

        const consulta =`
        DELETE FROM "configuracionCamasEnHabitacion"
        WHERE "componenteUID" = $1
        RETURNING *;`;
        const resuelve = await conexion.query(consulta, [camaUID])
        if (resuelve.rowCount === 0) {
            const error = "No existe la cama que quieres eliminar.";
            throw new Error(error);
        }
        return resuelve.rows[0] 
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}