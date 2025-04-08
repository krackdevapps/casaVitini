import { conexion } from "../../../globales/db.mjs";

export const eliminarFechaPorPuestaPorApartamentoIDV = async (data) => {
    try {
        const apartamentoIDV = data.apartamentoIDV

        const consulta = `
            DELETE FROM protocolos."fechasPostPuestasParaRevision"
            WHERE
            "apartamentoIDV" = $1
        `;

        const resuelve = await conexion.query(consulta, [apartamentoIDV]);
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}