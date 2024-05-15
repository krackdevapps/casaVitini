import { conexion } from "../../componentes/db.mjs";
export const obtenerEnlaceDePagoPorEnlaceUID = async (enlaceUID) => {
    try {
        const consulta = `
            SELECT
            "nombreEnlace", 
            codigo, 
            reserva,
            cantidad,
            "estadoPago",
            TO_CHAR(caducidad AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS fechaCaducidad_ISO
            FROM "enlacesDePago"
            WHERE "enlaceUID" = $1;`;
        const resuelve = await conexion.query(consulta, [enlaceUID]);
        if (resuelve.rowCount === 0) {
            const error = "No se ha podido obtener ningun enlace de pago con ese enlaceUID";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (error) {
        throw error
    }
}

