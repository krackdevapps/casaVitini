import { conexion } from "../../../componentes/db.mjs"

export const obtenerTodosEnlaceDePago = async () => {
    try {
        const consulta = `
            SELECT
            "nombreEnlace", 
            codigo, 
            reserva,
            descripcion,
            cantidad,
            "estadoPago",
            TO_CHAR(caducidad AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS fechaCaducidad_ISO
            FROM "enlacesDePago";`;
        const resuelve = await conexion.query(consulta);
        return resuelve.rows
    } catch (error) {
        throw error
    }
}

