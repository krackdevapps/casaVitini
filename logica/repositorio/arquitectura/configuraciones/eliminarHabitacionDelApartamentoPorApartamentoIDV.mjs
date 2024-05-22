import { conexion } from "../../../componentes/db.mjs";

export const eliminarHabitacionDelApartamentoPorApartamentoIDV = async (habitacionUID) => {
    try {
        const consulta =  `
        DELETE FROM "configuracionHabitacionesDelApartamento"
        WHERE
        "apartamentoIDV" = $1
        ;`;
        const resuelve = await conexion.query(consulta, [habitacionUID]);
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}