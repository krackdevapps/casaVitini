import { conexion } from "../../componentes/db.mjs";

export const eliminarCamaDeLaHabitacionPorCamaUID = async (camaUID) => {
    try {

        const consulta =`
        DELETE FROM "configuracionCamasEnHabitacion"
        WHERE uid = $1;
        `;
        const resuelve = await conexion.query(consulta, [camaUID])
        return resuelve.rows[0] 
    } catch (errorAdaptador) {
        const error = "Error en el adaptador eliminarCamaDeLaHabitacionPorCamaUID"
        throw new Error(error)
    }

}