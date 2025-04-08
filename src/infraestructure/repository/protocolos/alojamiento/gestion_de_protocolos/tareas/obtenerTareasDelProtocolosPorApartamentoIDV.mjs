import { conexion } from "../../../../globales/db.mjs";

export const obtenerTareasDelProtocolosPorApartamentoIDV = async (apartamentoIDV) => {
    try {
        const consulta = `
        SELECT
        uid,
        "apartamentoIDV",
        "tareaUI",
        "tipoDiasIDV",
        posicion,
        COUNT(*) OVER() as "totalPosiciones"
        FROM
        protocolos."tareasAlojamiento"
        WHERE
        "apartamentoIDV" = $1;
        `;
        const resuelve = await conexion.query(consulta, [apartamentoIDV]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}