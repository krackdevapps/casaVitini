import { conexion } from "../globales/db.mjs";
export const obtenerEnlaceDePagoPorEnlaceUID = async (enlaceUID) => {
    try {
        const consulta = `
            SELECT
            "nombreEnlace", 
            codigo, 
            "reservaUID",
            "estadoPagoIDV",
            TO_CHAR("fechaCaducidad" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS "fechaCaducidad"
            FROM "enlacesDePago"
            WHERE "enlaceUID" = $1;`;
        const resuelve = await conexion.query(consulta, [enlaceUID]);
        if (resuelve.rowCount === 0) {
            const error = "No se ha podido obtener ningún enlace de pago con ese enlaceUID";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

