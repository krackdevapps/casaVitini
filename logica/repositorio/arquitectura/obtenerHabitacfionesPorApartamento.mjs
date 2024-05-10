import { conexion } from "../../componentes/db.mjs";

export const obtenerHabitacionesPorApartamento = async (habitacionUID) => {

    try {
        const consulta = `
            SELECT 
            habitacion, apartamento
            FROM "configuracionHabitacionesDelApartamento"
            WHERE uid = $1;
            `;
        const resuelve = await conexion.query(consulta, [habitacionUID]);
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}