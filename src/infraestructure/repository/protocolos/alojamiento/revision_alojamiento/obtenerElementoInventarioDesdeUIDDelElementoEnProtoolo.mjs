import { conexion } from "../../../globales/db.mjs";

export const obtenerElementoInventarioDesdeUIDDelElementoEnProtoolo = async (uid) => {
   
    try {
        
        const consulta = `
        SELECT
        "elementoUID",
            (
            SELECT
            nombre
            FROM
            public."inventarioGeneral"
            WHERE
            public."inventarioGeneral"."UID" = protocolos."inventarioAlojamiento"."elementoUID"
            ) as "nombre",
            (
            SELECT
            cantidad
            FROM
            public."inventarioGeneral"
            WHERE
            public."inventarioGeneral"."UID" = protocolos."inventarioAlojamiento"."elementoUID"
            ) as cantidad
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