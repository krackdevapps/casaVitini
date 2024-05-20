import { conexion } from "../../componentes/db.mjs";

export const obtenerSessionesActivasPorUsuario = async (usuarioIDX) => {

    try {
        const consulta = `
        SELECT 
        sid AS "sessionIDX",
        to_char(expire, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "caducidadUTC",
        sess->> 'ip' AS ip,
        sess->> 'userAgent' AS "userAgent"
        FROM sessiones
        WHERE sess->> 'usuario' = $1;
        `;

        const resuelve = await conexion.query(consulta, [usuarioIDX])
        return resuelve.rows
    } catch (error) {
        throw error;
    }
};
