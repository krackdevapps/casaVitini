import { conexion } from "../../../../globales/db.mjs";

export const obtenerProtocolosPorApartamentoIDV = async (apartamentoIDV) => {
    try {
        const consulta = `
        SELECT
        uid,
        "apartamentoIDV",
        "elementoUID",
        (
            SELECT nombre FROM public."inventarioGeneral"
            WHERE public."inventarioGeneral"."UID" = protocolos."inventarioAlojamiento"."elementoUID"
        ) as nombre,
        "cantidad_enAlojamiento",
        posicion,
        COUNT(*) OVER() as "totalPosiciones"
        FROM
        protocolos."inventarioAlojamiento"
        WHERE
        "apartamentoIDV" = $1;
        `;
        const resuelve = await conexion.query(consulta, [apartamentoIDV]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }

}