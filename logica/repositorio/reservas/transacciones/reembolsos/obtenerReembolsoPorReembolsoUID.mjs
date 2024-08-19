import { conexion } from "../../../../componentes/db.mjs";

export const obtenerReembolsoPorReembolsoUID = async (reembolsoUID) => {
    try {

        const consulta = `
        SELECT
            "pagoUID",
            cantidad,
            "plataformaDePagoIDV",
            "reembolsoUIDPasarela",
            "estadoIDV",
            "fechaCreacion"::text AS "fechaCreacion",
            "fechaActualizacion"::text AS "fechaActualizacion"
        FROM 
            "reservaReembolsos"
        WHERE 
            "reembolsoUID" = $1;`;

        const resuelve = await conexion.query(consulta, [reembolsoUID]);
        if (resuelve.rowCount === 0) {
            const error = "No existe ningún reembolso con ese reembolsoUID";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

