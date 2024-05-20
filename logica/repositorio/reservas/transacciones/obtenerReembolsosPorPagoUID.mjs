import { conexion } from "../../../componentes/db.mjs"

export const obtenerReembolsosPorPagoUID = async (pagoUID) => {
    try {

        const consulta = `
        SELECT
            "reembolsoUID",
            cantidad,
            "plataformaDePago",
            "reembolsoUIDPasarela",
            "estadoIDV",
            to_char("fechaCreacion", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "fechaCreacionUTC_ISO", 
            to_char("fechaActualizacion", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "fechaActualizacionUTC_ISO"
        FROM 
            "reservaReembolsos"
        WHERE 
            "pagoUID" = $1;`

        const resuelve = await conexion.query(consulta, [pagoUID]);
        if (resuelve.rowCount === 0) {
            const error = "No existe ningún reembolso con ese pagoUID";
            throw new Error(error);
        }
        return resuelve.rows
    } catch (error) {
        throw error
    }
}

