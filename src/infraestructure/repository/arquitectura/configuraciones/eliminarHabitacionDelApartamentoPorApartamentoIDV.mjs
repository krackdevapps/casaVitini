import { conexion } from "../../globales/db.mjs";

export const eliminarHabitacionDelApartamentoPorApartamentoIDV = async (apartamentoIDV) => {
    try {
        const consulta = `
        DELETE FROM "configuracionHabitacionesDelApartamento"
        WHERE
        "apartamentoIDV" = $1
        RETURNING 
        *
        ;`;
        const resuelve = await conexion.query(consulta, [apartamentoIDV]);
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}