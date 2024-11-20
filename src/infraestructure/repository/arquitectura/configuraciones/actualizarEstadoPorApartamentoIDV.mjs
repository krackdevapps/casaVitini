import { conexion } from "../../globales/db.mjs";

export const actualizarEstadoPorApartamentoIDV = async (data) => {
    try {
        const nuevoEstado = data.nuevoEstado
        const apartamentoIDV = data.apartamentoIDV

        const consulta = `
        UPDATE "configuracionApartamento"
        SET "estadoConfiguracionIDV" = $1::"tipo_estadosIDV"
        WHERE "apartamentoIDV" = $2
        RETURNING 
        *;
        `
        const resuelve = await conexion.query(consulta, [nuevoEstado, apartamentoIDV]);
        if (resuelve.rowCount === 0) {
            const error = "No existe ningún apartamento con el identificador visual, por lo tanto, no se puede actualizar el estado.";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}