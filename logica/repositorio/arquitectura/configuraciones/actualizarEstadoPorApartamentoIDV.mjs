import { conexion } from "../../../componentes/db.mjs";

export const actualizarEstadoPorApartamentoIDV = async (data) => {
    try {
        const nuevoEstado = data.nuevoEstado
        const apartamentoIDV = data.apartamentoIDV

        const consulta = `
        UPDATE "configuracionApartamento"
        SET "estadoConfiguracionIDV" = $1
        WHERE "apartamentoIDV" = $2
        RETURNING 
        *;
        `
        const resuelve = await conexion.query(consulta, [nuevoEstado, apartamentoIDV]);
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}