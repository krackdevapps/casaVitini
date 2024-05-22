import { conexion } from "../../../componentes/db.mjs";

export const obtenerHabitacionDelApartamentoPorHabitacionUID = async (habitacionUID) => {

    try {
        const consulta = `
            SELECT 
            *
            FROM "configuracionHabitacionesDelApartamento"
            WHERE "componenteUID" = $1;
            `;
        const resuelve = await conexion.query(consulta, [habitacionUID]);
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}