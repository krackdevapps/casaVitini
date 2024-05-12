import { conexion } from "../../componentes/db.mjs";

export const actualizarEstadoPorApartamentoIDV = async (data) => {
    try {
        const nuevoEstado = data.nuevoEstado
        const apartamentoIDV = data.apartamentoIDV

        const consulta = `
        UPDATE "configuracionApartamento"
        SET "estadoConfiguracion" = $1
        WHERE "apartamentoIDV" = $2;
        `
        await conexion.query(consulta, [nuevoEstado, apartamentoIDV]);
    } catch (errorAdaptador) {
        const error = "Error en el adaptador actualizarEstadoPorApartamentoIDV"
        throw new Error(error)
    }

}