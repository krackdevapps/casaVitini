import { conexion } from "../../../globales/db.mjs"

export const eliminarCaracteristicasDelApartamentoPorApartamentoIDV = async (apartamentoIDV) => {
    try {

        const consulta = `
        DELETE FROM "apartamentosCaracteristicas"
        WHERE 
        "apartamentoIDV" = $1
        RETURNING
        *
        `;
        const resuelve = await conexion.query(consulta, [apartamentoIDV])
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}