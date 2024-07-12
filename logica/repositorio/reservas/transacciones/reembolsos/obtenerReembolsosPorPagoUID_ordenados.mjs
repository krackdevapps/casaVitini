import { conexion } from "../../../../componentes/db.mjs";

export const obtenerReembolsosPorPagoUID_ordenados = async (pagoUID) => {
    try {

        const consulta = `
        SELECT
            "reembolsoUID",
            cantidad,
            "plataformaDePagoIDV",
            "reembolsoUIDPasarela",
            "estadoIDV",
            to_char("fechaCreacion", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "fechaCreacionUTC_ISO", 
            to_char("fechaActualizacion", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "fechaActualizacionUTC_ISO"
        FROM 
            "reservaReembolsos"
        WHERE 
            "pagoUID" = $1
        ORDER BY
            "reembolsoUID" DESC;`;

        const resuelve = await conexion.query(consulta, [pagoUID]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

