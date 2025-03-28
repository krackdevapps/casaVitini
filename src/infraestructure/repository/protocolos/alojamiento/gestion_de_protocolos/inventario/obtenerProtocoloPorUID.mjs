import { conexion } from "../../../../globales/db.mjs";

export const obtenerProtocoloPorUID = async (uid) => {
    try {
        const consulta = `
        SELECT
        *,
        (
            SELECT
            nombre
            FROM
            public."inventarioGeneral"
            WHERE
            protocolos."inventarioAlojamiento"."elementoUID" = public."inventarioGeneral"."UID"

        ) as nombre
        FROM
        protocolos."inventarioAlojamiento"
        WHERE
        uid = $1;
        `;
        const resuelve = await conexion.query(consulta, [uid]);
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }

}