import { conexion } from "../../../componentes/db.mjs";

export const eliminarHabitacionDelApartamentoPorApartamentoUID = async (habitacionUID) => {
    try {
        const consulta = `
        DELETE FROM "configuracionHabitacionesDelApartamento"
        WHERE
        "componenteUID" = $1
        RETURNING 
        *
        ;`;
        const resuelve = await conexion.query(consulta, [habitacionUID]);
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}