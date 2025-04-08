import { conexion } from "../../../globales/db.mjs";

export const actualizaFechaPosPuestaPorApartamentoIDV = async (data) => {
    try {
        const apartamentoIDV = data.apartamentoIDV
        const fechaPosPuesta = data.fechaPosPuesta


        const consultaPreEliminar = `
            DELETE FROM protocolos."fechasPostPuestasParaRevision"
            WHERE
            "apartamentoIDV" = $1
        `;
        await conexion.query(consultaPreEliminar, [apartamentoIDV]);

        const consulta = `
        INSERT INTO protocolos."fechasPostPuestasParaRevision" (
        "apartamentoIDV",
        "fechaPostPuesta"
        ) VALUES ($1, $2);
        `;
        const parametros = [
            apartamentoIDV,
            fechaPosPuesta
        ]
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}