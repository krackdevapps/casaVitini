import { conexion } from "../../../../componentes/db.mjs";


export const obtenerReembolsosPorPagoUIDPorReembolsoUIDPasarela = async (data) => {
    try {
        const pagoUID = data.pagoUID
        const reembolsoUIDPasarela = data.reembolsoUIDPasarela

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
            "pagoUID" = $1
             AND 
            "reembolsoUIDPasarela" = $2;`;
        const parametros = [
            pagoUID,
            reembolsoUIDPasarela
        ]

        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No existe ningún reembolso con ese pagoUID y con ese Identificador de reeembolso de pasarela";
            throw new Error(error);
        }
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

