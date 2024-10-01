import { conexion } from "../globales/db.mjs";
export const obtenerEnlaceDePagoPorReservaUID = async (reservaUID) => {
    try {

        const consulta = `
            SELECT
            "enlaceUID",
            "nombreEnlace", 
            codigo,
            cantidad,
            descripcion,
            "reservaUID",
            "estadoPagoIDV",
            TO_CHAR("fechaCaducidad" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS fechaCaducidad
            FROM "enlacesDePago"
            WHERE "reservaUID" = $1;`;
        const resuelve = await conexion.query(consulta, [reservaUID]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

